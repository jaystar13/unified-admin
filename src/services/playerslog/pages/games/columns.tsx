import { type ColumnDef } from '@tanstack/react-table';
import type { Game } from '@/services/playerslog/types';
import { GAME_STATUS } from '@/services/playerslog/constants';
import { Clock, MapPin, RefreshCw, Edit2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/shared/components/data-table';

interface GamesColumnMeta {
  getOriginalGame: (id?: number) => Game | undefined;
  openEditModal: (game: Game) => void;
}

export function getGamesColumns(meta: GamesColumnMeta): ColumnDef<Game, unknown>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="일시/시즌" />
      ),
      cell: ({ row }) => {
        const game = row.original;
        const isCancelled = game.status === GAME_STATUS.CANCELLED;
        return (
          <div className="flex flex-col">
            <span className={`font-medium ${isCancelled ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-900'}`}>
              {game.date}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-mono bg-slate-100 px-1 rounded">{game.season}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {game.time}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'matchup',
      accessorFn: (row) => `${row.homeTeam} ${row.awayTeam}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="대진 (차전)" />
      ),
      cell: ({ row }) => {
        const game = row.original;
        const isCancelled = game.status === GAME_STATUS.CANCELLED;
        return (
          <div className={`flex flex-col ${isCancelled ? 'opacity-50' : ''}`}>
            <div className="font-bold text-slate-800 flex items-center gap-2">
              {game.homeTeam} <span className="text-slate-400 font-normal text-xs">vs</span> {game.awayTeam}
            </div>
            <span className="text-xs text-slate-500">{game.seriesNumber}차전</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'stadium',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="구장" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin size={14} className="text-slate-400" />
          {row.original.stadium}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="상태" />
      ),
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => {
        const game = row.original;
        const isCancelled = game.status === GAME_STATUS.CANCELLED;
        return (
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
              ${game.status === GAME_STATUS.SCHEDULED ? 'bg-blue-50 text-blue-700 border-blue-100' :
                game.status === GAME_STATUS.FINISHED ? 'bg-slate-100 text-slate-600 border-slate-200' :
                game.status === GAME_STATUS.CANCELLED ? 'bg-red-50 text-red-700 border-red-100' :
                'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
              {game.status}
            </span>
            {isCancelled && game.cancellationReason && (
              <div className="text-xs text-red-600 mt-1 font-medium pl-1">
                ({game.cancellationReason})
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'notes',
      header: '비고',
      cell: ({ row }) => {
        const game = row.original;
        if (!game.isRescheduled) return null;
        const originalGame = meta.getOriginalGame(game.originalGameId);
        return (
          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit text-xs">
            <RefreshCw size={12} />
            {originalGame ? `${originalGame.date} 취소분 대체` : '대체 일정'}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <span className="text-right block">관리</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              meta.openEditModal(row.original);
            }}
            className="text-slate-400 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition-colors"
            title="수정"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}
