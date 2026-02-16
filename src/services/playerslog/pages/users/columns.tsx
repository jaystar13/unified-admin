import { type ColumnDef } from '@tanstack/react-table';
import type { User } from '@/services/playerslog/types';
import { USER_STATUS } from '@/services/playerslog/constants';
import { User as UserIcon, ShieldAlert, ShieldCheck, Ban } from 'lucide-react';
import { DataTableColumnHeader } from '@/shared/components/data-table';

interface UsersColumnMeta {
  handleStatusChange: (id: string, newStatus: string) => void;
}

export function getUsersColumns(meta: UsersColumnMeta): ColumnDef<User, unknown>[] {
  return [
    {
      accessorKey: 'id',
      header: 'User ID',
      cell: ({ row }) => (
        <span className="text-slate-500 font-mono text-xs">
          {row.original.id.slice(0, 8)}...
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'nickname',
      header: '닉네임',
      cell: ({ row }) => (
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
            <UserIcon size={12} />
          </div>
          {row.original.nickname}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: '이메일',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.email}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="가입일" />
      ),
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs">
          {new Date(row.original.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      accessorKey: 'reportedCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="신고 누적" />
      ),
      cell: ({ row }) => {
        const count = row.original.reportedCount;
        return count > 0 ? (
          <span className="text-red-600 font-bold flex items-center gap-1">
            <ShieldAlert size={14} /> {count}회
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="상태" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${user.status === USER_STATUS.ACTIVE ? 'bg-green-50 text-green-700 border-green-100' :
              user.status === USER_STATUS.SUSPENDED ? 'bg-red-50 text-red-700 border-red-100' :
              'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
            {user.status === USER_STATUS.ACTIVE ? <ShieldCheck size={12} /> : <Ban size={12} />}
            {user.status === USER_STATUS.ACTIVE ? '정상' : user.status === USER_STATUS.SUSPENDED ? '정지' : user.status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="text-right block">관리</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {user.status === USER_STATUS.ACTIVE ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  meta.handleStatusChange(user.id, USER_STATUS.SUSPENDED);
                }}
                className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                이용 정지
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  meta.handleStatusChange(user.id, USER_STATUS.ACTIVE);
                }}
                className="text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                정지 해제
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
