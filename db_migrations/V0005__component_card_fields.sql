-- Dopolnitelnye polya dlya premium-kartochek komplektuyushchih

ALTER TABLE components ADD COLUMN IF NOT EXISTS role VARCHAR(80);
ALTER TABLE components ADD COLUMN IF NOT EXISTS key_specs VARCHAR(300);

-- CPU
UPDATE components SET role = 'High-FPS Gaming CPU', key_specs = '8 yader;16 potokov;3D V-Cache' WHERE name = 'Ryzen 7 7800X3D';
UPDATE components SET role = 'Gaming & Creator CPU', key_specs = '16 yader;32 potoka;do 5.7 GHz' WHERE name = 'Ryzen 9 7950X3D';
UPDATE components SET role = 'Balanced Gaming CPU', key_specs = '14 yader;20 potokov;do 5.3 GHz' WHERE name = 'Core i5 14600KF';
UPDATE components SET role = 'Flagship Performance CPU', key_specs = '24 yadra;32 potoka;do 6.0 GHz' WHERE name = 'Core i9 14900K';

-- GPU
UPDATE components SET role = '1440p Gaming GPU', key_specs = '16 GB GDDR7;DLSS 4;Ray Tracing' WHERE name = 'GeForce RTX 5070 Ti';
UPDATE components SET role = 'High-End Gaming GPU', key_specs = '16 GB GDDR7;DLSS 4;4K Ready' WHERE name = 'GeForce RTX 5080';
UPDATE components SET role = 'Ultimate 4K GPU', key_specs = '32 GB GDDR7;DLSS 4;Flagman' WHERE name = 'GeForce RTX 5090';
UPDATE components SET role = '1080p / 1440p GPU', key_specs = '16 GB GDDR7;DLSS 4' WHERE name = 'GeForce RTX 5060 Ti';

-- RAM
UPDATE components SET role = 'Gaming Memory', key_specs = '32 GB;DDR5;6000 MHz' WHERE name = 'Fury Beast 32GB DDR5';
UPDATE components SET role = 'Creator Memory', key_specs = '64 GB;DDR5;6400 MHz' WHERE name = 'Trident Z5 64GB DDR5';
UPDATE components SET role = 'Reliable Memory', key_specs = '32 GB;DDR5;5600 MHz' WHERE name = 'Vengeance 32GB DDR5';

-- SSD
UPDATE components SET role = 'Fast NVMe Storage', key_specs = '1 TB;PCIe 4.0;7450 MB/s' WHERE name = '990 Pro 1TB';
UPDATE components SET role = 'High-Capacity NVMe', key_specs = '2 TB;PCIe 4.0;7450 MB/s' WHERE name = '990 Pro 2TB';
UPDATE components SET role = 'Gaming NVMe Storage', key_specs = '1 TB;PCIe 4.0;7300 MB/s' WHERE name = 'Black SN850X 1TB';

-- MOTHERBOARD
UPDATE components SET role = 'Gaming Platform', key_specs = 'AM5;DDR5;PCIe 5.0' WHERE name = 'B650 Tomahawk';
UPDATE components SET role = 'Premium Platform', key_specs = 'LGA1700;DDR5;Wi-Fi 6E' WHERE name = 'ROG Strix Z790-A';
UPDATE components SET role = 'Enthusiast Platform', key_specs = 'AM5;DDR5;PCIe 5.0' WHERE name = 'X670 Aorus Elite';

-- PSU
UPDATE components SET role = 'Reliable Power', key_specs = '850W;80+ Gold;Modular' WHERE name = 'RM850x';
UPDATE components SET role = 'Premium Power', key_specs = '1000W;80+ Platinum;Silent' WHERE name = 'Straight Power 12 1000W';
UPDATE components SET role = 'Efficient Power', key_specs = '750W;80+ Gold' WHERE name = 'RM750e';

-- CASE
UPDATE components SET role = 'Showcase Case', key_specs = 'Zakalennoe steklo;Airflow' WHERE name = 'O11 Dynamic EVO';
UPDATE components SET role = 'Airflow Case', key_specs = 'Mesh front;Optimal airflow' WHERE name = 'H7 Flow';
UPDATE components SET role = 'Premium Design Case', key_specs = 'Steklo;Unikalniy dizayn' WHERE name = 'Model 5';