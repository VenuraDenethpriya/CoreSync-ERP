// [ADDED 2026-10-13] Inventory controls API: /api/v1/stock-control/...
//
// Roles (agreed with Eranja 13 Oct 2026; "second upper users" = Admins (HEAD) and Super Admins):
//
//	raise a purchase request ........ SUPER_ADMIN, HEAD, INVENTORY_MANAGER
//	submit an automatic draft ....... SUPER_ADMIN, HEAD
//	approve a manual PR / a report .. STOCK_APPROVER_CLERK_IDS (Eranja), else any SUPER_ADMIN
//	mark a PR paid .................. FINANCE_HEAD, SUPER_ADMIN
//	receive goods, check goods ...... WAREHOUSE_STAFF, INVENTORY_MANAGER, HEAD, SUPER_ADMIN
//	month-end count: count .......... WAREHOUSE_STAFF, INVENTORY_MANAGER, HEAD, SUPER_ADMIN
//	month-end count: comment, close . SUPER_ADMIN, HEAD
package stockcontrol

import (
	"net/http"
	"strings"

	"CoreSync-backend/internal/controller/http/common"
	roles "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	sc "CoreSync-backend/internal/service/stockcontrol"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *sc.Service
}

func NewHandler(svc *sc.Service) *Handler { return &Handler{svc: svc} }

func r(list ...roles.Role) gin.HandlerFunc {
	s := make([]string, len(list))
	for i, x := range list {
		s[i] = string(x)
	}
	return middleware.RoleAuthMiddleware(s...)
}

func SetupRoutes(router *gin.RouterGroup, h *Handler, auditSvc auditlogs.Service) {
	g := router.Group("/stock-control", middleware.ClerkAuthMiddleware())
	audit := middleware.AuditMiddleware(auditSvc)

	view := r(roles.SUPER_ADMIN, roles.HEAD, roles.INVENTORY_MANAGER, roles.WAREHOUSE_STAFF, roles.OFFICE_STAFF, roles.FINANCE_HEAD, roles.READ_ONLY)
	admins := r(roles.SUPER_ADMIN, roles.HEAD)
	raisers := r(roles.SUPER_ADMIN, roles.HEAD, roles.INVENTORY_MANAGER)
	finance := r(roles.FINANCE_HEAD, roles.SUPER_ADMIN)
	store := r(roles.SUPER_ADMIN, roles.HEAD, roles.INVENTORY_MANAGER, roles.WAREHOUSE_STAFF)

	g.GET("/status", view, h.Status)
	g.GET("/stock", view, h.Stock)
	g.GET("/ledger", view, h.Ledger)
	g.GET("/finished-packs", view, h.FinishedPacks)
	g.POST("/check", store, h.Check, audit)

	g.GET("/purchase-requests", view, h.ListPRs)
	g.GET("/purchase-requests/:id", view, h.GetPR)
	g.POST("/purchase-requests", raisers, h.CreatePR, audit)
	g.POST("/purchase-requests/:id/submit", admins, h.SubmitPR, audit)
	g.POST("/purchase-requests/:id/approve", h.ApprovePR, audit) // approver checked inside
	g.POST("/purchase-requests/:id/reject", h.RejectPR, audit)   // approver or Admin, checked inside
	g.POST("/purchase-requests/:id/paid", finance, h.MarkPaid, audit)
	g.POST("/purchase-requests/:id/receive", store, h.Receive, audit)
	g.POST("/low-level/run", admins, h.RunLowLevel, audit)

	g.GET("/discrepancies", view, h.ListDiscrepancies)
	g.POST("/discrepancies", admins, h.ReportDiscrepancy, audit)
	g.POST("/discrepancies/:id/comment", admins, h.CommentDiscrepancy, audit)
	g.POST("/discrepancies/:id/approve", h.ApproveDiscrepancy, audit)
	g.POST("/discrepancies/:id/reject", h.RejectDiscrepancy, audit)

	g.GET("/counts/current", view, h.CurrentCount)
	g.POST("/counts", store, h.OpenCount, audit)
	g.PUT("/counts/lines/:id", store, h.EnterCount, audit)
	g.POST("/counts/lines/:id/comment", admins, h.CommentCountLine, audit)
	g.POST("/counts/:id/close", admins, h.CloseCount, audit)
}

// BlockWhenEnabled refuses an old manual endpoint once INVENTORY_CONTROLS_ENABLED=true.
// Used on manual allocation, manual usage, manual restock and the old order/receive endpoints.
func BlockWhenEnabled(what string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if sc.Enabled() {
			c.AbortWithStatusJSON(http.StatusConflict, common.NewErrorResponse(0, []string{
				what + " is switched off: stock now moves only through purchase requests, packs and approved adjustments"}))
			return
		}
		c.Next()
	}
}

// ---------------------------------------------------------------- helpers

func actor(c *gin.Context) (string, string) {
	if v, ok := c.Get(middleware.ContextKeyAuthenticatedUser); ok {
		if u, ok := v.(*middleware.AuthenticatedUser); ok {
			return u.ID, u.Role
		}
	}
	return c.GetString("user_id"), ""
}

func fail(c *gin.Context, err error) {
	if sc.IsRuleError(err) {
		c.JSON(http.StatusConflict, common.NewErrorResponse(0, []string{err.Error()}))
		return
	}
	common.HandleError(c, err)
}

func ok(c *gin.Context, what string, data any) {
	if what != "" {
		id, _ := actor(c)
		common.SetAuditInfo(c, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": what},
			Description: what + " (stock control, by " + id + ")",
		})
	}
	common.HandleSuccess(c, common.StatusOK, data)
}

func forbid(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": msg})
}

func trimmed(s string) string { return strings.TCoreSyncpace(s) }
