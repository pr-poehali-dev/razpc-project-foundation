export interface ComponentOption {
  id: string;
  name: string;
  spec: string;
  price: number;
}

export interface ConfigSlot {
  type: string;
  title: string;
  icon: string;
  required: boolean;
  hint: string;
  options: ComponentOption[];
}

export const configSlots: ConfigSlot[] = [
  {
    type: 'CPU', title: 'Процессор', icon: 'Cpu', required: true,
    hint: 'Сердце компьютера — отвечает за общую производительность',
    options: [
      { id: 'cpu-1', name: 'Intel Core i3-12100F', spec: '4 ядра, 8 потоков, до 4.3 ГГц', price: 8500 },
      { id: 'cpu-2', name: 'Intel Core i5-13400F', spec: '10 ядер, 16 потоков, до 4.6 ГГц', price: 17500 },
      { id: 'cpu-3', name: 'AMD Ryzen 5 7600', spec: '6 ядер, 12 потоков, до 5.1 ГГц', price: 19500 },
      { id: 'cpu-4', name: 'Intel Core i7-13700F', spec: '16 ядер, 24 потока, до 5.2 ГГц', price: 33000 },
      { id: 'cpu-5', name: 'AMD Ryzen 7 7800X3D', spec: '8 ядер, 16 потоков, 3D V-Cache', price: 42000 },
    ],
  },
  {
    type: 'MOTHERBOARD', title: 'Материнская плата', icon: 'CircuitBoard', required: true,
    hint: 'Основа, объединяющая все комплектующие',
    options: [
      { id: 'mb-1', name: 'ASUS PRIME H610M-K', spec: 'mATX, LGA1700, DDR5', price: 9000 },
      { id: 'mb-2', name: 'MSI B760 GAMING PLUS', spec: 'ATX, LGA1700, DDR5', price: 15500 },
      { id: 'mb-3', name: 'Gigabyte B650 AORUS ELITE', spec: 'ATX, AM5, DDR5', price: 18500 },
    ],
  },
  {
    type: 'GPU', title: 'Видеокарта', icon: 'MonitorPlay', required: true,
    hint: 'Отвечает за графику в играх и профессиональных задачах',
    options: [
      { id: 'gpu-1', name: 'NVIDIA RTX 4060', spec: '8 GB GDDR6, Full HD', price: 32000 },
      { id: 'gpu-2', name: 'NVIDIA RTX 4060 Ti', spec: '16 GB GDDR6, 1440p', price: 45000 },
      { id: 'gpu-3', name: 'NVIDIA RTX 4070 Super', spec: '12 GB GDDR6X, 2K/4K', price: 68000 },
      { id: 'gpu-4', name: 'NVIDIA RTX 4080 Super', spec: '16 GB GDDR6X, 4K', price: 105000 },
    ],
  },
  {
    type: 'RAM', title: 'Оперативная память', icon: 'MemoryStick', required: true,
    hint: 'Влияет на скорость работы и многозадачность',
    options: [
      { id: 'ram-1', name: 'Kingston FURY 16 GB', spec: '2×8 GB, DDR5-5200', price: 5500 },
      { id: 'ram-2', name: 'Kingston FURY 32 GB', spec: '2×16 GB, DDR5-6000', price: 10500 },
      { id: 'ram-3', name: 'Corsair Vengeance 64 GB', spec: '2×32 GB, DDR5-6000', price: 21000 },
    ],
  },
  {
    type: 'SSD', title: 'Накопитель', icon: 'HardDrive', required: true,
    hint: 'Скорость загрузки системы и приложений',
    options: [
      { id: 'ssd-1', name: 'Samsung 980 1 TB', spec: 'NVMe M.2, до 3500 МБ/с', price: 7500 },
      { id: 'ssd-2', name: 'Samsung 990 Pro 1 TB', spec: 'NVMe M.2, до 7450 МБ/с', price: 11000 },
      { id: 'ssd-3', name: 'Samsung 990 Pro 2 TB', spec: 'NVMe M.2, до 7450 МБ/с', price: 19000 },
    ],
  },
  {
    type: 'PSU', title: 'Блок питания', icon: 'Plug', required: true,
    hint: 'Обеспечивает стабильное и надёжное питание',
    options: [
      { id: 'psu-1', name: 'DeepCool PK650D', spec: '650 Вт, 80+ Bronze', price: 5500 },
      { id: 'psu-2', name: 'be quiet! Pure Power 12 750W', spec: '750 Вт, 80+ Gold', price: 9500 },
      { id: 'psu-3', name: 'Corsair RM850e', spec: '850 Вт, 80+ Gold', price: 13000 },
    ],
  },
  {
    type: 'CASE', title: 'Корпус', icon: 'Box', required: true,
    hint: 'Внешний вид, охлаждение и удобство обслуживания',
    options: [
      { id: 'case-1', name: 'DeepCool CC560', spec: 'ATX, 4 вентилятора', price: 5000 },
      { id: 'case-2', name: 'Lian Li Lancool 216', spec: 'ATX, сетчатый фронт', price: 9000 },
      { id: 'case-3', name: 'NZXT H7 Flow', spec: 'ATX, премиум-сборка', price: 13500 },
    ],
  },
  {
    type: 'COOLER', title: 'Охлаждение', icon: 'Snowflake', required: false,
    hint: 'Дополнительное охлаждение процессора (необязательно)',
    options: [
      { id: 'cool-1', name: 'DeepCool AK400', spec: 'Башенный кулер', price: 3000 },
      { id: 'cool-2', name: 'be quiet! Dark Rock 4', spec: 'Тихий башенный', price: 6500 },
      { id: 'cool-3', name: 'Arctic Liquid Freezer III 360', spec: 'Жидкостное 360 мм', price: 12000 },
    ],
  },
];
