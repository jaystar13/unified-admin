import { type ColumnDef } from '@tanstack/react-table';
import type { Goll } from '@/services/playerslog/types';
import { GOLL_STATUS, REPORT_STATUS } from '@/services/playerslog/constants';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export function getGollsColumns(): ColumnDef<Goll, unknown>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="text-slate-500">#{row.original.id}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.original.type === 'Review' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {row.original.type}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900 truncate max-w-[180px] block">
          {row.original.title}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'author',
      header: '작성자',
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs">{row.original.author}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'report',
      header: () => <span className="text-center block">신고</span>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.reportStatus === REPORT_STATUS.REPORTED && (
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={14} />
            </div>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-right block">상태</span>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.status === GOLL_STATUS.HIDDEN ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <EyeOff size={12} /> 숨김
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
              <Eye size={12} /> 게시중
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ];
}
