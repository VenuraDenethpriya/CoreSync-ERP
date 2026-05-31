package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	clerk "github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	"github.com/gin-gonic/gin"
)

var (
	ContextKeyClerkClaims       = "clerk_claims"
	ContextKeyAuthenticatedUser = "authenticated_user"
	ClerkAPIKey                 = os.Getenv("CLERK_API_KEY")
	ClerkAPIBaseURL             = os.Getenv("CLERK_API_URL")
)

type AuthenticatedUser struct {
	ID    string
	Email string
	Role  string
}

type ClerkUser struct {
	ID             string `json:"id"`
	EmailAddresses []struct {
		EmailAddress string `json:"email_address"`
	} `json:"email_addresses"`
	PublicMetadata map[string]interface{} `json:"public_metadata"`
}

type responseWriterInterceptor struct {
	gin.ResponseWriter
	statusCode int
}

func (r *responseWriterInterceptor) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func GetUserFromClerkAPI(ctx context.Context, apiKey, userID string) (*ClerkUser, error) {
	url := fmt.Sprintf("%s/users/%s", ClerkAPIBaseURL, userID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Clerk API returned status %d", resp.StatusCode)
	}

	var user ClerkUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func ClerkAuthMiddleware() gin.HandlerFunc {
	secretKey := os.Getenv("CLERK_SECRET_KEY")
	if secretKey == "" {
		// This should ideally be caught by the main function's check, but good for redundancy
		log.Println("ERROR: CLERK_SECRET_KEY is not set for ClerkAuthMiddleware.")
		panic("CLERK_SECRET_KEY not available for ClerkAuthMiddleware")
	}

	// Set the Clerk SDK's key for token verification
	clerk.SetKey(secretKey)

	return func(c *gin.Context) {
		log.Println("ClerkAuthMiddleware triggered")

		authHeader := c.Request.Header.Get("Authorization")
		log.Printf("Authorization header received: %s", authHeader)

		interceptor := &responseWriterInterceptor{
			ResponseWriter: c.Writer,
			statusCode:     http.StatusOK,
		}

		handler := clerkhttp.RequireHeaderAuthorization()(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c.Request = r
		}))

		handler.ServeHTTP(interceptor, c.Request)

		if interceptor.statusCode != http.StatusOK {
			log.Printf("Clerk handler returned non-OK status: %d", interceptor.statusCode)
			c.AbortWithStatus(interceptor.statusCode)
			return
		}

		claims, ok := clerk.SessionClaimsFromContext(c.Request.Context())
		if !ok {
			log.Println("Missing Clerk session claims after successful header authorization check.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session or claims missing"})
			return
		}

		clerkSecretKey := os.Getenv("CLERK_SECRET_KEY")
		if clerkSecretKey == "" {
			log.Println("CLERK_SECRET_KEY environment variable is not set for fetching user details.")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error: CLERK_SECRET_KEY missing"})
			return
		}

		user, err := GetUserFromClerkAPI(c.Request.Context(), clerkSecretKey, claims.Subject)

		log.Printf("Fetched Clerk user: %+v", user)
		if err != nil {
			log.Printf("Error fetching user from Clerk API: %v", err)

			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user details"})
			return
		}

		userEmail := ""
		userRole := ""

		if user != nil {
			if len(user.EmailAddresses) > 0 {
				userEmail = user.EmailAddresses[0].EmailAddress
			}
			if roleVal, exists := user.PublicMetadata["role"]; exists {
				if roleStr, ok := roleVal.(string); ok {
					userRole = roleStr
				}
			}
		}

		authUser := &AuthenticatedUser{
			ID:    claims.Subject,
			Email: userEmail,
			Role:  userRole,
		}

		c.Set(ContextKeyClerkClaims, claims)
		c.Set(ContextKeyAuthenticatedUser, authUser)
		c.Set("user_id", authUser.ID)
		c.Next()
	}
}

func RoleAuthMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser, exists := c.Get(ContextKeyAuthenticatedUser)
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}
		user, ok := authUser.(*AuthenticatedUser)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		for _, role := range requiredRoles {
			if strings.EqualFold(user.Role, role) {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
	}
}

func RequestLoggerMiddleware(excludePaths []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		for _, exclude := range excludePaths {
			if strings.HasPrefix(path, exclude) {
				c.Next()
				return
			}
		}

		interceptor := &responseWriterInterceptor{
			ResponseWriter: c.Writer,
			statusCode:     http.StatusOK,
		}
		c.Writer = interceptor

		log.Printf("Incoming Request: %s %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
		log.Printf("Outgoing Response: %s %s - Status: %d", c.Request.Method, c.Request.URL.Path, interceptor.statusCode)
	}
}
