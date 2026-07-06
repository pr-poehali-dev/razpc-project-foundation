import json

# Katalog komplektuyushchih. compat — ploskie polya dlya konfiguratora.
# specs — strukturirovannye harakteristiki po razdelam dlya kartochki tovara.

PRODUCTS = [
    # ---------------- CPU ----------------
    {'slug': 'cpu-i3-12100f', 'cat': 'cpu', 'supplier': 'Склад RazPC', 'brand': 'Intel', 'name': 'Core i3-12100F',
     'condition': 'new', 'purchase': 7000, 'price': 8500, 'in_stock': True, 'warranty': 36, 'weight': 300,
     'short_desc': 'Бюджетный 4-ядерный процессор для базовых задач и игр в Full HD.',
     'short_specs': ['4 ядра / 8 потоков', 'до 4.3 ГГц', 'LGA1700'], 'perf': 45,
     'compat': {'socket': 'LGA1700', 'cores': 4, 'threads': 8, 'tdp': 89, 'memoryType': 'DDR5', 'igpu': False, 'perfCpu': 45, 'boostClock': 4.3},
     'specs': {'Общие': {'Сокет': 'LGA1700', 'Ядра': '4', 'Потоки': '8'}, 'Частоты': {'Базовая': '3.3 ГГц', 'Турбо': '4.3 ГГц', 'Кэш L3': '12 МБ'}, 'Энергопотребление': {'TDP': '89 Вт'}, 'Память': {'Тип': 'DDR5'}}},
    {'slug': 'cpu-i5-13400f', 'cat': 'cpu', 'supplier': 'Регард (Москва)', 'brand': 'Intel', 'name': 'Core i5-13400F',
     'condition': 'new', 'purchase': 15000, 'price': 17500, 'in_stock': False, 'warranty': 36, 'weight': 300,
     'short_desc': 'Универсальный 10-ядерный процессор для игр и работы.',
     'short_specs': ['10 ядер / 16 потоков', 'до 4.6 ГГц', 'LGA1700'], 'perf': 68,
     'compat': {'socket': 'LGA1700', 'cores': 10, 'threads': 16, 'tdp': 148, 'memoryType': 'DDR5', 'igpu': False, 'perfCpu': 68, 'boostClock': 4.6},
     'specs': {'Общие': {'Сокет': 'LGA1700', 'Ядра': '10', 'Потоки': '16'}, 'Частоты': {'Турбо': '4.6 ГГц', 'Кэш L3': '20 МБ'}, 'Энергопотребление': {'TDP': '148 Вт'}, 'Память': {'Тип': 'DDR5'}}},
    {'slug': 'cpu-i7-13700f', 'cat': 'cpu', 'supplier': 'Ситилинк', 'brand': 'Intel', 'name': 'Core i7-13700F',
     'condition': 'new', 'purchase': 29000, 'price': 33000, 'in_stock': False, 'warranty': 36, 'weight': 300,
     'short_desc': 'Мощный процессор для требовательных игр и профессиональных задач.',
     'short_specs': ['16 ядер / 24 потока', 'до 5.2 ГГц', 'LGA1700'], 'perf': 88,
     'compat': {'socket': 'LGA1700', 'cores': 16, 'threads': 24, 'tdp': 219, 'memoryType': 'DDR5', 'igpu': False, 'perfCpu': 88, 'boostClock': 5.2},
     'specs': {'Общие': {'Сокет': 'LGA1700', 'Ядра': '16', 'Потоки': '24'}, 'Частоты': {'Турбо': '5.2 ГГц', 'Кэш L3': '30 МБ'}, 'Энергопотребление': {'TDP': '219 Вт'}, 'Память': {'Тип': 'DDR5'}}},
    {'slug': 'cpu-r5-5600', 'cat': 'cpu', 'supplier': 'Склад RazPC', 'brand': 'AMD', 'name': 'Ryzen 5 5600',
     'condition': 'new', 'purchase': 8000, 'price': 9500, 'in_stock': True, 'warranty': 36, 'weight': 300,
     'short_desc': 'Экономичный 6-ядерный процессор на платформе AM4.',
     'short_specs': ['6 ядер / 12 потоков', 'до 4.4 ГГц', 'AM4'], 'perf': 58,
     'compat': {'socket': 'AM4', 'cores': 6, 'threads': 12, 'tdp': 65, 'memoryType': 'DDR4', 'igpu': False, 'perfCpu': 58, 'boostClock': 4.4},
     'specs': {'Общие': {'Сокет': 'AM4', 'Ядра': '6', 'Потоки': '12'}, 'Частоты': {'Турбо': '4.4 ГГц', 'Кэш L3': '32 МБ'}, 'Энергопотребление': {'TDP': '65 Вт'}, 'Память': {'Тип': 'DDR4'}}},
    {'slug': 'cpu-r5-7600', 'cat': 'cpu', 'supplier': 'Регард (Москва)', 'brand': 'AMD', 'name': 'Ryzen 5 7600',
     'condition': 'new', 'purchase': 17000, 'price': 19500, 'in_stock': False, 'warranty': 36, 'weight': 300,
     'short_desc': 'Современный 6-ядерный процессор на платформе AM5 со встроенной графикой.',
     'short_specs': ['6 ядер / 12 потоков', 'до 5.1 ГГц', 'AM5'], 'perf': 72,
     'compat': {'socket': 'AM5', 'cores': 6, 'threads': 12, 'tdp': 105, 'memoryType': 'DDR5', 'igpu': True, 'perfCpu': 72, 'boostClock': 5.1},
     'specs': {'Общие': {'Сокет': 'AM5', 'Ядра': '6', 'Потоки': '12'}, 'Частоты': {'Турбо': '5.1 ГГц', 'Кэш L3': '32 МБ'}, 'Энергопотребление': {'TDP': '105 Вт'}, 'Память': {'Тип': 'DDR5'}}},
    {'slug': 'cpu-r7-7800x3d', 'cat': 'cpu', 'supplier': 'Ключевой дистрибьютор', 'brand': 'AMD', 'name': 'Ryzen 7 7800X3D',
     'condition': 'new', 'purchase': 37000, 'price': 42000, 'in_stock': False, 'warranty': 36, 'weight': 300,
     'short_desc': 'Лучший игровой процессор с технологией 3D V-Cache.',
     'short_specs': ['8 ядер / 16 потоков', '3D V-Cache', 'AM5'], 'perf': 96,
     'compat': {'socket': 'AM5', 'cores': 8, 'threads': 16, 'tdp': 120, 'memoryType': 'DDR5', 'igpu': True, 'perfCpu': 96, 'boostClock': 5.0},
     'specs': {'Общие': {'Сокет': 'AM5', 'Ядра': '8', 'Потоки': '16'}, 'Частоты': {'Турбо': '5.0 ГГц', 'Кэш L3': '96 МБ'}, 'Энергопотребление': {'TDP': '120 Вт'}, 'Память': {'Тип': 'DDR5'}}},

    # ---------------- GPU ----------------
    {'slug': 'gpu-rtx4060', 'cat': 'gpu', 'supplier': 'Склад RazPC', 'brand': 'NVIDIA', 'name': 'GeForce RTX 4060',
     'condition': 'new', 'purchase': 28000, 'price': 32000, 'in_stock': True, 'warranty': 36, 'weight': 900, 'length': 245,
     'short_desc': 'Видеокарта для комфортной игры в Full HD с трассировкой лучей.',
     'short_specs': ['8 GB GDDR6', 'Full HD', 'Ray Tracing'], 'perf': 55,
     'compat': {'vramGb': 8, 'memoryType': 'GDDR6', 'lengthMm': 245, 'tdp': 115, 'rayTracing': True, 'perfGpu': 55, 'recommendedPsu': 550},
     'specs': {'Общие': {'Чип': 'RTX 4060'}, 'Память': {'Объём': '8 ГБ', 'Тип': 'GDDR6'}, 'Размеры': {'Длина': '245 мм'}, 'Энергопотребление': {'TDP': '115 Вт', 'Рекомендуемый БП': '550 Вт'}}},
    {'slug': 'gpu-rtx4060ti', 'cat': 'gpu', 'supplier': 'Регард (Москва)', 'brand': 'NVIDIA', 'name': 'GeForce RTX 4060 Ti',
     'condition': 'new', 'purchase': 40000, 'price': 45000, 'in_stock': False, 'warranty': 36, 'weight': 1000, 'length': 280,
     'short_desc': 'Отличный выбор для игр в разрешении 1440p.',
     'short_specs': ['16 GB GDDR6', '1440p', 'Ray Tracing'], 'perf': 68,
     'compat': {'vramGb': 16, 'memoryType': 'GDDR6', 'lengthMm': 280, 'tdp': 165, 'rayTracing': True, 'perfGpu': 68, 'recommendedPsu': 600},
     'specs': {'Общие': {'Чип': 'RTX 4060 Ti'}, 'Память': {'Объём': '16 ГБ', 'Тип': 'GDDR6'}, 'Размеры': {'Длина': '280 мм'}, 'Энергопотребление': {'TDP': '165 Вт', 'Рекомендуемый БП': '600 Вт'}}},
    {'slug': 'gpu-rtx4070s', 'cat': 'gpu', 'supplier': 'Ситилинк', 'brand': 'NVIDIA', 'name': 'GeForce RTX 4070 Super',
     'condition': 'new', 'purchase': 62000, 'price': 68000, 'in_stock': False, 'warranty': 36, 'weight': 1200, 'length': 305,
     'short_desc': 'Производительная видеокарта для 2K и 4K гейминга.',
     'short_specs': ['12 GB GDDR6X', '2K/4K', 'Ray Tracing'], 'perf': 82,
     'compat': {'vramGb': 12, 'memoryType': 'GDDR6X', 'lengthMm': 305, 'tdp': 220, 'rayTracing': True, 'perfGpu': 82, 'recommendedPsu': 700},
     'specs': {'Общие': {'Чип': 'RTX 4070 Super'}, 'Память': {'Объём': '12 ГБ', 'Тип': 'GDDR6X'}, 'Размеры': {'Длина': '305 мм'}, 'Энергопотребление': {'TDP': '220 Вт', 'Рекомендуемый БП': '700 Вт'}}},
    {'slug': 'gpu-rtx4080s', 'cat': 'gpu', 'supplier': 'Ключевой дистрибьютор', 'brand': 'NVIDIA', 'name': 'GeForce RTX 4080 Super',
     'condition': 'new', 'purchase': 98000, 'price': 105000, 'in_stock': False, 'warranty': 36, 'weight': 1500, 'length': 336,
     'short_desc': 'Флагманская видеокарта для 4K и максимальных настроек.',
     'short_specs': ['16 GB GDDR6X', '4K', 'Ray Tracing'], 'perf': 95,
     'compat': {'vramGb': 16, 'memoryType': 'GDDR6X', 'lengthMm': 336, 'tdp': 320, 'rayTracing': True, 'perfGpu': 95, 'recommendedPsu': 850},
     'specs': {'Общие': {'Чип': 'RTX 4080 Super'}, 'Память': {'Объём': '16 ГБ', 'Тип': 'GDDR6X'}, 'Размеры': {'Длина': '336 мм'}, 'Энергопотребление': {'TDP': '320 Вт', 'Рекомендуемый БП': '850 Вт'}}},
    {'slug': 'gpu-rx7600', 'cat': 'gpu', 'supplier': 'Регард (Москва)', 'brand': 'AMD', 'name': 'Radeon RX 7600',
     'condition': 'new', 'purchase': 26000, 'price': 29000, 'in_stock': False, 'warranty': 36, 'weight': 950, 'length': 270,
     'short_desc': 'Доступная видеокарта для Full HD гейминга.',
     'short_specs': ['8 GB GDDR6', 'Full HD', 'Ray Tracing'], 'perf': 52,
     'compat': {'vramGb': 8, 'memoryType': 'GDDR6', 'lengthMm': 270, 'tdp': 165, 'rayTracing': True, 'perfGpu': 52, 'recommendedPsu': 550},
     'specs': {'Общие': {'Чип': 'RX 7600'}, 'Память': {'Объём': '8 ГБ', 'Тип': 'GDDR6'}, 'Размеры': {'Длина': '270 мм'}, 'Энергопотребление': {'TDP': '165 Вт', 'Рекомендуемый БП': '550 Вт'}}},

    # ------------- MOTHERBOARD -------------
    {'slug': 'mb-h610m', 'cat': 'motherboard', 'supplier': 'Склад RazPC', 'brand': 'ASUS', 'name': 'PRIME H610M-K',
     'condition': 'new', 'purchase': 7500, 'price': 9000, 'in_stock': True, 'warranty': 36, 'weight': 700,
     'short_desc': 'Компактная плата для базовых сборок на LGA1700.',
     'short_specs': ['LGA1700', 'mATX', 'DDR5'], 'perf': None,
     'compat': {'socket': 'LGA1700', 'chipset': 'H610', 'formFactor': 'mATX', 'memoryType': 'DDR5', 'maxMemClock': 4800, 'ramSlots': 2, 'm2Slots': 1, 'sataPorts': 4, 'wifi': False},
     'specs': {'Общие': {'Сокет': 'LGA1700', 'Чипсет': 'H610', 'Форм-фактор': 'mATX'}, 'Память': {'Тип': 'DDR5', 'Слотов': '2', 'Макс. частота': '4800 МГц'}, 'Интерфейсы': {'M.2': '1', 'SATA': '4', 'Wi-Fi': 'Нет'}}},
    {'slug': 'mb-b760', 'cat': 'motherboard', 'supplier': 'Регард (Москва)', 'brand': 'MSI', 'name': 'B760 GAMING PLUS WIFI',
     'condition': 'new', 'purchase': 13500, 'price': 15500, 'in_stock': False, 'warranty': 36, 'weight': 900,
     'short_desc': 'Игровая плата с Wi-Fi для процессоров Intel 12/13/14 поколения.',
     'short_specs': ['LGA1700', 'ATX', 'DDR5', 'Wi-Fi'], 'perf': None,
     'compat': {'socket': 'LGA1700', 'chipset': 'B760', 'formFactor': 'ATX', 'memoryType': 'DDR5', 'maxMemClock': 7200, 'ramSlots': 4, 'm2Slots': 2, 'sataPorts': 6, 'wifi': True},
     'specs': {'Общие': {'Сокет': 'LGA1700', 'Чипсет': 'B760', 'Форм-фактор': 'ATX'}, 'Память': {'Тип': 'DDR5', 'Слотов': '4', 'Макс. частота': '7200 МГц'}, 'Интерфейсы': {'M.2': '2', 'SATA': '6', 'Wi-Fi': 'Есть'}}},
    {'slug': 'mb-b550', 'cat': 'motherboard', 'supplier': 'Склад RazPC', 'brand': 'Gigabyte', 'name': 'B550 AORUS ELITE',
     'condition': 'new', 'purchase': 10000, 'price': 12000, 'in_stock': True, 'warranty': 36, 'weight': 850,
     'short_desc': 'Надёжная плата AM4 для сборок на Ryzen 5000.',
     'short_specs': ['AM4', 'ATX', 'DDR4'], 'perf': None,
     'compat': {'socket': 'AM4', 'chipset': 'B550', 'formFactor': 'ATX', 'memoryType': 'DDR4', 'maxMemClock': 4400, 'ramSlots': 4, 'm2Slots': 2, 'sataPorts': 6, 'wifi': False},
     'specs': {'Общие': {'Сокет': 'AM4', 'Чипсет': 'B550', 'Форм-фактор': 'ATX'}, 'Память': {'Тип': 'DDR4', 'Слотов': '4'}, 'Интерфейсы': {'M.2': '2', 'SATA': '6', 'Wi-Fi': 'Нет'}}},
    {'slug': 'mb-b650', 'cat': 'motherboard', 'supplier': 'Ситилинк', 'brand': 'Gigabyte', 'name': 'B650 AORUS ELITE AX',
     'condition': 'new', 'purchase': 16500, 'price': 18500, 'in_stock': False, 'warranty': 36, 'weight': 950,
     'short_desc': 'Современная плата AM5 с Wi-Fi 6 и тремя слотами M.2.',
     'short_specs': ['AM5', 'ATX', 'DDR5', 'Wi-Fi'], 'perf': None,
     'compat': {'socket': 'AM5', 'chipset': 'B650', 'formFactor': 'ATX', 'memoryType': 'DDR5', 'maxMemClock': 6600, 'ramSlots': 4, 'm2Slots': 3, 'sataPorts': 4, 'wifi': True},
     'specs': {'Общие': {'Сокет': 'AM5', 'Чипсет': 'B650', 'Форм-фактор': 'ATX'}, 'Память': {'Тип': 'DDR5', 'Слотов': '4', 'Макс. частота': '6600 МГц'}, 'Интерфейсы': {'M.2': '3', 'SATA': '4', 'Wi-Fi': 'Есть'}}},

    # ---------------- RAM ----------------
    {'slug': 'ram-ddr4-16', 'cat': 'ram', 'supplier': 'Склад RazPC', 'brand': 'Kingston', 'name': 'FURY Beast 16 GB DDR4',
     'condition': 'new', 'purchase': 3000, 'price': 3800, 'in_stock': True, 'warranty': 60, 'weight': 150,
     'short_desc': 'Комплект памяти DDR4 для базовых и игровых сборок.',
     'short_specs': ['2×8 GB', 'DDR4-3200'], 'perf': None,
     'compat': {'memoryType': 'DDR4', 'capacityGb': 16, 'modules': 2, 'clock': 3200},
     'specs': {'Общие': {'Объём': '16 ГБ', 'Модулей': '2×8 ГБ'}, 'Память': {'Тип': 'DDR4', 'Частота': '3200 МГц'}}},
    {'slug': 'ram-ddr5-32', 'cat': 'ram', 'supplier': 'Регард (Москва)', 'brand': 'Kingston', 'name': 'FURY Beast 32 GB DDR5',
     'condition': 'new', 'purchase': 9000, 'price': 10500, 'in_stock': False, 'warranty': 60, 'weight': 160,
     'short_desc': 'Быстрая память DDR5 для современных платформ.',
     'short_specs': ['2×16 GB', 'DDR5-6000'], 'perf': None,
     'compat': {'memoryType': 'DDR5', 'capacityGb': 32, 'modules': 2, 'clock': 6000},
     'specs': {'Общие': {'Объём': '32 ГБ', 'Модулей': '2×16 ГБ'}, 'Память': {'Тип': 'DDR5', 'Частота': '6000 МГц'}}},
    {'slug': 'ram-ddr5-16', 'cat': 'ram', 'supplier': 'Склад RazPC', 'brand': 'Kingston', 'name': 'FURY Beast 16 GB DDR5',
     'condition': 'new', 'purchase': 4500, 'price': 5500, 'in_stock': True, 'warranty': 60, 'weight': 150,
     'short_desc': 'Комплект DDR5 для сборок на AM5 и LGA1700.',
     'short_specs': ['2×8 GB', 'DDR5-5200'], 'perf': None,
     'compat': {'memoryType': 'DDR5', 'capacityGb': 16, 'modules': 2, 'clock': 5200},
     'specs': {'Общие': {'Объём': '16 ГБ', 'Модулей': '2×8 ГБ'}, 'Память': {'Тип': 'DDR5', 'Частота': '5200 МГц'}}},

    # ---------------- SSD M.2 ----------------
    {'slug': 'st-990-1t', 'cat': 'ssd_m2', 'supplier': 'Склад RazPC', 'brand': 'Samsung', 'name': '990 Pro 1 TB',
     'condition': 'new', 'purchase': 9500, 'price': 11000, 'in_stock': True, 'warranty': 60, 'weight': 100,
     'short_desc': 'Флагманский NVMe SSD со скоростью до 7450 МБ/с.',
     'short_specs': ['NVMe M.2', '1 ТБ', 'до 7450 МБ/с'], 'perf': None,
     'compat': {'driveType': 'SSD M.2', 'interface': 'M.2 NVMe', 'capacityGb': 1000},
     'specs': {'Общие': {'Тип': 'SSD M.2', 'Объём': '1 ТБ'}, 'Интерфейсы': {'Интерфейс': 'M.2 NVMe PCIe 4.0'}, 'Скорость': {'Чтение': '7450 МБ/с', 'Запись': '6900 МБ/с'}}},
    {'slug': 'st-980-1t', 'cat': 'ssd_m2', 'supplier': 'Регард (Москва)', 'brand': 'Samsung', 'name': '980 1 TB',
     'condition': 'new', 'purchase': 6500, 'price': 7500, 'in_stock': False, 'warranty': 60, 'weight': 100,
     'short_desc': 'Доступный NVMe SSD для системы и приложений.',
     'short_specs': ['NVMe M.2', '1 ТБ', 'до 3500 МБ/с'], 'perf': None,
     'compat': {'driveType': 'SSD M.2', 'interface': 'M.2 NVMe', 'capacityGb': 1000},
     'specs': {'Общие': {'Тип': 'SSD M.2', 'Объём': '1 ТБ'}, 'Интерфейсы': {'Интерфейс': 'M.2 NVMe PCIe 3.0'}, 'Скорость': {'Чтение': '3500 МБ/с'}}},

    # ---------------- SSD SATA ----------------
    {'slug': 'st-870-1t', 'cat': 'ssd', 'supplier': 'Склад RazPC', 'brand': 'Samsung', 'name': '870 EVO 1 TB',
     'condition': 'new', 'purchase': 6800, 'price': 8000, 'in_stock': True, 'warranty': 60, 'weight': 120,
     'short_desc': 'Надёжный SATA SSD для хранения данных.',
     'short_specs': ['SATA SSD', '1 ТБ', 'до 560 МБ/с'], 'perf': None,
     'compat': {'driveType': 'SSD SATA', 'interface': 'SATA', 'capacityGb': 1000},
     'specs': {'Общие': {'Тип': 'SSD SATA', 'Объём': '1 ТБ'}, 'Интерфейсы': {'Интерфейс': 'SATA III'}, 'Скорость': {'Чтение': '560 МБ/с'}}},

    # ---------------- HDD ----------------
    {'slug': 'st-hdd-2t', 'cat': 'hdd', 'supplier': 'Склад RazPC', 'brand': 'Seagate', 'name': 'BarraCuda 2 TB',
     'condition': 'new', 'purchase': 4500, 'price': 5500, 'in_stock': True, 'warranty': 24, 'weight': 500,
     'short_desc': 'Ёмкий жёсткий диск для файлов и медиатеки.',
     'short_specs': ['HDD 7200', '2 ТБ', 'SATA'], 'perf': None,
     'compat': {'driveType': 'HDD', 'interface': 'SATA', 'capacityGb': 2000},
     'specs': {'Общие': {'Тип': 'HDD', 'Объём': '2 ТБ', 'Скорость вращения': '7200 об/мин'}, 'Интерфейсы': {'Интерфейс': 'SATA III'}}},

    # ---------------- PSU ----------------
    {'slug': 'psu-650', 'cat': 'psu', 'supplier': 'Склад RazPC', 'brand': 'DeepCool', 'name': 'PK650D',
     'condition': 'new', 'purchase': 4500, 'price': 5500, 'in_stock': True, 'warranty': 36, 'weight': 1800,
     'short_desc': 'Надёжный блок питания 650 Вт с сертификатом 80+ Bronze.',
     'short_specs': ['650 Вт', '80+ Bronze'], 'perf': None,
     'compat': {'watts': 650, 'certification': '80+ Bronze', 'formFactor': 'ATX'},
     'specs': {'Общие': {'Мощность': '650 Вт', 'Сертификат': '80+ Bronze', 'Форм-фактор': 'ATX'}}},
    {'slug': 'psu-750', 'cat': 'psu', 'supplier': 'Регард (Москва)', 'brand': 'be quiet!', 'name': 'Pure Power 12 750W',
     'condition': 'new', 'purchase': 8000, 'price': 9500, 'in_stock': False, 'warranty': 60, 'weight': 2000,
     'short_desc': 'Тихий блок питания 750 Вт 80+ Gold.',
     'short_specs': ['750 Вт', '80+ Gold'], 'perf': None,
     'compat': {'watts': 750, 'certification': '80+ Gold', 'formFactor': 'ATX'},
     'specs': {'Общие': {'Мощность': '750 Вт', 'Сертификат': '80+ Gold', 'Форм-фактор': 'ATX'}}},
    {'slug': 'psu-850', 'cat': 'psu', 'supplier': 'Ситилинк', 'brand': 'Corsair', 'name': 'RM850e',
     'condition': 'new', 'purchase': 11500, 'price': 13000, 'in_stock': False, 'warranty': 84, 'weight': 2100,
     'short_desc': 'Модульный блок питания 850 Вт для мощных сборок.',
     'short_specs': ['850 Вт', '80+ Gold', 'модульный'], 'perf': None,
     'compat': {'watts': 850, 'certification': '80+ Gold', 'formFactor': 'ATX'},
     'specs': {'Общие': {'Мощность': '850 Вт', 'Сертификат': '80+ Gold', 'Модульность': 'Полная'}}},

    # ---------------- CASE ----------------
    {'slug': 'case-cc560', 'cat': 'case', 'supplier': 'Склад RazPC', 'brand': 'DeepCool', 'name': 'CC560',
     'condition': 'new', 'purchase': 4000, 'price': 5000, 'in_stock': True, 'warranty': 24, 'weight': 6000, 'length': 500, 'width': 230, 'height': 480,
     'short_desc': 'Просторный корпус ATX с 4 предустановленными вентиляторами.',
     'short_specs': ['ATX', 'до 370 мм GPU', '4 вентилятора'], 'perf': None,
     'compat': {'supportedFormFactors': ['ATX', 'mATX', 'Mini-ITX'], 'maxGpuLengthMm': 370, 'maxCoolerHeightMm': 165, 'radiatorSupport': 280, 'fanSlots': 6},
     'specs': {'Общие': {'Форм-фактор': 'ATX / mATX / Mini-ITX'}, 'Совместимость': {'Макс. длина GPU': '370 мм', 'Макс. высота кулера': '165 мм', 'Радиатор СЖО': 'до 280 мм'}}},
    {'slug': 'case-lancool', 'cat': 'case', 'supplier': 'Регард (Москва)', 'brand': 'Lian Li', 'name': 'Lancool 216',
     'condition': 'new', 'purchase': 7500, 'price': 9000, 'in_stock': False, 'warranty': 24, 'weight': 8000, 'length': 480, 'width': 240, 'height': 500,
     'short_desc': 'Корпус с отличной продувкой и сетчатым фронтом.',
     'short_specs': ['ATX', 'до 392 мм GPU', 'сетчатый'], 'perf': None,
     'compat': {'supportedFormFactors': ['ATX', 'mATX', 'Mini-ITX'], 'maxGpuLengthMm': 392, 'maxCoolerHeightMm': 180, 'radiatorSupport': 360, 'fanSlots': 7},
     'specs': {'Общие': {'Форм-фактор': 'ATX / mATX / Mini-ITX'}, 'Совместимость': {'Макс. длина GPU': '392 мм', 'Макс. высота кулера': '180 мм', 'Радиатор СЖО': 'до 360 мм'}}},

    # ------------- AIR COOLER -------------
    {'slug': 'cool-ak400', 'cat': 'air_cooler', 'supplier': 'Склад RazPC', 'brand': 'DeepCool', 'name': 'AK400',
     'condition': 'new', 'purchase': 2400, 'price': 3000, 'in_stock': True, 'warranty': 36, 'weight': 700, 'height': 155,
     'short_desc': 'Эффективный башенный кулер для процессоров до 150 Вт.',
     'short_specs': ['Башенный', '150 Вт TDP', '155 мм'], 'perf': None,
     'compat': {'coolerType': 'air', 'heightMm': 155, 'radiatorMm': 0, 'tdpRating': 150, 'sockets': ['LGA1700', 'AM4', 'AM5']},
     'specs': {'Общие': {'Тип': 'Воздушный', 'Рассеиваемая мощность': '150 Вт'}, 'Размеры': {'Высота': '155 мм'}, 'Совместимость': {'Сокеты': 'LGA1700, AM4, AM5'}}},
    {'slug': 'cool-ak620', 'cat': 'air_cooler', 'supplier': 'Регард (Москва)', 'brand': 'DeepCool', 'name': 'AK620',
     'condition': 'new', 'purchase': 5000, 'price': 6000, 'in_stock': False, 'warranty': 36, 'weight': 1200, 'height': 160,
     'short_desc': 'Двухбашенный кулер для мощных процессоров.',
     'short_specs': ['2 башни', '260 Вт TDP', '160 мм'], 'perf': None,
     'compat': {'coolerType': 'air', 'heightMm': 160, 'radiatorMm': 0, 'tdpRating': 260, 'sockets': ['LGA1700', 'AM4', 'AM5']},
     'specs': {'Общие': {'Тип': 'Воздушный', 'Рассеиваемая мощность': '260 Вт'}, 'Размеры': {'Высота': '160 мм'}, 'Совместимость': {'Сокеты': 'LGA1700, AM4, AM5'}}},

    # ------------- LIQUID COOLER -------------
    {'slug': 'cool-lf360', 'cat': 'liquid_cooler', 'supplier': 'Ситилинк', 'brand': 'Arctic', 'name': 'Liquid Freezer III 360',
     'condition': 'new', 'purchase': 10000, 'price': 12000, 'in_stock': False, 'warranty': 72, 'weight': 2000,
     'short_desc': 'Система жидкостного охлаждения 360 мм для топовых процессоров.',
     'short_specs': ['СЖО 360 мм', '350 Вт TDP'], 'perf': None,
     'compat': {'coolerType': 'liquid', 'heightMm': 0, 'radiatorMm': 360, 'tdpRating': 350, 'sockets': ['LGA1700', 'AM4', 'AM5']},
     'specs': {'Общие': {'Тип': 'СЖО', 'Радиатор': '360 мм', 'Рассеиваемая мощность': '350 Вт'}, 'Совместимость': {'Сокеты': 'LGA1700, AM4, AM5'}}},

    # ---------------- FAN ----------------
    {'slug': 'fan-argb', 'cat': 'fan', 'supplier': 'Склад RazPC', 'brand': 'DeepCool', 'name': 'FC120 ARGB',
     'condition': 'new', 'purchase': 800, 'price': 1100, 'in_stock': True, 'warranty': 24, 'weight': 200,
     'short_desc': 'Корпусный вентилятор 120 мм с ARGB-подсветкой.',
     'short_specs': ['120 мм', 'ARGB'], 'perf': None,
     'compat': {'sizeMm': 120},
     'specs': {'Общие': {'Размер': '120 мм', 'Подсветка': 'ARGB'}}},

    # ---------------- MONITOR ----------------
    {'slug': 'mon-lg-27', 'cat': 'monitor', 'supplier': 'Регард (Москва)', 'brand': 'LG', 'name': 'UltraGear 27GP850',
     'condition': 'new', 'purchase': 30000, 'price': 34000, 'in_stock': False, 'warranty': 24, 'weight': 6000, 'length': 610, 'width': 250, 'height': 450,
     'short_desc': 'Игровой монитор 27" 1440p 165 Гц с IPS-матрицей.',
     'short_specs': ['27"', '2560×1440', '165 Гц'], 'perf': None,
     'compat': {},
     'specs': {'Общие': {'Диагональ': '27"', 'Матрица': 'IPS'}, 'Изображение': {'Разрешение': '2560×1440', 'Частота': '165 Гц', 'Отклик': '1 мс'}}},

    # ---------------- PERIPHERALS ----------------
    {'slug': 'kbd-logi-pro', 'cat': 'peripherals', 'supplier': 'Склад RazPC', 'brand': 'Logitech', 'name': 'G Pro X Клавиатура',
     'condition': 'new', 'purchase': 8000, 'price': 9500, 'in_stock': True, 'warranty': 24, 'weight': 1000,
     'short_desc': 'Механическая игровая клавиатура со сменными свитчами.',
     'short_specs': ['Механика', 'RGB', 'TKL'], 'perf': None,
     'compat': {},
     'specs': {'Общие': {'Тип': 'Механическая', 'Подсветка': 'RGB'}, 'Подключение': {'Интерфейс': 'USB'}}},

    # ---------------- CABLES ----------------
    {'slug': 'cable-dp', 'cat': 'cables', 'supplier': 'Склад RazPC', 'brand': 'Ugreen', 'name': 'Кабель DisplayPort 1.4 2м',
     'condition': 'new', 'purchase': 500, 'price': 790, 'in_stock': True, 'warranty': 12, 'weight': 200,
     'short_desc': 'Кабель DisplayPort 1.4 с поддержкой 4K 144 Гц.',
     'short_specs': ['DisplayPort 1.4', '2 м', '4K 144 Гц'], 'perf': None,
     'compat': {},
     'specs': {'Общие': {'Тип': 'DisplayPort 1.4', 'Длина': '2 м'}}},

    # ---------------- THERMAL PASTE ----------------
    {'slug': 'paste-arctic', 'cat': 'thermal_paste', 'supplier': 'Склад RazPC', 'brand': 'Arctic', 'name': 'MX-6 4 г',
     'condition': 'new', 'purchase': 600, 'price': 890, 'in_stock': True, 'warranty': 12, 'weight': 50,
     'short_desc': 'Высокоэффективная термопаста для процессоров.',
     'short_specs': ['4 г', 'высокая теплопроводность'], 'perf': None,
     'compat': {},
     'specs': {'Общие': {'Масса': '4 г', 'Теплопроводность': 'высокая'}}},

    # ---------------- ACCESSORIES ----------------
    {'slug': 'acc-hub', 'cat': 'accessories', 'supplier': 'Склад RazPC', 'brand': 'DeepCool', 'name': 'ARGB-хаб SC790',
     'condition': 'new', 'purchase': 1200, 'price': 1600, 'in_stock': True, 'warranty': 12, 'weight': 150,
     'short_desc': 'Хаб для подключения ARGB-вентиляторов и подсветки.',
     'short_specs': ['ARGB', '6 портов'], 'perf': None,
     'compat': {},
     'specs': {'Общие': {'Порты': '6', 'Тип': 'ARGB / PWM'}}},
]

CITIES = [
    ('Москва', 'Москва', 1, True, 1), ('Санкт-Петербург', 'Санкт-Петербург', 1, True, 2),
    ('Екатеринбург', 'Свердловская обл.', 2, True, 3), ('Новосибирск', 'Новосибирская обл.', 3, True, 4),
    ('Казань', 'Татарстан', 2, True, 5), ('Нижний Новгород', 'Нижегородская обл.', 2, True, 6),
    ('Краснодар', 'Краснодарский край', 2, True, 7), ('Ростов-на-Дону', 'Ростовская обл.', 2, True, 8),
    ('Самара', 'Самарская обл.', 2, False, 9), ('Уфа', 'Башкортостан', 3, False, 10),
    ('Красноярск', 'Красноярский край', 3, False, 11), ('Владивосток', 'Приморский край', 4, False, 12),
    ('Хабаровск', 'Хабаровский край', 4, False, 13), ('Калининград', 'Калининградская обл.', 3, False, 14),
]

CATEGORIES = [
    ('cpu', 'Процессоры', 'Cpu', 'cpu', 10), ('gpu', 'Видеокарты', 'MonitorPlay', 'gpu', 20),
    ('motherboard', 'Материнские платы', 'CircuitBoard', 'motherboard', 30), ('ram', 'Оперативная память', 'MemoryStick', 'ram', 40),
    ('ssd', 'SSD', 'HardDrive', 'storage', 50), ('ssd_m2', 'SSD M.2', 'HardDrive', 'storage', 60),
    ('hdd', 'Жёсткие диски', 'HardDrive', 'storage', 70), ('psu', 'Блоки питания', 'Plug', 'psu', 80),
    ('case', 'Корпуса', 'Box', 'case', 90), ('air_cooler', 'Воздушное охлаждение', 'Snowflake', 'cooler', 100),
    ('liquid_cooler', 'СЖО', 'Droplets', 'cooler', 110), ('fan', 'Вентиляторы', 'Fan', 'fan', 120),
    ('monitor', 'Мониторы', 'Monitor', None, 130), ('peripherals', 'Периферия', 'Keyboard', None, 140),
    ('cables', 'Кабели', 'Cable', None, 150), ('thermal_paste', 'Термопаста', 'Paintbrush', None, 160),
    ('accessories', 'Аксессуары', 'Puzzle', None, 170),
]

SUPPLIERS = [('Регард (Москва)', 2), ('Ситилинк', 3), ('Ключевой дистрибьютор', 5), ('Склад RazPC', 0)]

PVZ = [
    ('Москва', [('ул. Тверская, 12', '09:00–21:00'), ('Ленинский пр-т, 45', '10:00–20:00'), ('ул. Арбат, 30', '09:00–22:00')]),
    ('Санкт-Петербург', [('Невский пр-т, 88', '09:00–21:00'), ('пр. Просвещения, 19', '10:00–20:00')]),
    ('Екатеринбург', [('ул. Малышева, 71', '09:00–20:00'), ('ул. 8 Марта, 46', '10:00–20:00')]),
    ('Новосибирск', [('Красный пр-т, 101', '09:00–20:00')]),
    ('Казань', [('ул. Баумана, 44', '09:00–21:00')]),
    ('Нижний Новгород', [('ул. Большая Покровская, 22', '09:00–20:00')]),
    ('Краснодар', [('ул. Красная, 155', '09:00–20:00')]),
    ('Ростов-на-Дону', [('ул. Большая Садовая, 60', '09:00–20:00')]),
    ('Самара', [('ул. Ленинградская, 30', '09:00–20:00')]),
    ('Уфа', [('пр. Октября, 25', '09:00–20:00')]),
    ('Красноярск', [('пр. Мира, 91', '09:00–20:00')]),
    ('Владивосток', [('ул. Светланская, 29', '09:00–19:00')]),
    ('Хабаровск', [('ул. Муравьёва-Амурского, 15', '09:00–19:00')]),
    ('Калининград', [('Ленинский пр-т, 30', '09:00–20:00')]),
]


DDL = '''
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    lead_days INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(40) UNIQUE NOT NULL,
    title VARCHAR(80) NOT NULL,
    icon VARCHAR(40) NOT NULL DEFAULT 'Package',
    config_slot VARCHAR(40),
    sort_order INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    brand VARCHAR(60) NOT NULL,
    name VARCHAR(180) NOT NULL,
    condition VARCHAR(10) NOT NULL DEFAULT 'new',
    purchase_price INTEGER NOT NULL DEFAULT 0,
    price INTEGER NOT NULL DEFAULT 0,
    old_price INTEGER,
    in_stock BOOLEAN NOT NULL DEFAULT FALSE,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    warranty_months INTEGER NOT NULL DEFAULT 12,
    weight_g INTEGER NOT NULL DEFAULT 500,
    length_mm INTEGER NOT NULL DEFAULT 200,
    width_mm INTEGER NOT NULL DEFAULT 150,
    height_mm INTEGER NOT NULL DEFAULT 60,
    short_desc VARCHAR(400),
    image_url TEXT,
    images JSONB NOT NULL DEFAULT '[]',
    short_specs JSONB NOT NULL DEFAULT '[]',
    specs JSONB NOT NULL DEFAULT '{}',
    compat JSONB NOT NULL DEFAULT '{}',
    perf_score INTEGER,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    region VARCHAR(120),
    zone INTEGER NOT NULL DEFAULT 3,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 100
);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE TABLE IF NOT EXISTS pickup_points (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(30) NOT NULL DEFAULT 'cdek',
    external_code VARCHAR(60),
    city_id INTEGER NOT NULL REFERENCES cities(id),
    address VARCHAR(300) NOT NULL,
    work_hours VARCHAR(120),
    lat NUMERIC(10,6),
    lon NUMERIC(10,6),
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_pvz_city ON pickup_points(city_id);
'''


def ensure_schema(cur):
    '''Sozdaet tablicy pod vladeltsem runtime-usera (app_rw) — garantiruet dostup k sequence.'''
    for stmt in DDL.strip().split(';'):
        s = stmt.strip()
        if s:
            cur.execute(s)


def ensure_seed(cur):
    '''Idempotentnyy seed spravochnikov i tovarov. Zapuskaetsya pri pervom obrashchenii.'''
    ensure_schema(cur)
    cur.execute('SELECT COUNT(*) AS c FROM products')
    if cur.fetchone()['c'] > 0:
        return

    for code, title, icon, slot, order in CATEGORIES:
        cur.execute(
            '''INSERT INTO product_categories (code, title, icon, config_slot, sort_order)
               VALUES (%s,%s,%s,%s,%s) ON CONFLICT (code) DO NOTHING''',
            (code, title, icon, slot, order))

    for name, lead in SUPPLIERS:
        cur.execute('SELECT id FROM suppliers WHERE name = %s', (name,))
        if not cur.fetchone():
            cur.execute('INSERT INTO suppliers (name, lead_days) VALUES (%s,%s)', (name, lead))

    for name, region, zone, popular, order in CITIES:
        cur.execute('SELECT id FROM cities WHERE name = %s', (name,))
        if not cur.fetchone():
            cur.execute(
                'INSERT INTO cities (name, region, zone, is_popular, sort_order) VALUES (%s,%s,%s,%s,%s)',
                (name, region, zone, popular, order))

    # PVZ
    for city_name, points in PVZ:
        cur.execute('SELECT id FROM cities WHERE name = %s', (city_name,))
        row = cur.fetchone()
        if not row:
            continue
        city_id = row['id']
        for addr, hours in points:
            cur.execute(
                '''INSERT INTO pickup_points (provider, city_id, address, work_hours, is_available)
                   VALUES ('cdek', %s, %s, %s, TRUE)''',
                (city_id, addr, hours))

    # Cat/supplier maps
    cur.execute('SELECT id, code FROM product_categories')
    cat_map = {r['code']: r['id'] for r in cur.fetchall()}
    cur.execute('SELECT id, name FROM suppliers')
    sup_map = {r['name']: r['id'] for r in cur.fetchall()}

    for p in PRODUCTS:
        cur.execute(
            '''INSERT INTO products
               (slug, category_id, supplier_id, brand, name, condition, purchase_price, price,
                in_stock, stock_qty, warranty_months, weight_g, length_mm, width_mm, height_mm,
                short_desc, short_specs, specs, compat, perf_score, is_featured)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (slug) DO NOTHING''',
            (p['slug'], cat_map[p['cat']], sup_map.get(p['supplier']), p['brand'], p['name'], p['condition'],
             p['purchase'], p['price'], p['in_stock'], 5 if p['in_stock'] else 0, p['warranty'],
             p.get('weight', 500), p.get('length', 200), p.get('width', 150), p.get('height', 60),
             p.get('short_desc'), json.dumps(p['short_specs'], ensure_ascii=False),
             json.dumps(p['specs'], ensure_ascii=False), json.dumps(p['compat'], ensure_ascii=False),
             p.get('perf'), p.get('perf') is not None and p['perf'] and p['perf'] > 80))