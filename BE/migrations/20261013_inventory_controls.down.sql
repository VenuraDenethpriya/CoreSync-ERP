-- [ADDED 2026-10-13] Undo 20261013_inventory_controls.up.sql. Drops the new history tables.
BEGIN;
DROP TABLE IF EXISTS stock_count_lines;
DROP TABLE IF EXISTS stock_counts;
DROP TABLE IF EXISTS stock_discrepancies;
DROP TABLE IF EXISTS stock_ledger;
DROP TABLE IF EXISTS pack_bom_lines;
DROP TABLE IF EXISTS stock_receipts;
ALTER TABLE inventory_orders DROP COLUMN IF EXISTS paid_qty_open, DROP COLUMN IF EXISTS paid_at, DROP COLUMN IF EXISTS paid_by,
  DROP COLUMN IF EXISTS rejected_reason, DROP COLUMN IF EXISTS approved_at, DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS purchase_photos, DROP COLUMN IF EXISTS supplier, DROP COLUMN IF EXISTS reason,
  DROP COLUMN IF EXISTS pr_type, DROP COLUMN IF EXISTS inventory_id;
ALTER TABLE inventory DROP COLUMN IF EXISTS low_level, DROP COLUMN IF EXISTS qty_checked, DROP COLUMN IF EXISTS qty_paid;
COMMIT;
