import { useState, useMemo } from 'react';
import { type SortingState, type PaginationState } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useUsers, useUpdateUserStatus } from '@/services/playerslog/hooks/useUsers';
import { USER_STATUS } from '@/services/playerslog/constants';
import { DataTable, DataTableToolbar, DataTablePagination } from '@/shared/components/data-table';
import { getUsersColumns } from './users/columns';

export default function Users() {
  const { data: users = [], isLoading } = useUsers();
  const updateStatus = useUpdateUserStatus();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const handleStatusChange = (id: string, newStatus: string) => {
    if (!confirm(`사용자 상태를 '${newStatus === USER_STATUS.SUSPENDED ? '정지' : '정상'}'(으)로 변경하시겠습니까?`)) return;
    updateStatus.mutate({ id, status: newStatus });
  };

  const columns = useMemo(
    () => getUsersColumns({ handleStatusChange }),
    [],
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">사용자 관리</h2>
          <p className="text-sm text-slate-500 mt-1">회원가입한 모든 사용자를 조회하고 상태를 변경합니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <DataTableToolbar>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="닉네임, 이메일 검색..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </DataTableToolbar>

        <div className="overflow-auto flex-1">
          <DataTable
            columns={columns}
            data={users}
            sorting={sorting}
            onSortingChange={setSorting}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            emptyMessage="사용자가 없습니다."
            renderFooter={(table) => <DataTablePagination table={table} />}
          />
        </div>
      </div>
    </div>
  );
}
