import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { type Item, type Operation, OPERATION_LABELS, OPERATION_ICONS } from '@/api/warehouse';

interface Props {
  item: Item;
  onOperation: (op: Operation, item: Item) => void;
  onEdit: (item: Item) => void;
  onOpen: (item: Item) => void;
}

const OPS: Operation[] = ['income', 'reserve', 'build', 'transfer', 'return', 'write_off', 'correction'];

const ItemActionsMenu = ({ item, onOperation, onEdit, onOpen }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon name="EllipsisVertical" size={16} />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuItem onClick={() => onOpen(item)}>
        <Icon name="Eye" size={15} className="mr-2" /> Открыть карточку
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(item)}>
        <Icon name="Pencil" size={15} className="mr-2" /> Редактировать
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {OPS.map((op) => (
        <DropdownMenuItem key={op} onClick={() => onOperation(op, item)}>
          <Icon name={OPERATION_ICONS[op]} size={15} className="mr-2" />
          {OPERATION_LABELS[op]}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default ItemActionsMenu;
