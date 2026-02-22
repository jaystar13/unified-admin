import { useState, useMemo } from 'react';
import { type PaginationState } from '@tanstack/react-table';
import { Flag, AlertTriangle } from 'lucide-react';
import { useReports } from '@/services/playerslog/hooks/useReports';
import type { GollReport } from '@/services/playerslog/types';
import { GOLL_REPORT_STATUS, GOLL_REPORT_STATUS_LABEL, getTeamDisplayName } from '@/services/playerslog/constants';
import { DataTable, DataTablePagination } from '@/shared/components/data-table';
import { getReportsColumns } from './reports/columns';

const EMPTY_REPORTS: GollReport[] = [];

const STATUS_FILTERS = [
  { key: 'all', label: '전체' },
  { key: GOLL_REPORT_STATUS.PENDING, label: GOLL_REPORT_STATUS_LABEL[GOLL_REPORT_STATUS.PENDING] },
  { key: GOLL_REPORT_STATUS.RESOLVED, label: GOLL_REPORT_STATUS_LABEL[GOLL_REPORT_STATUS.RESOLVED] },
  { key: GOLL_REPORT_STATUS.DISMISSED, label: GOLL_REPORT_STATUS_LABEL[GOLL_REPORT_STATUS.DISMISSED] },
];

export default function Reports() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<GollReport | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { data: reports = EMPTY_REPORTS, isLoading } = useReports(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const columns = useMemo(() => getReportsColumns(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">신고 관리</h2>
          <p className="text-sm text-slate-500 mt-1">사용자 신고 내역을 확인하고 팀 관계 정보를 기반으로 처리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-200px)] flex flex-col">
            <div className="p-4 border-b border-slate-200 shrink-0 bg-slate-50">
              <div className="flex bg-slate-100 rounded-lg p-1">
                {STATUS_FILTERS.map((sf) => (
                  <button
                    key={sf.key}
                    onClick={() => { setStatusFilter(sf.key); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      statusFilter === sf.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <DataTable
                columns={columns}
                data={reports}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
                emptyMessage="신고 내역이 없습니다."
                onRowClick={(row) => setSelectedReport(row.original)}
                rowClassName={(row) =>
                  selectedReport?.id === row.original.id ? 'bg-blue-50' : ''
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
          {selectedReport ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6 h-[calc(100vh-200px)] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-bold text-slate-900">신고 상세</h3>
                <span className="text-xs text-slate-500">{new Date(selectedReport.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>

              <div className="p-5 space-y-6 overflow-y-auto flex-1">
                {/* Team Relation Banner */}
                <TeamRelationBanner report={selectedReport} />

                {/* Report Info */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">신고 사유</label>
                  <p className="font-medium text-slate-900">{selectedReport.reason}</p>
                </div>

                {selectedReport.detail && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">상세 내용</label>
                    <div className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {selectedReport.detail}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">로그 ID</label>
                    <p className="font-bold text-sm text-slate-900">#{selectedReport.gollId}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">처리 상태</label>
                    <p className={`font-bold text-sm ${
                      selectedReport.status === GOLL_REPORT_STATUS.PENDING
                        ? 'text-yellow-600'
                        : selectedReport.status === GOLL_REPORT_STATUS.RESOLVED
                          ? 'text-green-600'
                          : 'text-slate-500'
                    }`}>
                      {GOLL_REPORT_STATUS_LABEL[selectedReport.status]}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">신고자 팀</label>
                    <p className="font-bold text-sm text-slate-900">{getTeamDisplayName(selectedReport.reporterTeam)}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">작성자 팀</label>
                    <p className="font-bold text-sm text-slate-900">{getTeamDisplayName(selectedReport.authorTeam)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">신고자 ID</label>
                  <p className="text-sm text-slate-600">{selectedReport.reporterId}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center h-[calc(100vh-200px)] flex flex-col items-center justify-center text-slate-400">
              <Flag size={48} className="mb-4 opacity-50" />
              <p className="font-medium">신고를 선택하여<br />상세 내용을 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamRelationBanner({ report }: { report: GollReport }) {
  if (!report.reporterTeam && !report.authorTeam) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-500 flex items-start gap-2">
        <Flag size={16} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">팀 정보 없음</span>
          <p>신고자 또는 작성자의 팀 정보가 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  const reporterLabel = getTeamDisplayName(report.reporterTeam);
  const authorLabel = getTeamDisplayName(report.authorTeam);

  if (report.isSameTeam) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 flex items-start gap-2">
        <Flag size={16} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">[{reporterLabel} → {authorLabel}] 같은 팀</span>
          <p>같은 팀 팬의 신고입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <div>
        <span className="font-bold block mb-0.5">[{reporterLabel} → {authorLabel}] 타팀 신고</span>
        <p>타팀 팬의 신고입니다. 악의적 신고 가능성을 확인해주세요.</p>
      </div>
    </div>
  );
}
