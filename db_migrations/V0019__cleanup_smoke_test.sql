-- Ochistka testovyh dannyh smoke-testa (priemka LOT-00001)
UPDATE inventory_units SET lot_id = NULL WHERE lot_id = 1;
UPDATE transactions SET lot_id = NULL WHERE lot_id = 1;
UPDATE unit_events SET lot_id = NULL WHERE lot_id = 1;