import { type ColumnDef } from '@tanstack/react-table';
import type { GollReport } from '@/services/playerslog/types';
import { GOLL_REPORT_STATUS, GOLL_REPORT_STATUS_LABEL } from '@/services/playerslog/constants';

function TeamRelationCell({ report }: { report: GollReport }) {
  if (!report.reporterTeam && !report.authorTeam) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-400">
        미설정
      </span>
    );
  }

  const reporterLabel = report.reporterTeam ?? '미설정';
  const authorLabel = report.authorTeam ?? '미설정';

  if (report.isSameTeam) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
        {reporterLabel} → {authorLabel}
        <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[10px]">같은 팀</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
      {reporterLabel} → {authorLabel}
      <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">타팀 신고</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = GOLL_REPORT_STATUS_LABEL[status] ?? status;

  if (status === GOLL_REPORT_STATUS.PENDING) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
        {label}
      </span>
    );
  }
  if (status === GOLL_REPORT_STATUS.RESOLVED) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
      {label}
    </span>
  );
}

export function getReportsColumns(): ColumnDef<GollReport, unknown>[] {
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
      accessorKey: 'gollId',
      header: '로그 ID',
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs">#{row.original.gollId}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'reason',
      header: '신고 사유',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900 text-xs truncate max-w-[140px] block">
          {row.original.reason}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'teamRelation',
      header: '팀 관계',
      cell: ({ row }) => <TeamRelationCell report={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-center block">상태</span>,
      cell: ({ row }) => (
        <div className="text-center">
          <StatusBadge status={row.original.status} />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: () => <span className="text-right block">신고일</span>,
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 block text-right">
          {new Date(row.original.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
      enableSorting: false,
    },
  ];
}
