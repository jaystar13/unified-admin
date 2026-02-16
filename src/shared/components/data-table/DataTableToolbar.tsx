import { cn } from '@/shared/lib/utils';

interface DataTableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn(
      'p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 shrink-0 bg-slate-50',
      className,
    )}>
      {children}
    </div>
  );
}
