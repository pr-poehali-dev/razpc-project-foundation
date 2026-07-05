-- Svyazi sborok s komplektuyushchimi

-- Storm (build_id=1): CPU3, GPU8, RAM11, SSD14, MB15, PSU20, CASE22
INSERT INTO build_components (build_id, component_id, position, is_highlight) VALUES
(1, 3, 1, TRUE), (1, 8, 2, TRUE), (1, 11, 3, TRUE), (1, 14, 4, TRUE),
(1, 15, 5, FALSE), (1, 20, 6, FALSE), (1, 22, 7, FALSE);

-- Titan (build_id=2): CPU1, GPU5, RAM9, SSD12, MB15, PSU18, CASE21
INSERT INTO build_components (build_id, component_id, position, is_highlight) VALUES
(2, 1, 1, TRUE), (2, 5, 2, TRUE), (2, 9, 3, TRUE), (2, 12, 4, TRUE),
(2, 15, 5, FALSE), (2, 18, 6, FALSE), (2, 21, 7, FALSE);

-- Ultra (build_id=3): CPU4, GPU6, RAM9, SSD13, MB16, PSU18, CASE22
INSERT INTO build_components (build_id, component_id, position, is_highlight) VALUES
(3, 4, 1, TRUE), (3, 6, 2, TRUE), (3, 9, 3, TRUE), (3, 13, 4, TRUE),
(3, 16, 5, FALSE), (3, 18, 6, FALSE), (3, 22, 7, FALSE);

-- Apex (build_id=4): CPU2, GPU7, RAM10, SSD13, MB17, PSU19, CASE23
INSERT INTO build_components (build_id, component_id, position, is_highlight) VALUES
(4, 2, 1, TRUE), (4, 7, 2, TRUE), (4, 10, 3, TRUE), (4, 13, 4, TRUE),
(4, 17, 5, FALSE), (4, 19, 6, FALSE), (4, 23, 7, FALSE);