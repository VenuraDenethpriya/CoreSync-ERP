-- [ADDED 2026-10-13] Run ONCE at go-live, after the migration and BEFORE setting
-- INVENTORY_CONTROLS_ENABLED=true. Decided by Eranja 13 Oct 2026:
-- "current manual allocations should be cancelled and go to the 2nd inventory
--  (Warehouse) if they have not been checked physically".
-- Manual allocations = allocation rows not tied to a pack. The goods are still counted in
-- quantity_in_stock, so cancelling them only removes the reservation ("hold"); with
-- qty_checked = 0 they all sit in Warehouse.
-- Review the SELECT output first; the changes are kept in a backup table.
BEGIN;

CREATE TABLE IF NOT EXISTS golive_backup_allocations_20261013 AS
  SELECT * FROM inventory_item_allocation
  WHERE pack_id IS NULL OR pack_id = '00000000-0000-0000-0000-000000000000';

-- what will be cancelled, per item
SELECT i.item_code, i.item_name, COUNT(*) AS allocations, SUM(a.count) AS qty_released
FROM inventory_item_allocation a JOIN inventory i ON i.id = a.item_id
WHERE a.pack_id IS NULL OR a.pack_id = '00000000-0000-0000-0000-000000000000'
GROUP BY i.item_code, i.item_name ORDER BY i.item_code;

DELETE FROM inventory_item_allocation
WHERE pack_id IS NULL OR pack_id = '00000000-0000-0000-0000-000000000000';

-- hold = what the remaining (pack) allocations reserve
UPDATE inventory i SET hold = COALESCE((
  SELECT SUM(a.count) FROM inventory_item_allocation a WHERE a.item_id = i.id), 0);

-- nothing has been checked yet: everything physically here is in Warehouse
UPDATE inventory SET qty_checked = 0;

COMMIT;
