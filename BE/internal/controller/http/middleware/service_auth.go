package middleware

// Service login for trusted internal tools (the Claude connector).
//
// A request that carries the header  X-CoreSync-Service-Key: <secret>  is treated as coming from ONE
// fixed CoreSync user (CoreSync_SERVICE_CLERK_USER_ID). That user's role is read from Clerk, exactly like
// a normal login, so RoleAuthMiddleware, the audit log and every business rule apply unchanged.
// Changing or removing that user's role in Clerk changes or removes the connector's access.
//
// Settings (all required for the service login to work; if any is missing it is switched off):
//   CoreSync_SERVICE_KEY            long random secret shared with the connector (min 32 characters)
//   CoreSync_SERVICE_CLERK_USER_ID  Clerk user ID of the "Claude Assistant" user (user_...)
//   CoreSync_SERVICE_ALLOWED_IPS    optional, comma-separated client IPs allowed to use the key
//                               (e.g. 127.0.0.1 when the connector runs on the same server)
//
// The optional header X-CoreSync-Requested-By (e.g. "eranja") names the person who asked Claude for
// the change; it is added to the audit log description.

import (
	"crypto/subtle"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	ServiceKeyHeader      = "X-CoreSync-Service-Key"
	RequestedByHeader     = "X-CoreSync-Requested-By"
	ContextKeyRequestedBy = "requested_by"
	minServiceKeyLength   = 32
	serviceRoleCacheTTL   = 5 * time.Minute
)

var (
	requesterPattern = regexp.MustCompile(`[^A-Za-z0-9 ._-]`)
	serviceRoleCache struct {
		sync.Mutex
		user    *AuthenticatedUser
		fetched time.Time
	}
)

// serviceKeyMatches reports whether the presented key equals the configured one.
// It is false when no key is configured or the configured key is too short.
func serviceKeyMatches(presented, configured string) bool {
	if len(configured) < minServiceKeyLength || presented == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(presented), []byte(configured)) == 1
}

// ipAllowed reports whether ip is in the comma-separated allow list (empty list = any IP).
func ipAllowed(ip, allowList string) bool {
	allowList = strings.TrimSpace(allowList)
	if allowList == "" {
		return true
	}
	for _, a := range strings.Split(allowList, ",") {
		if strings.TrimSpace(a) == ip {
			return true
		}
	}
	return false
}

// cleanRequester keeps a short, safe name for the audit log.
func cleanRequester(s string) string {
	s = strings.TrimSpace(requesterPattern.ReplaceAllString(s, ""))
	if len(s) > 40 {
		s = s[:40]
	}
	return s
}

// serviceUser returns the configured service user with its current role from Clerk (cached briefly).
func serviceUser(c *gin.Context, clerkUserID string) (*AuthenticatedUser, error) {
	serviceRoleCache.Lock()
	defer serviceRoleCache.Unlock()
	if serviceRoleCache.user != nil && serviceRoleCache.user.ID == clerkUserID &&
		time.Since(serviceRoleCache.fetched) < serviceRoleCacheTTL {
		return serviceRoleCache.user, nil
	}
	cu, err := GetUserFromClerkAPI(c.Request.Context(), os.Getenv("CLERK_SECRET_KEY"), clerkUserID)
	if err != nil {
		return nil, err
	}
	u := &AuthenticatedUser{ID: clerkUserID}
	if len(cu.EmailAddresses) > 0 {
		u.Email = cu.EmailAddresses[0].EmailAddress
	}
	if r, ok := cu.PublicMetadata["role"].(string); ok {
		u.Role = r
	}
	serviceRoleCache.user, serviceRoleCache.fetched = u, time.Now()
	return u, nil
}

// handleServiceLogin is called at the start of ClerkAuthMiddleware.
// It returns true when the request was handled here (authenticated or rejected),
// and false when the request has no service key and should go through normal Clerk login.
func handleServiceLogin(c *gin.Context) bool {
	presented := c.GetHeader(ServiceKeyHeader)
	if presented == "" {
		return false
	}
	configured := os.Getenv("CoreSync_SERVICE_KEY")
	clerkUserID := os.Getenv("CoreSync_SERVICE_CLERK_USER_ID")
	if clerkUserID == "" || !serviceKeyMatches(presented, configured) ||
		!ipAllowed(c.ClientIP(), os.Getenv("CoreSync_SERVICE_ALLOWED_IPS")) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid service credentials"})
		return true
	}
	user, err := serviceUser(c, clerkUserID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve service user"})
		return true
	}
	if user.Role == "" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Service user has no role"})
		return true
	}
	if rb := cleanRequester(c.GetHeader(RequestedByHeader)); rb != "" {
		c.Set(ContextKeyRequestedBy, rb)
	}
	c.Set(ContextKeyAuthenticatedUser, user)
	c.Set("user_id", user.ID)
	c.Next()
	return true
}
