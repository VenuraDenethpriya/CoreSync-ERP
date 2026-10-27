package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestServiceKeyMatches(t *testing.T) {
	long := strings.Repeat("k", minServiceKeyLength)
	cases := []struct {
		name                  string
		presented, configured string
		want                  bool
	}{
		{"match", long, long, true},
		{"mismatch", long + "x", long, false},
		{"empty presented", "", long, false},
		{"configured too short", "short", "short", false},
		{"nothing configured", long, "", false},
	}
	for _, tc := range cases {
		if got := serviceKeyMatches(tc.presented, tc.configured); got != tc.want {
			t.Errorf("%s: got %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestIPAllowed(t *testing.T) {
	if !ipAllowed("10.0.0.1", "") {
		t.Error("empty allow list should allow any IP")
	}
	if !ipAllowed("127.0.0.1", "10.0.0.1, 127.0.0.1") {
		t.Error("listed IP should be allowed")
	}
	if ipAllowed("10.0.0.2", "127.0.0.1") {
		t.Error("unlisted IP should be rejected")
	}
}

func TestCleanRequester(t *testing.T) {
	if got := cleanRequester("  Eranja <script>\n"); got != "Eranja script" {
		t.Errorf("got %q", got)
	}
	if got := cleanRequester(strings.Repeat("a", 60)); len(got) != 40 {
		t.Errorf("expected truncation to 40, got %d", len(got))
	}
}

func TestHandleServiceLogin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	key := strings.Repeat("s", minServiceKeyLength)
	t.Setenv("CoreSync_SERVICE_KEY", key)
	t.Setenv("CoreSync_SERVICE_CLERK_USER_ID", "user_test")
	t.Setenv("CoreSync_SERVICE_ALLOWED_IPS", "")

	run := func(header string) (handled bool, status int) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
		if header != "" {
			c.Request.Header.Set(ServiceKeyHeader, header)
		}
		return handleServiceLogin(c), w.Code
	}

	if handled, _ := run(""); handled {
		t.Error("request without service key must fall through to Clerk login")
	}
	if handled, status := run("wrong-key-wrong-key-wrong-key-wrong"); !handled || status != http.StatusUnauthorized {
		t.Errorf("wrong key: handled=%v status=%d, want handled 401", handled, status)
	}

	t.Setenv("CoreSync_SERVICE_CLERK_USER_ID", "")
	if handled, status := run(key); !handled || status != http.StatusUnauthorized {
		t.Errorf("missing user id: handled=%v status=%d, want handled 401", handled, status)
	}
}
