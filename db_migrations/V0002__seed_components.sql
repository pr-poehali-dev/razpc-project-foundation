-- Komplektuyushchie dlya sborok RazPC

INSERT INTO components (type, brand, name, spec) VALUES
-- CPU
('CPU', 'AMD', 'Ryzen 7 7800X3D', '8 yader / 16 potokov, 3D V-Cache'),
('CPU', 'AMD', 'Ryzen 9 7950X3D', '16 yader / 32 potoka, do 5.7 GHz'),
('CPU', 'Intel', 'Core i5 14600KF', '14 yader / 20 potokov, do 5.3 GHz'),
('CPU', 'Intel', 'Core i9 14900K', '24 yadra / 32 potoka, do 6.0 GHz'),
-- GPU
('GPU', 'NVIDIA', 'GeForce RTX 5070 Ti', '16 GB GDDR7, DLSS 4'),
('GPU', 'NVIDIA', 'GeForce RTX 5080', '16 GB GDDR7, Ray Tracing'),
('GPU', 'NVIDIA', 'GeForce RTX 5090', '32 GB GDDR7, flagman 4K'),
('GPU', 'NVIDIA', 'GeForce RTX 5060 Ti', '16 GB GDDR7, 1080p/1440p'),
-- RAM
('RAM', 'Kingston', 'Fury Beast 32GB DDR5', '2x16 GB, 6000 MHz'),
('RAM', 'G.Skill', 'Trident Z5 64GB DDR5', '2x32 GB, 6400 MHz'),
('RAM', 'Corsair', 'Vengeance 32GB DDR5', '2x16 GB, 5600 MHz'),
-- SSD
('SSD', 'Samsung', '990 Pro 1TB', 'NVMe PCIe 4.0, do 7450 MB/s'),
('SSD', 'Samsung', '990 Pro 2TB', 'NVMe PCIe 4.0, do 7450 MB/s'),
('SSD', 'WD', 'Black SN850X 1TB', 'NVMe PCIe 4.0, do 7300 MB/s'),
-- MOTHERBOARD
('MOTHERBOARD', 'MSI', 'B650 Tomahawk', 'AM5, DDR5, PCIe 5.0'),
('MOTHERBOARD', 'ASUS', 'ROG Strix Z790-A', 'LGA1700, DDR5, Wi-Fi 6E'),
('MOTHERBOARD', 'Gigabyte', 'X670 Aorus Elite', 'AM5, DDR5, PCIe 5.0'),
-- PSU
('PSU', 'Corsair', 'RM850x', '850W, 80+ Gold, modulniy'),
('PSU', 'be quiet!', 'Straight Power 12 1000W', '1000W, 80+ Platinum'),
('PSU', 'Corsair', 'RM750e', '750W, 80+ Gold'),
-- CASE
('CASE', 'Lian Li', 'O11 Dynamic EVO', 'Zakalennoe steklo, White/Black'),
('CASE', 'NZXT', 'H7 Flow', 'Setchataya front-panel, airflow'),
('CASE', 'Geometric Future', 'Model 5', 'Premium korpus, steklo');