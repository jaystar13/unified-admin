import { type ColumnDef } from '@tanstack/react-table';
import type { Game } from '@/services/playerslog/types';
import { GAME_STATUS, SETTLEMENT_STATUS, MVP_TYPE, MVP_POSITION } from '@/services/playerslog/constants';
import { Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataTableColumnHeader } from '@/shared/components/data-table';

interface SettlementsColumnMeta {
  openEditModal: (game: Game) => void;
  handleProcessSettlement: (game: Game) => void;
  handleCancelSettlement: (game: Game) => void;
}

export function getSettlementsColumns(meta: SettlementsColumnMeta): ColumnDef<Game, unknown>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="날짜/구장" />
      ),
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div>
            <div className="font-medium text-slate-900">{game.date}</div>
            <div className="text-xs text-slate-600 mt-0.5">{game.stadium}</div>
          </div>
        );
      },
    },
    {
      id: 'result',
      header: () => <span className="text-center block">결과 (Home : Away)</span>,
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div>
            <div className="flex items-center justify-center gap-3">
              <span className={`font-bold ${game.winner === game.homeTeam ? 'text-blue-600' : 'text-slate-700'}`}>{game.homeTeam}</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono font-bold">
                {game.homeScore} : {game.awayScore}
              </span>
              <span className={`font-bold ${game.winner === game.awayTeam ? 'text-blue-600' : 'text-slate-700'}`}>{game.awayTeam}</span>
            </div>
            {game.status === GAME_STATUS.CANCELLED && (
              <div className="text-center text-xs text-red-500 mt-1 font-medium">({game.cancellationReason || '취소'})</div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'mvp',
      header: 'MVP 정보',
      cell: ({ row }) => {
        const game = row.original;
        if (game.status === GAME_STATUS.CANCELLED) {
          return <span className="text-slate-400 text-xs">-</span>;
        }
        if (!game.mvp) {
          return <span className="text-slate-400 text-xs">미선정</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Trophy size={14} className="text-amber-500" />
              {game.mvp}
            </div>
            {(game.mvpType || game.mvpPosition) && (
              <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                {game.mvpType === MVP_TYPE.PITCHER ? '투수' : game.mvpType === MVP_TYPE.BATTER ? '타자' : ''}
                {game.mvpPosition && ` · ${
                  game.mvpPosition === MVP_POSITION.STARTER ? '선발' :
                  game.mvpPosition === MVP_POSITION.MIDDLE ? '중간' :
                  game.mvpPosition === MVP_POSITION.CLOSER ? '마무리' :
                  game.mvpPosition === MVP_POSITION.TOP ? '선두(1-2)' :
                  game.mvpPosition === MVP_POSITION.CENTER ? '중심(3-5)' :
                  game.mvpPosition === MVP_POSITION.BOTTOM ? '하위(6-9)' : game.mvpPosition
                }`}
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'settlementStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="정산 상태" className="justify-center" />
      ),
      cell: ({ row }) => {
        const game = row.original;
        if (game.status === GAME_STATUS.CANCELLED) {
          return <div className="text-center"><span className="text-xs text-slate-400">대상아님</span></div>;
        }
        return (
          <div className="text-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
              ${game.settlementStatus === SETTLEMENT_STATUS.COMPLETED
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {game.settlementStatus === SETTLEMENT_STATUS.COMPLETED ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {game.settlementStatus || SETTLEMENT_STATUS.PENDING}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="text-right block">관리</span>,
      cell: ({ row }) => {
        const game = row.original;
        if (game.status === GAME_STATUS.CANCELLED) return null;
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                meta.openEditModal(game);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              결과수정
            </button>
            {game.settlementStatus === SETTLEMENT_STATUS.COMPLETED ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  meta.handleCancelSettlement(game);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white rounded shadow-sm transition-colors flex items-center gap-1 bg-slate-400 hover:bg-slate-500"
              >
                정산취소
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  meta.handleProcessSettlement(game);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white rounded shadow-sm transition-colors flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              >
                정산하기
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
