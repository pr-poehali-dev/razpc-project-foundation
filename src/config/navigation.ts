export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const mainNav: NavItem[] = [
  { label: 'Главная', path: '/', icon: 'Home' },
  { label: 'Каталог', path: '/catalog', icon: 'LayoutGrid' },
  { label: 'Конфигуратор', path: '/configurator', icon: 'Cpu' },
  { label: 'Наши работы', path: '/works', icon: 'Wrench' },
  { label: 'О мастерской', path: '/about', icon: 'Building2' },
  { label: 'Блог', path: '/blog', icon: 'Newspaper' },
  { label: 'Отзывы', path: '/reviews', icon: 'Star' },
  { label: 'Контакты', path: '/contacts', icon: 'MapPin' },
];

export const authNav: NavItem[] = [
  { label: 'Личный кабинет', path: '/account', icon: 'User' },
  { label: 'Вход', path: '/login', icon: 'LogIn' },
  { label: 'Регистрация', path: '/register', icon: 'UserPlus' },
];

export const footerNav = {
  company: {
    title: 'Мастерская',
    items: [
      { label: 'О мастерской', path: '/about', icon: 'Building2' },
      { label: 'Наши работы', path: '/works', icon: 'Wrench' },
      { label: 'Отзывы', path: '/reviews', icon: 'Star' },
      { label: 'Блог', path: '/blog', icon: 'Newspaper' },
    ] as NavItem[],
  },
  services: {
    title: 'Услуги',
    items: [
      { label: 'Каталог', path: '/catalog', icon: 'LayoutGrid' },
      { label: 'Конфигуратор ПК', path: '/configurator', icon: 'Cpu' },
      { label: 'Контакты', path: '/contacts', icon: 'MapPin' },
    ] as NavItem[],
  },
  account: {
    title: 'Клиентам',
    items: authNav,
  },
};

export const siteInfo = {
  name: 'RazPC',
  tagline: 'Компьютерная мастерская',
  phone: '+7 (900) 000-00-00',
  email: 'info@razpc.ru',
  address: 'г. Москва, ул. Примерная, 1',
  workHours: 'Пн–Вс: 9:00 – 21:00',
};
