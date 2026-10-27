// [ADDED 2026-10-13] End-to-end test of the inventory controls against PostgreSQL.
//
// Skipped unless STOCK_TEST_DATABASE_URL points at an EMPTY test database:
//
//	STOCK_TEST_DATABASE_URL="postgres://postgres:pw@localhost:5432/CoreSync_test?sslmode=disable" \
//	  go test ./internal/service/stockcontrol/ -run DB -v
//
// It builds minimal copies of the CoreSync tables it touches in a schema "stockcontrol_test",
// runs the real migration (twice), and drops the schema afterwards. Never use live data.
package stockcontrol

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"testing"
	"time"

	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func testDB(t *testing.T) *gorm.DB {
	dsn := os.Getenv("STOCK_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("STOCK_TEST_DATABASE_URL not set")
	}
	logger.SetupDefaultLogger()
	quiet := &gorm.Config{Logger: gormlogger.Default.LogMode(gormlogger.Silent)}
	admin, err := gorm.Open(postgres.Open(dsn), quiet)
	if err != nil {
		t.Fatal(err)
	}
	admin.Exec(`DROP SCHEMA IF EXISTS stockcontrol_test CASCADE`)
	if err := admin.Exec(`CREATE SCHEMA stockcontrol_test`).Error; err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { admin.Exec(`DROP SCHEMA IF EXISTS stockcontrol_test CASCADE`) })
	sep := "?"
	if strings.Contains(dsn, "?") {
		sep = "&"
	}
	db, err := gorm.Open(postgres.Open(dsn+sep+"search_path=stockcontrol_test"), quiet)
	if err != nil {
		t.Fatal(err)
	}
	for _, q := range []string{
		`CREATE TABLE users (clerk_id varchar PRIMARY KEY, first_name text, last_name text)`,
		`CREATE TABLE products (product_id uuid PRIMARY KEY, name varchar(100), category text)`,
		`CREATE TABLE inventory (id uuid PRIMARY KEY, item_code varchar(100) NOT NULL, item_name varchar(100) NOT NULL,
			quantity_in_stock int NOT NULL DEFAULT 0, hold decimal(10,2) NOT NULL DEFAULT 0, unit_cost decimal(10,2) NOT NULL DEFAULT 0,
			threshold decimal(10,2) NOT NULL DEFAULT 0, status varchar(100) NOT NULL DEFAULT 'In Stock', product_id uuid,
			created_by text, created_at timestamptz DEFAULT now(), updated_at timestamptz)`,
		`CREATE TABLE inventory_orders (id uuid PRIMARY KEY, order_no varchar(255), item_code varchar(100) NOT NULL, item_name varchar(100) NOT NULL,
			order_quantity int NOT NULL DEFAULT 0, quantity int NOT NULL DEFAULT 0, amount decimal(10,2) NOT NULL DEFAULT 0,
			status varchar(100) NOT NULL DEFAULT 'Placed', order_date varchar(255), created_by text, created_at timestamptz, updated_at timestamptz)`,
		`CREATE TABLE boms (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid, inventory_id uuid, quantity int)`,
		`CREATE TABLE orders (order_id uuid PRIMARY KEY, order_status text)`,
		`CREATE TABLE order_items (id uuid PRIMARY KEY, order_no uuid, product_id uuid, quantity int, status text, serial_no text)`,
		`CREATE TABLE inventory_item_allocation (id uuid PRIMARY KEY, item_id uuid, order_id uuid, pack_id uuid, count int NOT NULL,
			allocator text, created_at timestamptz)`,
	} {
		if err := db.Exec(q).Error; err != nil {
			t.Fatalf("%v\n%s", err, q)
		}
	}
	_, here, _, _ := runtime.Caller(0)
	up, err := os.ReadFile(filepath.Join(filepath.Dir(here), "../../../migrations/20261013_inventory_controls.up.sql"))
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ { // the migration must be safe to run twice
		if err := db.Exec(string(up)).Error; err != nil {
			t.Fatalf("migration run %d: %v", i+1, err)
		}
	}
	return db
}

// fakeReceiver does what the existing receiving logic does to the columns this test reads.
func fakeReceiver(ctx context.Context, tx *gorm.DB, req *dto.CreateInventoryFromOrderRequest) (*domain.Inventory, error) {
	if err := tx.Exec(`UPDATE inventory SET quantity_in_stock = quantity_in_stock + ? WHERE item_code = ? AND item_name = ?`,
		req.Quantity, req.ItemCode, req.ItemName).Error; err != nil {
		return nil, err
	}
	return &domain.Inventory{ItemCode: req.ItemCode}, tx.Exec(`UPDATE inventory_orders SET quantity = quantity + ? WHERE id = ?`, req.Quantity, req.OrderID).Error
}

type fixture struct {
	t  *testing.T
	db *gorm.DB
}

func (f fixture) exec(q string, args ...any) {
	f.t.Helper()
	if err := f.db.Exec(q, args...).Error; err != nil {
		f.t.Fatalf("%v\n%s", err, q)
	}
}

func (f fixture) item(id uuid.UUID) StockRow {
	f.t.Helper()
	var it StockRow
	if err := f.db.Raw(`SELECT id, item_code, item_name, quantity_in_stock, qty_paid, qty_checked, hold, low_level, unit_cost FROM inventory WHERE id = ?`, id).Scan(&it).Error; err != nil {
		f.t.Fatal(err)
	}
	return it
}

func must(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

func TestDBInventoryControls(t *testing.T) {
	db := testDB(t)
	f := fixture{t, db}
	ctx := context.Background()
	t.Setenv("INVENTORY_CONTROLS_ENABLED", "true")
	t.Setenv("STOCK_APPROVER_CLERK_IDS", "")
	svc := NewService(db, fakeReceiver)
	var mu sync.Mutex
	var mails []string
	svc.SetMailer(func(subject, html string) error {
		mu.Lock()
		defer mu.Unlock()
		mails = append(mails, subject)
		return nil
	})
	sentMail := func(prefix string) bool {
		time.Sleep(50 * time.Millisecond) // emails go out in the background
		mu.Lock()
		defer mu.Unlock()
		for _, m := range mails {
			if strings.HasPrefix(m, prefix) {
				return true
			}
		}
		return false
	}
	day := 10
	svc.now = func() time.Time { return time.Date(2026, 10, day, 9, 0, 0, 0, time.UTC) }

	cell, bms, pack := uuid.New(), uuid.New(), uuid.New()
	f.exec(`INSERT INTO users VALUES ('user_ws','Workshop','Manager')`)
	f.exec(`INSERT INTO products VALUES (?, '24V 132Ah Eco Cell Pack', 'BATTERY_PACK')`, pack)
	f.exec(`INSERT INTO inventory (id, item_code, item_name, quantity_in_stock, unit_cost) VALUES (?, 'R13B', 'REPT 132.5Ah cell', 100, 9000), (?, 'JK8S', 'JK BMS 8S', 10, 15000)`, cell, bms)
	f.exec(`INSERT INTO boms (product_id, inventory_id, quantity) VALUES (?, ?, 16), (?, ?, 1)`, pack, cell, pack, bms)

	// ---- low-level check: cell 100 free < 160 (16 x 10) -> draft for 320 - 100 = 220; BMS 10 = 10 -> none
	res, err := svc.RunLowLevel(ctx, "system")
	must(t, err)
	if len(res.DraftsMade) != 1 || res.DraftsMade[0] != "R13B" {
		t.Fatalf("drafts: %+v", res)
	}
	if it := f.item(cell); it.LowLevel != 160 {
		t.Fatalf("low level %d", it.LowLevel)
	}
	if res, _ := svc.RunLowLevel(ctx, "system"); len(res.DraftsMade) != 0 {
		t.Fatal("a second run must not draft again while one is open")
	}
	prs, _, err := svc.ListPRs(ctx, PRDraft, "", 10, 0)
	must(t, err)
	if len(prs) != 1 || prs[0].OrderQuantity != 220 {
		t.Fatalf("draft: %+v", prs)
	}
	draft := prs[0].ID

	// ---- Admin submits, Finance Head pays -> 220 in Paid
	if _, err := svc.MarkPaid(ctx, draft, "user_fin"); err == nil {
		t.Fatal("a draft cannot be paid")
	}
	_, err = svc.SubmitPR(ctx, draft, nil, nil, "user_admin")
	must(t, err)
	_, err = svc.MarkPaid(ctx, draft, "user_fin")
	must(t, err)
	if it := f.item(cell); it.QtyPaid != 220 {
		t.Fatalf("paid stage %d", it.QtyPaid)
	}

	// ---- goods arrive: photo required; partial then rest
	if _, err := svc.Receive(ctx, draft, ReceiveInput{Quantity: 200, ReceivedBy: "Tavisha"}, "user_ws"); err == nil || !IsRuleError(err) {
		t.Fatal("receipt without a photo must be refused")
	}
	pr, err := svc.Receive(ctx, draft, ReceiveInput{Quantity: 200, ReceivedBy: "Tavisha", GoodsPhotos: []string{"https://img/1.jpg"}}, "user_ws")
	must(t, err)
	if pr.Status != PRPaid || pr.ReceivedQty != 200 {
		t.Fatalf("partial receipt: %+v", pr)
	}
	pr, err = svc.Receive(ctx, draft, ReceiveInput{Quantity: 20, ReceivedBy: "Tavisha", GoodsPhotos: []string{"https://img/2.jpg"}}, "user_ws")
	must(t, err)
	if pr.Status != PRReceived || len(pr.Receipts) != 2 {
		t.Fatalf("full receipt: %+v", pr)
	}
	if it := f.item(cell); it.QtyPaid != 0 || it.QuantityInStock != 320 {
		t.Fatalf("after receipt: paid %d stock %d", it.QtyPaid, it.QuantityInStock)
	}

	// ---- manual PR: cell is not low any more -> needs a reason and Eranja; new item likewise
	if _, err := svc.CreatePR(ctx, CreatePRInput{InventoryID: &cell, Quantity: 50}, "user_ws"); err == nil {
		t.Fatal("not-low item without reason must be refused")
	}
	np, err := svc.CreatePR(ctx, CreatePRInput{NewItemCode: "SW72", NewItemName: "72V main switch", Quantity: 5, Amount: 25000, Reason: "new 72V e-bike design"}, "user_ws")
	must(t, err)
	if np.Status != PRPendingApproval {
		t.Fatalf("new item PR: %s", np.Status)
	}
	if !sentMail("CoreSync: purchase request " + np.OrderNo) {
		t.Fatal("Eranja must get an email for a PR waiting for approval")
	}
	np, err = svc.ApprovePR(ctx, np.ID, "user_eranja")
	must(t, err)
	if np.InventoryID == nil || np.Status != PRApproved {
		t.Fatalf("approval must add the new item: %+v", np)
	}

	// ---- pack created: BOM copied; a later BOM change does not affect it; materials reserved
	p1 := uuid.New()
	f.exec(`INSERT INTO order_items (id, product_id, quantity, status, serial_no) VALUES (?, ?, 1, 'Drafted', 'SN-000001')`, p1, pack)
	must(t, svc.SnapshotPackBOM(ctx, p1, pack, 1))
	f.exec(`INSERT INTO inventory_item_allocation (id, item_id, pack_id, count) VALUES (?, ?, ?, 16), (?, ?, ?, 1)`, uuid.New(), cell, p1, uuid.New(), bms, p1)
	f.exec(`UPDATE inventory SET hold = 16 WHERE id = ?`, cell)
	f.exec(`UPDATE inventory SET hold = 1 WHERE id = ?`, bms)
	f.exec(`UPDATE boms SET quantity = 20 WHERE inventory_id = ?`, cell)

	must(t, svc.Check(ctx, cell, 10, "BATCH", "BOX-7", "user_ws"))
	if err := svc.Check(ctx, cell, 1000, "BIN", "", "user_ws"); err == nil {
		t.Fatal("cannot check more than is in Warehouse")
	}

	// ---- pack Completed -> 16 cells out (10 checked + 6 warehouse), 1 BMS out, hold released
	f.exec(`UPDATE order_items SET status = 'Completed' WHERE id = ?`, p1)
	must(t, svc.OnPackChanged(ctx, p1, "user_ws"))
	must(t, svc.OnPackChanged(ctx, p1, "user_ws")) // twice: no double withdrawal
	c := f.item(cell)
	if c.QuantityInStock != 304 || c.QtyChecked != 0 || c.Hold != 0 {
		t.Fatalf("after completion: stock %d checked %d hold %.0f", c.QuantityInStock, c.QtyChecked, c.Hold)
	}
	if b := f.item(bms); b.QuantityInStock != 9 || b.Hold != 0 {
		t.Fatalf("bms after completion: %+v", b)
	}
	fin, err := svc.FinishedPacks(ctx)
	must(t, err)
	if len(fin) != 1 || fin[0].Packs != 1 {
		t.Fatalf("finished packs: %+v", fin)
	}

	// ---- moved back to In Progress -> reversed exactly, reserved again
	f.exec(`UPDATE order_items SET status = 'In Progress' WHERE id = ?`, p1)
	must(t, svc.OnPackChanged(ctx, p1, "user_ws"))
	c = f.item(cell)
	if c.QuantityInStock != 320 || c.QtyChecked != 10 || c.Hold != 16 {
		t.Fatalf("after reversal: stock %d checked %d hold %.0f", c.QuantityInStock, c.QtyChecked, c.Hold)
	}

	// ---- order Delivered (pack not marked Completed) -> completed and delivered in one go
	ord := uuid.New()
	f.exec(`INSERT INTO orders VALUES (?, 'Delivered')`, ord)
	f.exec(`UPDATE order_items SET order_no = ? WHERE id = ?`, ord, p1)
	must(t, svc.OnOrderChanged(ctx, ord, "user_sales"))
	must(t, svc.OnOrderChanged(ctx, ord, "user_sales"))
	var st string
	db.Raw(`SELECT status FROM order_items WHERE id = ?`, p1).Scan(&st)
	if st != PackDelivered {
		t.Fatalf("pack status %s", st)
	}
	if c = f.item(cell); c.QuantityInStock != 304 {
		t.Fatalf("delivered pack must have taken its BOM once: stock %d", c.QuantityInStock)
	}
	if fin, _ = svc.FinishedPacks(ctx); len(fin) != 0 {
		t.Fatalf("delivered pack left finished stock: %+v", fin)
	}

	// ---- a pack with not enough BMS -> takes what is there, shortage report raised
	f.exec(`UPDATE inventory SET quantity_in_stock = 0 WHERE id = ?`, bms)
	p2 := uuid.New()
	f.exec(`INSERT INTO order_items (id, product_id, quantity, status, serial_no) VALUES (?, ?, 1, 'Completed', 'SN-000002')`, p2, pack)
	must(t, svc.OnPackChanged(ctx, p2, "user_ws")) // made before the copy existed: copies today's BOM (20 cells)
	if c = f.item(cell); c.QuantityInStock != 284 {
		t.Fatalf("p2 uses today's BOM (20): stock %d", c.QuantityInStock)
	}
	ds, err := svc.ListDiscrepancies(ctx, "PENDING")
	must(t, err)
	if len(ds) != 1 || ds[0].Quantity != -1 || ds[0].SourceType != "PACK" {
		t.Fatalf("shortage report: %+v", ds)
	}
	packShort := ds[0].ID
	if !sentMail("CoreSync: shortage at pack completion") {
		t.Fatal("Eranja must get an email for a pack shortage")
	}
	if hold, msg, _ := svc.HoldStatus(ctx); !hold || !strings.Contains(msg, "Eranja") {
		t.Fatalf("a report waiting for Eranja must hold PRs and restocking: %v %q", hold, msg)
	}

	// ---- month-end: from the 25th PRs are on hold until the count is closed
	day = 26
	if hold, _, _ := svc.HoldStatus(ctx); !hold {
		t.Fatal("26th, no count: PRs must be on hold")
	}
	if _, err := svc.CreatePR(ctx, CreatePRInput{InventoryID: &bms, Quantity: 5}, "user_ws"); err == nil {
		t.Fatal("PR during hold must be refused")
	}
	cnt, err := svc.OpenCount(ctx, "user_sup")
	must(t, err)
	for _, l := range cnt.Lines {
		n := l.SystemQty
		if l.ItemCode == "R13B" {
			n = l.SystemQty - 4 // 4 cells missing
		}
		must(t, svc.EnterCount(ctx, l.ID, n, "user_sup"))
	}
	if _, err := svc.CloseCount(ctx, cnt.ID, "user_admin"); err == nil {
		t.Fatal("difference without an Admin comment must block closing")
	}
	for _, l := range cnt.Lines {
		if l.ItemCode == "R13B" {
			must(t, svc.CommentCountLine(ctx, l.ID, "4 cells failed QC, scrapped", "user_admin"))
		}
	}
	_, err = svc.CloseCount(ctx, cnt.ID, "user_admin")
	must(t, err)
	if !sentMail("CoreSync: month-end count differences") {
		t.Fatal("Eranja must get an email with the count differences")
	}
	if hold, _, _ := svc.HoldStatus(ctx); !hold {
		t.Fatal("closed count with differences waiting for Eranja: still on hold")
	}

	// ---- Eranja approves the count shortage -> stock balanced under a named adjustment
	ds, _ = svc.ListDiscrepancies(ctx, "PENDING")
	var countShort *Discrepancy
	for i := range ds {
		if ds[i].SourceType == "COUNT" {
			countShort = &ds[i]
		}
	}
	if countShort == nil || countShort.Quantity != -4 {
		t.Fatalf("count shortage report: %+v", ds)
	}
	must(t, svc.DecideDiscrepancy(ctx, countShort.ID, true, "user_eranja"))
	if c = f.item(cell); c.QuantityInStock != 280 {
		t.Fatalf("after approved shortage: %d", c.QuantityInStock)
	}
	var name string
	db.Raw(`SELECT name FROM stock_ledger WHERE source_id = ? AND reason = 'ADJUSTMENT' LIMIT 1`, countShort.ID).Scan(&name)
	if name != "Shortage - month-end count Oct 2026" {
		t.Fatalf("adjustment name %q", name)
	}
	if err := svc.DecideDiscrepancy(ctx, countShort.ID, true, "user_eranja"); err == nil {
		t.Fatal("cannot decide twice")
	}
	if _, err := svc.MarkPaid(ctx, np.ID, "user_fin"); err == nil || !IsRuleError(err) {
		t.Fatal("restocking must stay on hold while the pack shortage waits for Eranja")
	}
	must(t, svc.DecideDiscrepancy(ctx, packShort, true, "user_eranja"))
	if hold, msg, _ := svc.HoldStatus(ctx); hold {
		t.Fatalf("everything approved: PRs and restocking released, got %q", msg)
	}
	_, err = svc.MarkPaid(ctx, np.ID, "user_fin")
	must(t, err)

	// ---- ledger is readable
	rows, err := svc.ListLedger(ctx, &cell, nil, 100, 0)
	must(t, err)
	if len(rows) < 8 {
		t.Fatalf("ledger rows: %d", len(rows))
	}

	// ---- switched off: packs no longer touch stock
	t.Setenv("INVENTORY_CONTROLS_ENABLED", "")
	p3 := uuid.New()
	f.exec(`INSERT INTO order_items (id, product_id, quantity, status, serial_no) VALUES (?, ?, 1, 'Completed', 'SN-000003')`, p3, pack)
	must(t, svc.OnPackChanged(ctx, p3, "user_ws"))
	if c = f.item(cell); c.QuantityInStock != 280 {
		t.Fatal("controls off: no withdrawal")
	}
}
