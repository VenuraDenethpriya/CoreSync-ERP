// [ADDED 2026-10-13] Unit tests for the inventory-control rules (no database).
package stockcontrol

import (
	"testing"
	"time"
)

func TestLowLevelUsesTheBiggestBOMNeed(t *testing.T) {
	needs := []BomNeed{{"24V-eco", 8}, {"48V-vault", 16}, {"ebike", 4}}
	if got := LowLevel(needs, 10); got != 160 {
		t.Fatalf("low level = %d, want 160 (16 per pack x 10 packs)", got)
	}
	if got := LowLevel(nil, 10); got != 0 {
		t.Fatalf("item in no BOM must have low level 0, got %d", got)
	}
}

func TestAutoPRQuantity(t *testing.T) {
	if q := AutoPRQuantity(200, 160, 320); q != 0 {
		t.Fatalf("not low: want 0, got %d", q)
	}
	if q := AutoPRQuantity(100, 160, 320); q != 220 {
		t.Fatalf("low: order up to the reorder level, want 220, got %d", q)
	}
	if q := AutoPRQuantity(-20, 160, 320); q != 340 {
		t.Fatalf("over-reserved: want 340, got %d", q)
	}
}

func TestManualPRStatus(t *testing.T) {
	if st, err := ManualPRStatus(true, ""); err != nil || st != PRApproved {
		t.Fatalf("low item: straight to Approved, got %q %v", st, err)
	}
	if _, err := ManualPRStatus(false, "  "); err == nil || !IsRuleError(err) {
		t.Fatal("not low without a reason must be refused")
	}
	if st, _ := ManualPRStatus(false, "new 72V design needs 2 extra BMS"); st != PRPendingApproval {
		t.Fatalf("not low with reason: Pending Approval, got %q", st)
	}
}

func TestPRHold(t *testing.T) {
	t.Setenv("STOCK_COUNT_START_DAY", "")
	d := func(day int) time.Time { return time.Date(2026, 10, day, 10, 0, 0, 0, time.UTC) }
	if hold, _ := PRHold(d(10), CountState{}, false, 0); hold {
		t.Fatal("10th, nothing open: no hold")
	}
	if hold, _ := PRHold(d(10), CountState{}, true, 0); !hold {
		t.Fatal("open count: hold")
	}
	if hold, _ := PRHold(d(26), CountState{}, false, 0); !hold {
		t.Fatal("26th, count not done: hold")
	}
	if hold, _ := PRHold(d(26), CountState{Month: "2026-10", Status: "OPEN"}, true, 0); !hold {
		t.Fatal("26th, count open: hold")
	}
	if hold, _ := PRHold(d(28), CountState{Month: "2026-10", Status: "CLOSED"}, false, 2); !hold {
		t.Fatal("28th, count closed but 2 reports wait for Eranja: still on hold")
	}
	if hold, _ := PRHold(d(28), CountState{Month: "2026-10", Status: "CLOSED"}, false, 0); hold {
		t.Fatal("28th, count closed and everything approved: released")
	}
	if hold, _ := PRHold(d(10), CountState{}, false, 1); !hold {
		t.Fatal("mid-month shortage report waiting: hold")
	}
}

func TestSplitTakesCheckedFirst(t *testing.T) {
	c, w, s := Split(16, 10, 30)
	if c != 10 || w != 6 || s != 0 {
		t.Fatalf("got %d/%d/%d, want 10 checked, 6 warehouse, 0 short", c, w, s)
	}
	c, w, s = Split(16, 0, 12)
	if c != 0 || w != 12 || s != 4 {
		t.Fatalf("got %d/%d/%d, want 0/12/4 short", c, w, s)
	}
	if c, w, s = Split(0, 5, 5); c+w+s != 0 {
		t.Fatal("nothing needed")
	}
}

func TestCanCloseCount(t *testing.T) {
	n := func(v int) *int { return &v }
	if err := CanCloseCount([]CountLine{{ItemCode: "R13B", SystemQty: 950}}); err == nil {
		t.Fatal("uncounted line must block")
	}
	if err := CanCloseCount([]CountLine{{ItemCode: "R13B", SystemQty: 950, CountedQty: n(940)}}); err == nil {
		t.Fatal("difference without Admin comment must block")
	}
	if err := CanCloseCount([]CountLine{
		{ItemCode: "R13B", SystemQty: 950, CountedQty: n(940), Comment: "10 cells damaged in pack SN-1"},
		{ItemCode: "BMS", SystemQty: 5, CountedQty: n(5)},
	}); err != nil {
		t.Fatalf("all counted and commented: %v", err)
	}
}

func TestValidateOrderEdit(t *testing.T) {
	if err := ValidateOrderEdit("", "Placed", "Received", 1, 2, 1, 2); err != nil {
		t.Fatal("old stock orders are not affected")
	}
	if err := ValidateOrderEdit(PRTypeManual, PRApproved, PRPaid, 0, 0, 0, 0); err == nil {
		t.Fatal("Paid can only be set by the Finance Head action")
	}
	if err := ValidateOrderEdit(PRTypeManual, PRApproved, "shipped", 0, 0, 0, 0); err == nil {
		t.Fatal("shipped before paid must be refused")
	}
	if err := ValidateOrderEdit(PRTypeManual, PRPaid, "shipped", 0, 0, 0, 0); err != nil {
		t.Fatalf("paid -> shipped allowed: %v", err)
	}
	if err := ValidateOrderEdit(PRTypeAuto, PRApproved, "", 100, 120, 0, 0); err == nil {
		t.Fatal("quantity change after approval must be refused")
	}
	if err := ValidateOrderEdit(PRTypeAuto, PRApproved, "", 100, 0, 5000, 0); err != nil {
		t.Fatalf("status-only edits send 0s and must pass: %v", err)
	}
	if err := CanDeleteOrder(PRTypeManual, PRPaid); err == nil {
		t.Fatal("paid PR cannot be deleted")
	}
}

func TestApprovers(t *testing.T) {
	t.Setenv("STOCK_APPROVER_CLERK_IDS", "")
	if !CanApprove("user_x", "SUPER_ADMIN") || CanApprove("user_x", "HEAD") {
		t.Fatal("without a list: Super Admins only")
	}
	t.Setenv("STOCK_APPROVER_CLERK_IDS", "user_eranja")
	if CanApprove("user_x", "SUPER_ADMIN") || !CanApprove("user_eranja", "HEAD") {
		t.Fatal("with a list: only the listed users")
	}
	if !IsAdmin("HEAD") || !IsAdmin("super_admin") || IsAdmin("INVENTORY_MANAGER") {
		t.Fatal("Admins = HEAD + SUPER_ADMIN")
	}
}
