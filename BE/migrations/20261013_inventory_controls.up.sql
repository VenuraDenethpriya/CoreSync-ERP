-- ===========================================================================
-- [ADDED 2026-10-13] Inventory controls: purchase requests, 3 stock stages,
-- automatic BOM withdrawal, excess/shortage reports, month-end count.
-- CoreSync has no AutoMigrate: run this once BEFORE deploying the new code.
--   psql "$DATABASE_URL" -f migrations/20261013_inventory_controls.up.sql
-- Safe to run twice. Undo: 20261013_inventory_controls.down.sql
-- Existing columns are not changed. inventory.quantity_in_stock keeps its meaning
-- (goods physically here = Warehouse + Checked), so existing screens keep working.
-- ===========================================================================
BEGIN;

-- 1) Stock stages on each stock item
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS qty_paid    integer NOT NULL DEFAULT 0;  -- stage 1: paid, not arrived
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS qty_checked integer NOT NULL DEFAULT 0;  -- stage 3: checked (part of quantity_in_stock)
-- stage 2 (Warehouse) = quantity_in_stock - qty_checked
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS low_level   integer NOT NULL DEFAULT 0;  -- 10 x the largest BOM need

-- 2) Purchase request fields on the existing stock orders (Inventory -> Orders)
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS inventory_id    uuid REFERENCES inventory(id) ON DELETE SET NULL;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS pr_type         varchar(10);    -- AUTO | MANUAL (NULL = old order)
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS reason          text;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS supplier        varchar(150);
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS purchase_photos jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS approved_by     varchar(100);
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS approved_at     timestamptz;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS rejected_reason text;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS paid_by         varchar(100);
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS paid_at         timestamptz;
ALTER TABLE inventory_orders ADD COLUMN IF NOT EXISTS paid_qty_open   integer NOT NULL DEFAULT 0; -- paid but not yet received

-- 3) Goods received against a purchase request (photos, who, when)
CREATE TABLE IF NOT EXISTS stock_receipts (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       uuid NOT NULL REFERENCES inventory_orders(id) ON DELETE CASCADE,
    inventory_id   uuid NOT NULL REFERENCES inventory(id),
    quantity       integer NOT NULL CHECK (quantity > 0),
    received_by    varchar(150) NOT NULL,
    goods_photos   jsonb NOT NULL DEFAULT '[]'::jsonb,
    item_photos    jsonb NOT NULL DEFAULT '[]'::jsonb,
    remark         text,
    created_by     varchar(100),
    created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_order ON stock_receipts (order_id);

-- 4) BOM copied onto each pack when it is created (later BOM edits do not change old packs)
CREATE TABLE IF NOT EXISTS pack_bom_lines (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id       uuid NOT NULL,               -- order_items.id
    product_id    uuid NOT NULL,
    inventory_id  uuid NOT NULL REFERENCES inventory(id),
    quantity      integer NOT NULL,            -- BOM qty x pack quantity
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (pack_id, inventory_id)
);

-- 5) Stock ledger: every automatic stock change, so it can be traced and reversed
CREATE TABLE IF NOT EXISTS stock_ledger (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id  uuid REFERENCES inventory(id) ON DELETE SET NULL,
    stage         varchar(12) NOT NULL CHECK (stage IN ('PAID','WAREHOUSE','CHECKED','FINISHED')),
    quantity      integer NOT NULL,            -- + into the stage, - out of it
    reason        varchar(30) NOT NULL,        -- PR_PAID, RECEIVED, CHECKED, PACK_COMPLETED, PACK_REVERSED, ORDER_DELIVERED, ADJUSTMENT, ...
    source_type   varchar(20) NOT NULL,        -- PR | PACK | ORDER | DISCREPANCY | CHECK
    source_id     uuid NOT NULL,
    name          varchar(150),                -- e.g. "Shortage - count Oct 2026" for approved adjustments
    created_by    varchar(100),
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_source ON stock_ledger (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_item   ON stock_ledger (inventory_id, created_at DESC);

-- 6) Excess / shortage reports (need Eranja's approval before stock changes)
CREATE TABLE IF NOT EXISTS stock_discrepancies (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id   uuid NOT NULL REFERENCES inventory(id),
    quantity       integer NOT NULL,           -- + excess, - shortage
    stock_effect   integer NOT NULL DEFAULT 0, -- what approval adds to quantity_in_stock
    source_type    varchar(20) NOT NULL CHECK (source_type IN ('COUNT','PACK','OTHER')),
    source_id      uuid,
    source_ref     varchar(150),
    explanation    text,
    admin_comment  text,
    status         varchar(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    adjustment_name varchar(150),
    decided_by     varchar(100),
    decided_at     timestamptz,
    created_by     varchar(100),
    created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_discrepancies_status ON stock_discrepancies (status);

-- 7) Month-end count
CREATE TABLE IF NOT EXISTS stock_counts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    month      char(7) NOT NULL UNIQUE,         -- 'YYYY-MM'
    status     varchar(8) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    opened_by  varchar(100),
    opened_at  timestamptz NOT NULL DEFAULT now(),
    closed_by  varchar(100),
    closed_at  timestamptz
);
CREATE TABLE IF NOT EXISTS stock_count_lines (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id       uuid NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
    inventory_id   uuid NOT NULL REFERENCES inventory(id),
    system_qty     integer NOT NULL,            -- CoreSync quantity when the count opened
    counted_qty    integer,                     -- entered by the line supervisor
    counted_by     varchar(100),
    admin_comment  text,                        -- required where counted <> system
    commented_by   varchar(100),
    UNIQUE (count_id, inventory_id)
);

COMMIT;
