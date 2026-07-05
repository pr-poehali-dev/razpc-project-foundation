-- Sozdanie ekzemplyarov iz staryh inventory_items po quantity
WITH expanded AS (
    SELECT
        i.id AS item_id,
        pm.id AS model_id,
        i.serial_number,
        COALESCE(i.condition, 'new') AS condition,
        CASE WHEN i.status IN ('in_stock','reserved','in_build','sold','written_off','returned','diagnostics','repair')
             THEN i.status ELSE 'in_stock' END AS status,
        i.location_id,
        COALESCE(i.avg_purchase_price, i.purchase_price, 0) AS purchase_cost,
        COALESCE(i.sale_price, 0) AS sale_price,
        COALESCE(i.received_at, CURRENT_DATE) AS received_at,
        i.created_by, i.created_at,
        gs.n AS copy_index,
        ROW_NUMBER() OVER (ORDER BY i.id, gs.n) AS rn
    FROM inventory_items i
    JOIN product_models pm ON pm.sku = COALESCE(NULLIF(i.sku, ''), 'RZ-' || LPAD(i.id::text, 5, '0'))
    JOIN LATERAL generate_series(1, GREATEST(COALESCE(i.quantity, 0), 0)) AS gs(n) ON TRUE
)
INSERT INTO inventory_units
    (unit_number, model_id, serial_number, condition, status, location_id,
     purchase_cost, sale_price, received_at, created_by, created_at)
SELECT
    'U-' || LPAD(rn::text, 6, '0'),
    model_id,
    CASE WHEN copy_index = 1 THEN NULLIF(serial_number, '') ELSE NULL END,
    condition, status, location_id, purchase_cost, sale_price, received_at,
    created_by, created_at
FROM expanded;

-- Obnovlyaem schetchik unit
UPDATE erp_counters SET value = (SELECT COUNT(*) FROM inventory_units) WHERE name = 'unit';