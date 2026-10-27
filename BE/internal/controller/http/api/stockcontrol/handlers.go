// [ADDED 2026-10-13] Inventory controls API handlers (thin: all rules live in service/stockcontrol).
package stockcontrol

import (
	"strconv"

	"CoreSync-backend/internal/controller/http/common"
	sc "CoreSync-backend/internal/service/stockcontrol"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func idParam(c *gin.Context) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		common.ValidationError(c, err)
		return uuid.Nil, false
	}
	return id, true
}

func optUUID(s string) *uuid.UUID {
	if id, err := uuid.Parse(s); err == nil {
		return &id
	}
	return nil
}

func intQuery(c *gin.Context, name string, def int) int {
	if v, err := strconv.Atoi(c.Query(name)); err == nil {
		return v
	}
	return def
}

// ---------------------------------------------------------------- status & stock

func (h *Handler) Status(c *gin.Context) {
	hold, reason, err := h.svc.HoldStatus(c.Request.Context())
	if err != nil {
		fail(c, err)
		return
	}
	id, role := actor(c)
	ok(c, "", gin.H{
		"enabled":         sc.Enabled(),
		"pr_on_hold":      hold,
		"hold_reason":     reason,
		"low_level_packs": sc.LowLevelPacks(),
		"reorder_packs":   sc.ReorderPacks(),
		"count_start_day": sc.CountStartDay(),
		"can_approve":     sc.CanApprove(id, role),
		"is_admin":        sc.IsAdmin(role),
	})
}

func (h *Handler) Stock(c *gin.Context) {
	rows, err := h.svc.ListStock(c.Request.Context(), c.Query("query"))
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"items": rows})
}

func (h *Handler) Ledger(c *gin.Context) {
	rows, err := h.svc.ListLedger(c.Request.Context(), optUUID(c.Query("inventory_id")), optUUID(c.Query("source_id")),
		intQuery(c, "limit", 50), intQuery(c, "offset", 0))
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"items": rows})
}

func (h *Handler) FinishedPacks(c *gin.Context) {
	rows, err := h.svc.FinishedPacks(c.Request.Context())
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"items": rows})
}

func (h *Handler) Check(c *gin.Context) {
	var req struct {
		InventoryID uuid.UUID `json:"inventory_id" binding:"required"`
		Quantity    int       `json:"quantity" binding:"required"`
		Method      string    `json:"method" binding:"required"` // BARCODE | BATCH | BIN | MANUAL
		Code        string    `json:"code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	if err := h.svc.Check(c.Request.Context(), req.InventoryID, req.Quantity, req.Method, req.Code, who); err != nil {
		fail(c, err)
		return
	}
	ok(c, "Goods checked", gin.H{"checked": req.Quantity})
}

// ---------------------------------------------------------------- purchase requests

func (h *Handler) ListPRs(c *gin.Context) {
	rows, total, err := h.svc.ListPRs(c.Request.Context(), c.Query("status"), c.Query("query"), intQuery(c, "limit", 50), intQuery(c, "offset", 0))
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"items": rows, "total": total})
}

func (h *Handler) GetPR(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	pr, err := h.svc.GetPR(c.Request.Context(), id)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", pr)
}

func (h *Handler) CreatePR(c *gin.Context) {
	var in sc.CreatePRInput
	if err := c.ShouldBindJSON(&in); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	pr, err := h.svc.CreatePR(c.Request.Context(), in, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Purchase request "+pr.OrderNo+" created ("+pr.Status+")", pr)
}

func (h *Handler) SubmitPR(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var req struct {
		Quantity *int     `json:"quantity"`
		Amount   *float64 `json:"amount"`
	}
	_ = c.ShouldBindJSON(&req)
	who, _ := actor(c)
	pr, err := h.svc.SubmitPR(c.Request.Context(), id, req.Quantity, req.Amount, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Purchase request "+pr.OrderNo+" submitted", pr)
}

func (h *Handler) ApprovePR(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	who, role := actor(c)
	if !sc.CanApprove(who, role) {
		forbid(c, "only Eranja can approve manual purchase requests")
		return
	}
	pr, err := h.svc.ApprovePR(c.Request.Context(), id, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Purchase request "+pr.OrderNo+" approved", pr)
}

func (h *Handler) RejectPR(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&req)
	who, role := actor(c)
	if !sc.CanApprove(who, role) && !sc.IsAdmin(role) {
		forbid(c, "only Eranja or an Admin can reject a purchase request")
		return
	}
	pr, err := h.svc.RejectPR(c.Request.Context(), id, trimmed(req.Reason), who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Purchase request "+pr.OrderNo+" rejected", pr)
}

func (h *Handler) MarkPaid(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	who, _ := actor(c)
	pr, err := h.svc.MarkPaid(c.Request.Context(), id, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Purchase request "+pr.OrderNo+" marked paid", pr)
}

func (h *Handler) Receive(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var in sc.ReceiveInput
	if err := c.ShouldBindJSON(&in); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	pr, err := h.svc.Receive(c.Request.Context(), id, in, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Goods received for "+pr.OrderNo, pr)
}

func (h *Handler) RunLowLevel(c *gin.Context) {
	who, _ := actor(c)
	res, err := h.svc.RunLowLevel(c.Request.Context(), who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Low-level check run", res)
}

// ---------------------------------------------------------------- excess / shortage

func (h *Handler) ListDiscrepancies(c *gin.Context) {
	rows, err := h.svc.ListDiscrepancies(c.Request.Context(), c.Query("status"))
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"items": rows})
}

func (h *Handler) ReportDiscrepancy(c *gin.Context) {
	var req struct {
		InventoryID uuid.UUID `json:"inventory_id" binding:"required"`
		Quantity    int       `json:"quantity" binding:"required"`
		Explanation string    `json:"explanation" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	if err := h.svc.ReportDiscrepancy(c.Request.Context(), req.InventoryID, req.Quantity, req.Explanation, who); err != nil {
		fail(c, err)
		return
	}
	ok(c, "Excess/shortage reported", gin.H{})
}

func (h *Handler) CommentDiscrepancy(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var req struct {
		Comment string `json:"comment" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	if err := h.svc.CommentDiscrepancy(c.Request.Context(), id, req.Comment, who); err != nil {
		fail(c, err)
		return
	}
	ok(c, "Excess/shortage commented", gin.H{})
}

func (h *Handler) decide(c *gin.Context, approve bool) {
	id, good := idParam(c)
	if !good {
		return
	}
	who, role := actor(c)
	if !sc.CanApprove(who, role) {
		forbid(c, "only Eranja can decide on excess/shortage reports")
		return
	}
	if err := h.svc.DecideDiscrepancy(c.Request.Context(), id, approve, who); err != nil {
		fail(c, err)
		return
	}
	word := "rejected"
	if approve {
		word = "approved"
	}
	ok(c, "Excess/shortage "+word, gin.H{})
}

func (h *Handler) ApproveDiscrepancy(c *gin.Context) { h.decide(c, true) }
func (h *Handler) RejectDiscrepancy(c *gin.Context)  { h.decide(c, false) }

// ---------------------------------------------------------------- month-end count

func (h *Handler) CurrentCount(c *gin.Context) {
	cnt, err := h.svc.CurrentCount(c.Request.Context())
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{"count": cnt})
}

func (h *Handler) OpenCount(c *gin.Context) {
	who, _ := actor(c)
	cnt, err := h.svc.OpenCount(c.Request.Context(), who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Month-end count opened", gin.H{"count": cnt})
}

func (h *Handler) EnterCount(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var req struct {
		CountedQty *int `json:"counted_qty" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	if err := h.svc.EnterCount(c.Request.Context(), id, *req.CountedQty, who); err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{})
}

func (h *Handler) CommentCountLine(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	var req struct {
		Comment string `json:"comment" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	who, _ := actor(c)
	if err := h.svc.CommentCountLine(c.Request.Context(), id, req.Comment, who); err != nil {
		fail(c, err)
		return
	}
	ok(c, "", gin.H{})
}

func (h *Handler) CloseCount(c *gin.Context) {
	id, good := idParam(c)
	if !good {
		return
	}
	who, _ := actor(c)
	cnt, err := h.svc.CloseCount(c.Request.Context(), id, who)
	if err != nil {
		fail(c, err)
		return
	}
	ok(c, "Month-end count closed", gin.H{"count": cnt})
}
