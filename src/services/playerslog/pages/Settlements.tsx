import { useState, useMemo } from 'react';
import { type SortingState, type PaginationState } from '@tanstack/react-table';
import {
  Trophy, CheckCircle2, Save, XCircle, Calculator, AlertCircle,
  Coins, Search, Calendar, RefreshCcw
} from 'lucide-react';
import { useGames, useUpdateGame } from '@/services/playerslog/hooks/useGames';
import { useProcessSettlement, useCancelSettlement } from '@/services/playerslog/hooks/useSettlements';

import type { Game, UpdateGameInput } from '@/services/playerslog/types';
import { GAME_STATUS, SETTLEMENT_STATUS, MVP_TYPE, MVP_POSITION } from '@/services/playerslog/constants';
import { DataTable, DataTableToolbar, DataTablePagination } from '@/shared/components/data-table';
import { getSettlementsColumns } from './settlements/columns';

export default function Settlements() {
  const { data: finishedGames = [], isLoading } = useGames({ status: GAME_STATUS.FINISHED });
  const updateGame = useUpdateGame();
  const processSettlement = useProcessSettlement();
  const cancelSettlement = useCancelSettlement();

  // Sort: unsettled first, then by date desc
  const games = useMemo(() =>
    [...finishedGames].sort((a, b) => {
      if (a.settlementStatus === SETTLEMENT_STATUS.PENDING && b.settlementStatus !== SETTLEMENT_STATUS.PENDING) return -1;
      if (a.settlementStatus !== SETTLEMENT_STATUS.PENDING && b.settlementStatus === SETTLEMENT_STATUS.PENDING) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }),
    [finishedGames],
  );

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState<'all' | 'unsettled' | 'settled'>('all');
  const [dateFilter, setDateFilter] = useState('');

  // DataTable States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({});

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({
      homeScore: game.homeScore || 0,
      awayScore: game.awayScore || 0,
      winner: game.winner || (game.homeScore > game.awayScore ? game.homeTeam : game.awayScore > game.homeScore ? game.awayTeam : ''),
      mvp: game.mvp || '',
      mvpType: game.mvpType,
      mvpPosition: game.mvpPosition,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      status: game.status === GAME_STATUS.IN_PROGRESS ? GAME_STATUS.FINISHED : game.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
    setFormData({});
  };

  const handleSave = (autoSettle = false) => {
    if (!editingGame) return;

    const updates: UpdateGameInput = {
      homeScore: formData.homeScore,
      awayScore: formData.awayScore,
      winner: formData.winner,
      mvp: formData.mvp,
      mvpType: formData.mvpType,
      mvpPosition: formData.mvpPosition,
      status: GAME_STATUS.FINISHED,
    };

    updateGame.mutate(
      { id: editingGame.id, data: updates },
      {
        onSuccess: () => {
          if (autoSettle) {
            processSettlement.mutate(editingGame.id, {
              onSuccess: (result) => {
                closeModal();
                alert(`정산 완료: ${result.totalParticipants}명 참여, ${result.totalPointsAwarded}pt 지급`);
              },
              onError: (error: Error) => {
                closeModal();
                alert(`결과는 저장되었으나 정산 실패: ${error.message}`);
              },
            });
          } else {
            closeModal();
          }
        },
      },
    );
  };

  const handleProcessSettlement = (game: Game) => {
    if (!game.winner) {
      alert('경기 결과(승리팀)가 입력되지 않았습니다. 결과수정에서 먼저 입력해주세요.');
      return;
    }
    if (!confirm(`${game.homeTeam} vs ${game.awayTeam} 경기를 정산하시겠습니까?\n예측 참여자에게 포인트가 지급됩니다.`)) return;

    processSettlement.mutate(game.id, {
      onSuccess: (result) => {
        alert(`정산 완료: ${result.totalParticipants}명 참여, ${result.totalPointsAwarded}pt 지급`);
      },
      onError: (error: Error) => {
        alert(`정산 실패: ${error.message}`);
      },
    });
  };

  const handleCancelSettlement = (game: Game) => {
    if (!confirm(`${game.homeTeam} vs ${game.awayTeam} 경기의 정산을 취소하시겠습니까?\n지급된 포인트가 모두 회수됩니다.`)) return;

    cancelSettlement.mutate(game.id, {
      onSuccess: (result) => {
        alert(`정산 취소 완료: ${result.rolledBackParticipants}명, ${result.rolledBackPoints}pt 회수`);
      },
      onError: (error: Error) => {
        alert(`정산 취소 실패: ${error.message}`);
      },
    });
  };

  // Filter Logic
  const filteredGames = useMemo(() =>
    games.filter((game) => {
      if (settlementFilter === 'unsettled' && game.settlementStatus === SETTLEMENT_STATUS.COMPLETED) return false;
      if (settlementFilter === 'settled' && game.settlementStatus !== SETTLEMENT_STATUS.COMPLETED) return false;
      if (dateFilter && !game.date.startsWith(dateFilter)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const target = `${game.homeTeam} ${game.awayTeam} ${game.stadium} ${game.mvp || ''} ${game.date}`.toLowerCase();
        if (!target.includes(term)) return false;
      }
      return true;
    }),
    [games, settlementFilter, dateFilter, searchTerm],
  );

  const totalUnsettled = games.filter((g) => g.settlementStatus === SETTLEMENT_STATUS.PENDING).length;

  const columns = useMemo(
    () => getSettlementsColumns({ openEditModal, handleProcessSettlement, handleCancelSettlement }),
    [],
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">정산 관리</h2>
          <p className="text-sm text-slate-500 mt-1">경기 결과를 확정하고 MVP를 선정하여 포인트를 정산합니다.</p>
        </div>
        <div className="flex gap-2">
          <div className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 transition-colors
            ${totalUnsettled > 0 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {totalUnsettled > 0 ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            미정산: {totalUnsettled}건
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Filter Toolbar */}
        <DataTableToolbar className="flex-col lg:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="팀명, 구장, MVP 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex bg-white rounded-lg border border-slate-300 p-1">
              <button
                onClick={() => setSettlementFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${settlementFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                전체
              </button>
              <div className="w-px bg-slate-200 my-1 mx-1" />
              <button
                onClick={() => setSettlementFilter('unsettled')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${settlementFilter === 'unsettled' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:text-amber-700'}`}
              >
                <AlertCircle size={14} /> 미정산
              </button>
              <div className="w-px bg-slate-200 my-1 mx-1" />
              <button
                onClick={() => setSettlementFilter('settled')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${settlementFilter === 'settled' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:text-green-700'}`}
              >
                <CheckCircle2 size={14} /> 정산완료
              </button>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setDateFilter(''); setSettlementFilter('all'); }}
              className="p-2 border border-slate-300 rounded-lg bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              title="필터 초기화"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </DataTableToolbar>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <DataTable
            columns={columns}
            data={filteredGames}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            emptyMessage={games.length === 0 ? '정산 대상 경기가 없습니다.' : '검색 결과가 없습니다.'}
            renderFooter={(table) => <DataTablePagination table={table} />}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Calculator className="text-blue-600" /> 경기 결과 입력
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">스코어 입력</label>
                <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-center w-1/3">
                    <div className="font-bold text-slate-700 mb-2">{editingGame.homeTeam} (Home)</div>
                    <input
                      type="number"
                      min="0"
                      value={formData.homeScore}
                      onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) || 0 })}
                      className="w-full text-center text-2xl font-bold border-slate-300 rounded-lg focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-slate-400 font-black text-xl">:</div>
                  <div className="text-center w-1/3">
                    <div className="font-bold text-slate-700 mb-2">{editingGame.awayTeam} (Away)</div>
                    <input
                      type="number"
                      min="0"
                      value={formData.awayScore}
                      onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) || 0 })}
                      className="w-full text-center text-2xl font-bold border-slate-300 rounded-lg focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Winner Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">승리팀 선택</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: editingGame.homeTeam })}
                    className={`py-2 px-4 rounded-lg border font-bold transition-all
                      ${formData.winner === editingGame.homeTeam
                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                  >
                    {editingGame.homeTeam} 승리
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: editingGame.awayTeam })}
                    className={`py-2 px-4 rounded-lg border font-bold transition-all
                      ${formData.winner === editingGame.awayTeam
                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                  >
                    {editingGame.awayTeam} 승리
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 my-4" />

              {/* MVP Section */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Trophy size={14} className="text-amber-500" /> MVP 선정
                </label>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="MVP 선수 이름 입력"
                    value={formData.mvp || ''}
                    onChange={(e) => setFormData({ ...formData, mvp: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />

                  {/* Type */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mvpType: MVP_TYPE.PITCHER, mvpPosition: MVP_POSITION.STARTER })}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all
                        ${formData.mvpType === MVP_TYPE.PITCHER ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      투수 (Pitcher)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mvpType: MVP_TYPE.BATTER, mvpPosition: MVP_POSITION.CENTER })}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all
                        ${formData.mvpType === MVP_TYPE.BATTER ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      타자 (Batter)
                    </button>
                  </div>

                  {/* Position Detail */}
                  {formData.mvpType && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.mvpType === MVP_TYPE.PITCHER ? (
                        <>
                          {[
                            { id: MVP_POSITION.STARTER, label: '선발승' },
                            { id: MVP_POSITION.MIDDLE, label: '중간계투' },
                            { id: MVP_POSITION.CLOSER, label: '마무리/세이브' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, mvpPosition: pos.id })}
                              className={`py-1.5 px-2 text-xs font-medium rounded border transition-all
                                ${formData.mvpPosition === pos.id
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {[
                            { id: MVP_POSITION.TOP, label: '선두 (1~2번)' },
                            { id: MVP_POSITION.CENTER, label: '중심 (3~5번)' },
                            { id: MVP_POSITION.BOTTOM, label: '하위 (6~9번)' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, mvpPosition: pos.id })}
                              className={`py-1.5 px-2 text-xs font-medium rounded border transition-all
                                ${formData.mvpPosition === pos.id
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleSave(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} /> 저장만 하기
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Coins size={16} /> 저장 및 정산
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
