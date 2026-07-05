-- Migraciya modeley iz staryh inventory_items
INSERT INTO product_models
    (sku, name, category_id, manufacturer, model, default_sale_price,
     low_stock_threshold, photo_url, specs, component_id, notes, created_by, created_at)
SELECT
    COALESCE(NULLIF(i.sku, ''), 'RZ-' || LPAD(i.id::text, 5, '0')),
    i.name, i.category_id, i.manufacturer, i.model, COALESCE(i.sale_price, 0),
    COALESCE(i.low_stock_threshold, 2), i.photo_url, COALESCE(i.specs, '{}'::jsonb),
    i.component_id, i.notes, i.created_by, i.created_at
FROM inventory_items i
WHERE NOT EXISTS (
    SELECT 1 FROM product_models pm
    WHERE pm.sku = COALESCE(NULLIF(i.sku, ''), 'RZ-' || LPAD(i.id::text, 5, '0'))
);