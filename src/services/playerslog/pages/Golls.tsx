import { useState, useMemo } from 'react';
import { type PaginationState } from '@tanstack/react-table';
import { FileText, EyeOff, ExternalLink, Search, AlertTriangle, Check } from 'lucide-react';
import { useGolls, useUpdateGollStatus } from '@/services/playerslog/hooks/useGolls';
import type { Goll } from '@/services/playerslog/types';
import { GOLL_STATUS, REPORT_STATUS } from '@/services/playerslog/constants';
import { DataTable, DataTablePagination } from '@/shared/components/data-table';
import { getGollsColumns } from './golls/columns';

const EMPTY_GOLLS: Goll[] = [];

export default function Golls() {
  const [filter, setFilter] = useState('all');
  const [selectedGoll, setSelectedGoll] = useState<Goll | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { data: golls = EMPTY_GOLLS, isLoading } = useGolls(
    filter === 'reported' ? { reportStatus: REPORT_STATUS.REPORTED } : undefined
  );
  const updateStatus = useUpdateGollStatus();

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === GOLL_STATUS.ACTIVE ? GOLL_STATUS.HIDDEN : GOLL_STATUS.ACTIVE;
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        if (selectedGoll?.id === id) {
          setSelectedGoll({ ...selectedGoll, status: newStatus as Goll['status'] });
        }
      }
    });
  };

  const columns = useMemo(() => getGollsColumns(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">작성 로그 관리</h2>
          <p className="text-sm text-slate-500 mt-1">사용자가 작성한 모든 게시글을 관리하고 신고 내역을 처리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-200px)] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex gap-4 shrink-0 bg-slate-50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="제목, 작성자 검색..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilter('reported')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${filter === 'reported' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <AlertTriangle size={14} />
                  신고됨
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <DataTable
                columns={columns}
                data={golls}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
                emptyMessage="로그가 없습니다."
                onRowClick={(row) => setSelectedGoll(row.original)}
                rowClassName={(row) =>
                  selectedGoll?.id === row.original.id ? 'bg-blue-50' : ''
                }
                stickyHeader={true}
                className="text-sm"
                renderFooter={(table) => <DataTablePagination table={table} />}
              />
            </div>
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-1">
          {selectedGoll ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6 h-[calc(100vh-200px)] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-bold text-slate-900">상세 정보</h3>
                <span className="text-xs text-slate-500">{new Date(selectedGoll.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>

              <div className="p-5 space-y-6 overflow-y-auto flex-1">
                {selectedGoll.reportStatus === REPORT_STATUS.REPORTED && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-1">신고 접수된 게시글입니다</span>
                      <p>사유: {selectedGoll.reportReason || '부적절한 내용'}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">제목</label>
                  <p className="font-medium text-lg text-slate-900 break-words leading-snug">{selectedGoll.title}</p>
                </div>

                <div className="flex items-center gap-3 py-2 border-y border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {selectedGoll.author.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{selectedGoll.author}</p>
                    <p className="text-xs text-slate-500">ID: {selectedGoll.authorId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {selectedGoll.prediction && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">예측</label>
                      <p className={`font-bold text-sm ${selectedGoll.prediction === 'Win' ? 'text-blue-600' : 'text-red-600'}`}>
                        {selectedGoll.prediction === 'Win' ? '승리' : '패배'}
                      </p>
                    </div>
                  )}
                  {selectedGoll.mvp && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">MVP</label>
                      <p className="font-bold text-sm text-slate-900">{selectedGoll.mvp}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">내용</label>
                  <div className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100 min-h-[120px] whitespace-pre-wrap">
                    {selectedGoll.content}
                  </div>
                </div>

                {selectedGoll.link && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">관련 링크</label>
                    <a
                      href={selectedGoll.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline text-xs break-all bg-blue-50 p-3 rounded-lg"
                    >
                      <ExternalLink size={14} className="flex-shrink-0" />
                      {selectedGoll.link}
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  onClick={() => handleStatusToggle(selectedGoll.id, selectedGoll.status)}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm
                    ${selectedGoll.status === GOLL_STATUS.ACTIVE
                      ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
                      : 'bg-green-600 text-white hover:bg-green-700 border border-transparent'}`}
                >
                  {selectedGoll.status === GOLL_STATUS.ACTIVE ? (
                    <><EyeOff size={16} /> 숨김 처리 (Blind)</>
                  ) : (
                    <><Check size={16} /> 게시 복구 (Un-hide)</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center h-[calc(100vh-200px)] flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="font-medium">로그를 선택하여<br />상세 내용을 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
