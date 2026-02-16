import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  type OnChangeFn,
  type Row,
  type Table as TanStackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);

  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: Row<TData>) => void;
  rowClassName?: (row: Row<TData>) => string;

  stickyHeader?: boolean;
  className?: string;
  renderFooter?: (table: TanStackTable<TData>) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection,
  isLoading,
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
  rowClassName,
  stickyHeader = true,
  className,
  renderFooter,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      ...(sorting !== undefined && { sorting }),
      ...(globalFilter !== undefined && { globalFilter }),
      ...(columnFilters !== undefined && { columnFilters }),
      ...(pagination !== undefined && { pagination }),
      ...(rowSelection !== undefined && { rowSelection }),
    },
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onPaginationChange,
    onRowSelectionChange,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    ...(sorting !== undefined && { getSortedRowModel: getSortedRowModel() }),
    ...((globalFilter !== undefined || columnFilters !== undefined) && {
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(pagination !== undefined && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
  });

  return (
    <>
      <Table className={className}>
        <TableHeader
          className={cn(
            stickyHeader && 'sticky top-0 z-10 bg-slate-50',
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-slate-200 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-6 py-4 text-slate-600 font-medium"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-slate-200">
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="text-center py-20 text-slate-500">
                로딩중...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="text-center py-20 text-slate-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(row),
                )}
                onClick={() => onRowClick?.(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {renderFooter?.(table)}
    </>
  );
}
