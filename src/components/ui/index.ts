// ===== RazPC Design System — единая точка импорта UI-примитивов =====

// Кнопки
export { Button, buttonVariants } from './button';

// Поля ввода и управление
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
export {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectSeparator, SelectTrigger, SelectValue,
} from './select';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';

// Отображение данных
export { Badge, badgeVariants } from './badge';
export {
  Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent,
} from './card';
export {
  Table, TableBody, TableCaption, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
} from './table';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Навигация
export {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis,
} from './breadcrumb';
export {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from './pagination';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from './accordion';

// Оверлеи и обратная связь
export {
  Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from './dialog';
export { Toaster } from './toaster';
export { useToast, toast } from './use-toast';

// Состояния
export { Skeleton } from './skeleton';
export { Spinner } from './spinner';
export { EmptyState } from './empty-state';

// Иконки
export { default as Icon } from './icon';
