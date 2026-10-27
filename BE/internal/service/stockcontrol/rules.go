// [ADDED 2026-10-13] Inventory controls: the business rules agreed by Eranja (13 Oct 2026),
// written as plain functions with no database so they can be unit tested.
// See REVIEW-inventory-controls.md and the requirements doc for the full rule list.
package stockcontrol

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Purchase request (PR) statuses. Older stock orders keep their old statuses
// (Placed, shipped, Customs, Action Needed, Received, Checked).
const (
	PRDraft           = "Draft"            // created by the low-level check, waiting for an Admin
	PRPendingApproval = "Pending Approval" // manual PR for an item that is not low: needs Eranja
	PRApproved        = "Approved"         // ready to be paid
	PRRejected        = "Rejected"
	PRPaid            = "Paid" // Finance Head paid it: quantity is in stage 1 (Paid)
	PRReceived        = "Received"

	PRTypeAuto   = "AUTO"
	PRTypeManual = "MANUAL"
)

// Pack statuses used by CoreSync (Orders -> Packs).
const (
	PackCompleted = "Completed"
	PackDelivered = "Delivered"
	PackCancelled = "Cancelled"

	OrderDelivered = "Delivered"
)

// RuleError is a business-rule refusal (shown to the user, HTTP 409), not a server fault.
type RuleError struct{ Msg string }

func (e *RuleError) Error() string { return e.Msg }

func refuse(format string, a ...any) error { return &RuleError{Msg: fmt.Sprintf(format, a...)} }

// IsRuleError tells handlers to answer 409 instead of 500.
func IsRuleError(err error) bool {
	var r *RuleError
	return errors.As(err, &r)
}

// ---------------------------------------------------------------- settings

// Enabled switches ON the enforcement: blocking manual allocation/usage/stock edits,
// automatic withdrawal on pack Completed / order Delivered, photos required on receipt.
// Purchase requests, reports and the count screens work either way.
func Enabled() bool {
	return strings.EqualFold(strings.TCoreSyncpace(os.Getenv("INVENTORY_CONTROLS_ENABLED")), "true")
}

func envInt(name string, def int) int {
	if v, err := strconv.Atoi(strings.TCoreSyncpace(os.Getenv(name))); err == nil && v > 0 {
		return v
	}
	return def
}

// LowLevelPacks: stock must cover this many of the pack that needs the most of an item (Eranja: 10).
func LowLevelPacks() int { return envInt("STOCK_LOW_LEVEL_PACKS", 10) }

// ReorderPacks: an automatic PR orders up to this many packs' worth (proposal: 20, editable by the Admin).
func ReorderPacks() int { return envInt("STOCK_REORDER_PACKS", 20) }

// CountStartDay: the month-end count opens on/after this day (Eranja: the 25th).
func CountStartDay() int { return envInt("STOCK_COUNT_START_DAY", 25) }

// Approvers: Clerk user IDs allowed to approve manual PRs and excess/shortage reports
// (Eranja). Empty = any Super Admin.
func Approvers() []string {
	var out []string
	for _, s := range strings.Split(os.Getenv("STOCK_APPROVER_CLERK_IDS"), ",") {
		if s = strings.TCoreSyncpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}

// CanApprove: Eranja's approvals (manual PRs, excess/shortage).
func CanApprove(clerkID, role string) bool {
	if list := Approvers(); len(list) > 0 {
		for _, id := range list {
			if id == clerkID {
				return true
			}
		}
		return false
	}
	return strings.EqualFold(role, "SUPER_ADMIN")
}

// IsAdmin: "second upper users" = Admins (CoreSync role HEAD) and Super Admins.
func IsAdmin(role string) bool {
	return strings.EqualFold(role, "SUPER_ADMIN") || strings.EqualFold(role, "HEAD")
}

// ---------------------------------------------------------------- low level

// BomNeed is how many of one stock item one pack of a product needs.
type BomNeed struct {
	ProductID string
	PerPack   int
}

// LowLevel = packs x the largest per-pack need of any product (Eranja: "the pack that needs the
// maximum amount of each good ... sufficient for 10 such packs"). Units follow the BOM's unit.
func LowLevel(needs []BomNeed, packs int) int {
	max := 0
	for _, n := range needs {
		if n.PerPack > max {
			max = n.PerPack
		}
	}
	return max * packs
}

// Free stock counted against the low level: here + paid on the way + already requested,
// minus what is reserved for packs.
func FreeStock(inStock, paid, openRequested, hold int) int {
	return inStock + paid + openRequested - hold
}

// AutoPRQuantity: how much an automatic PR asks for; 0 = not low, no PR.
func AutoPRQuantity(free, lowLevel, reorderLevel int) int {
	if lowLevel <= 0 || free >= lowLevel {
		return 0
	}
	if reorderLevel < lowLevel {
		reorderLevel = lowLevel
	}
	return reorderLevel - free
}

// ManualPRStatus: a manual PR for an item already below its low level goes straight to
// Approved; otherwise (not low, or a new item) it needs Eranja's approval with a reason.
func ManualPRStatus(isLow bool, reason string) (string, error) {
	if isLow {
		return PRApproved, nil
	}
	if strings.TCoreSyncpace(reason) == "" {
		return "", refuse("this item is not below its low level: give a reason for the purchase request")
	}
	return PRPendingApproval, nil
}

// ---------------------------------------------------------------- month-end hold

// CountState is this month's count as stored ("" = not opened yet).
type CountState struct {
	Month  string // YYYY-MM
	Status string // OPEN | CLOSED | ""
}

// PRHold: purchase requests AND restocking (approve, pay, receive) are held
//   - while a count is open, and from the count start day until this month's count is closed
//     (Eranja: "until that happens all the PR generations should be hold"), and
//   - [CHANGED 2026-10-13] while any excess/shortage report waits for Eranja's approval
//     (Eranja: "until my approval happens in the last stage no pr should be made and all the
//     restocking process should be held").
func PRHold(now time.Time, thisMonth CountState, anyOpen bool, pendingReports int) (bool, string) {
	if anyOpen {
		return true, "a stock count is open: purchase requests and restocking are on hold until it is closed"
	}
	if now.Day() >= CountStartDay() && thisMonth.Status != "CLOSED" {
		return true, fmt.Sprintf("month-end stock count for %s is not done yet: purchase requests and restocking are on hold until it is closed", now.Format("Jan 2006"))
	}
	if pendingReports > 0 {
		return true, fmt.Sprintf("%d excess/shortage report(s) wait for Eranja's approval: purchase requests and restocking are on hold until approved", pendingReports)
	}
	return false, ""
}

// ---------------------------------------------------------------- withdrawal

// Split decides where a withdrawal comes from: Checked stock first, then Warehouse,
// and whatever is not there is a shortfall (recorded as a shortage report, not taken).
func Split(need, checked, inStock int) (fromChecked, fromWarehouse, shortfall int) {
	if need <= 0 {
		return 0, 0, 0
	}
	if checked < 0 {
		checked = 0
	}
	warehouse := inStock - checked
	if warehouse < 0 {
		warehouse = 0
	}
	fromChecked = min(need, checked)
	fromWarehouse = min(need-fromChecked, warehouse)
	shortfall = need - fromChecked - fromWarehouse
	return
}

// ---------------------------------------------------------------- count

// CountLine is one item on the month-end count sheet.
type CountLine struct {
	ItemCode   string
	SystemQty  int
	CountedQty *int
	Comment    string
}

// CanCloseCount: every item counted, and every difference commented on by an Admin.
func CanCloseCount(lines []CountLine) error {
	var notCounted, noComment []string
	for _, l := range lines {
		if l.CountedQty == nil {
			notCounted = append(notCounted, l.ItemCode)
			continue
		}
		if *l.CountedQty != l.SystemQty && strings.TCoreSyncpace(l.Comment) == "" {
			noComment = append(noComment, l.ItemCode)
		}
	}
	if len(notCounted) > 0 {
		return refuse("not counted yet: %s", short(notCounted))
	}
	if len(noComment) > 0 {
		return refuse("differences without an Admin comment: %s", short(noComment))
	}
	return nil
}

func short(list []string) string {
	if len(list) > 8 {
		return strings.Join(list[:8], ", ") + fmt.Sprintf(" and %d more", len(list)-8)
	}
	return strings.Join(list, ", ")
}

// AdjustmentName is the name an approved difference shows under in the stock history.
func AdjustmentName(qty int, source string, when time.Time) string {
	kind := "Excess"
	if qty < 0 {
		kind = "Shortage"
	}
	what := map[string]string{"COUNT": "month-end count", "PACK": "BOM / pack completion", "OTHER": "reported"}[source]
	if what == "" {
		what = strings.ToLower(source)
	}
	return fmt.Sprintf("%s - %s %s", kind, what, when.Format("Jan 2006"))
}

// ---------------------------------------------------------------- old screens

// prOnlyStatuses can only be set through the purchase request actions, never by the old
// Inventory -> Orders status menu.
var prOnlyStatuses = map[string]bool{PRDraft: true, PRPendingApproval: true, PRApproved: true, PRRejected: true, PRPaid: true, PRReceived: true}

// shippingStatuses are the old status menu values that may follow "Paid".
var shippingStatuses = map[string]bool{"shipped": true, "Customs": true, "Action Needed": true}

// ValidateOrderEdit guards the old PUT /inventory/orders for rows that are purchase requests.
// Old stock orders (prType == "") are not affected.
func ValidateOrderEdit(prType, oldStatus, newStatus string, oldQty, newQty int, oldAmount, newAmount float64) error {
	if prType == "" {
		return nil
	}
	if newStatus != "" && newStatus != oldStatus {
		if prOnlyStatuses[newStatus] {
			return refuse("status %q is set by the purchase request actions (approve, pay, receive), not here", newStatus)
		}
		paidOrShipping := oldStatus == PRPaid || shippingStatuses[oldStatus]
		receivedNote := oldStatus == PRReceived && (newStatus == "Checked" || newStatus == "Action Needed")
		if !receivedNote && !(paidOrShipping && shippingStatuses[newStatus]) {
			return refuse("a purchase request can only move to shipped, Customs or Action Needed after it is paid")
		}
	}
	// 0 = not sent (the old status menu sends only id + status; the old repository skips zeros)
	locked := oldStatus != PRDraft && oldStatus != PRPendingApproval
	if locked && ((newQty != 0 && newQty != oldQty) || (newAmount != 0 && newAmount != oldAmount)) {
		return refuse("quantity and amount cannot change after the purchase request is approved")
	}
	return nil
}

// CanDeleteOrder: a paid or received purchase request cannot be deleted (stock depends on it).
func CanDeleteOrder(prType, status string) error {
	if prType == "" {
		return nil
	}
	if status == PRPaid || status == PRReceived || shippingStatuses[status] {
		return refuse("a paid purchase request cannot be deleted")
	}
	return nil
}
