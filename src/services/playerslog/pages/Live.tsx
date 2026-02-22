import { useState } from 'react';
import {
  PlayCircle, PauseCircle, CheckCircle2, XCircle,
  Minus, Plus, Calendar as CalendarIcon, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useGames, useUpdateGame } from '@/services/playerslog/hooks/useGames';
import type { Game, UpdateGameInput } from '@/services/playerslog/types';
import { GAME_STATUS, getTeamDisplayName, getStadiumDisplayName } from '@/services/playerslog/constants';

export default function Live() {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeModal, setActiveModal] = useState<'cancel' | 'suspend' | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  const { data: allGames = [], isLoading, refetch } = useGames();
  const updateGame = useUpdateGame();

  const filteredGames = allGames.filter((g) => g.date === targetDate);
  const ongoingCount = filteredGames.filter((g) => g.status === GAME_STATUS.IN_PROGRESS).length;
  const finishedCount = filteredGames.filter((g) => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.CANCELLED).length;

  const doUpdate = (id: number, data: UpdateGameInput) => {
    updateGame.mutate({ id, data });
  };

  const handleScoreChange = (game: Game, team: 'home' | 'away', delta: number) => {
    const key = team === 'home' ? 'homeScore' : 'awayScore';
    const newScore = Math.max(0, (game[key] || 0) + delta);
    doUpdate(game.id, { [key]: newScore });
  };

  const handleStatusAction = (action: string, gameId: number) => {
    if (action === 'start') {
      doUpdate(gameId, { status: GAME_STATUS.IN_PROGRESS, detailStatus: '' });
    } else if (action === 'finish') {
      if (confirm('경기를 종료하시겠습니까?')) {
        doUpdate(gameId, { status: GAME_STATUS.FINISHED, detailStatus: '' });
      }
    } else if (action === 'cancel_prompt') {
      setSelectedGameId(gameId);
      setReasonInput('우천취소');
      setActiveModal('cancel');
    } else if (action === 'suspend_prompt') {
      setSelectedGameId(gameId);
      setReasonInput('우천 중단');
      setActiveModal('suspend');
    } else if (action === 'resume') {
      doUpdate(gameId, { status: GAME_STATUS.IN_PROGRESS, detailStatus: '' });
    } else if (action === 'reset') {
      if (confirm('경기 상태를 [예정]으로 초기화하시겠습니까? 점수도 0:0으로 초기화됩니다.')) {
        doUpdate(gameId, { status: GAME_STATUS.SCHEDULED, detailStatus: '', homeScore: 0, awayScore: 0 });
      }
    }
  };

  const confirmModalAction = () => {
    if (!selectedGameId) return;

    if (activeModal === 'cancel') {
      doUpdate(selectedGameId, {
        status: GAME_STATUS.CANCELLED,
        cancellationReason: reasonInput,
        detailStatus: '',
      });
    } else if (activeModal === 'suspend') {
      doUpdate(selectedGameId, {
        status: GAME_STATUS.IN_PROGRESS,
        detailStatus: reasonInput,
      });
    }

    setActiveModal(null);
    setSelectedGameId(null);
    setReasonInput('');
  };

  const navigateDate = (delta: number) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + delta);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">라이브 운영</h2>
          <p className="text-sm text-slate-500 mt-1">실시간 스코어 입력 및 경기 상태(중단, 취소 등)를 관리합니다.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-slate-100 rounded-md text-slate-500">
            ←
          </button>
          <div className="flex items-center gap-2 px-2">
            <CalendarIcon size={18} className="text-blue-600" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="border-none text-slate-900 font-bold text-lg focus:ring-0 cursor-pointer p-0"
            />
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-slate-100 rounded-md text-slate-500">
            →
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button onClick={() => refetch()} className="p-2 hover:bg-slate-100 rounded-md text-slate-500" title="새로고침">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-3">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
          총 경기: {filteredGames.length}
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-100 animate-pulse">
          진행중: {ongoingCount}
        </div>
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-bold border border-slate-200">
          종료/취소: {finishedCount}
        </div>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-slate-300" size={32} />
            <span className="text-sm">경기 데이터를 불러오는 중...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">선택한 날짜 ({targetDate})에 예정된 경기가 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">상단 날짜를 변경하거나 경기 일정 메뉴에서 일정을 등록하세요.</p>
          </div>
        ) : filteredGames.map((game) => {
          const isSuspended = game.detailStatus && game.detailStatus.includes('중단');

          return (
            <div key={game.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
              {/* Header */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{getStadiumDisplayName(game.stadium)}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-semibold text-slate-500">{game.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {game.detailStatus && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle size={10} /> {game.detailStatus}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border
                    ${game.status === GAME_STATUS.IN_PROGRESS ? 'bg-red-100 text-red-600 border-red-200' :
                      game.status === GAME_STATUS.SCHEDULED ? 'bg-blue-100 text-blue-600 border-blue-200' :
                      game.status === GAME_STATUS.CANCELLED ? 'bg-slate-100 text-slate-500 line-through border-slate-200' :
                      'bg-gray-800 text-white border-gray-900'}`}>
                    {game.status}
                  </span>
                </div>
              </div>

              {/* Scoreboard Area */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                  {/* Home Team */}
                  <div className="flex flex-col items-center w-1/3 gap-2">
                    <span className="text-xl font-bold text-slate-900">{getTeamDisplayName(game.homeTeam)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleScoreChange(game, 'home', -1)}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={game.homeScore}
                        onChange={(e) => doUpdate(game.id, { homeScore: parseInt(e.target.value) || 0 })}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-12 text-center text-2xl font-bold border-none bg-transparent focus:ring-0 p-0"
                      />
                      <button
                        onClick={() => handleScoreChange(game, 'home', 1)}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* VS / Inning */}
                  <div className="flex flex-col items-center justify-center w-1/3">
                    <span className="text-slate-300 font-black text-2xl">VS</span>
                    {game.status === GAME_STATUS.IN_PROGRESS && !isSuspended && (
                      <span className="text-red-500 text-xs font-bold animate-pulse mt-1">LIVE</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-1/3 gap-2">
                    <span className="text-xl font-bold text-slate-900">{getTeamDisplayName(game.awayTeam)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleScoreChange(game, 'away', -1)}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={game.awayScore}
                        onChange={(e) => doUpdate(game.id, { awayScore: parseInt(e.target.value) || 0 })}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-12 text-center text-2xl font-bold border-none bg-transparent focus:ring-0 p-0"
                      />
                      <button
                        onClick={() => handleScoreChange(game, 'away', 1)}
                        disabled={game.status !== GAME_STATUS.IN_PROGRESS}
                        className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {game.status === GAME_STATUS.CANCELLED && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <p className="text-sm text-slate-500">취소 사유: <span className="font-bold text-slate-700">{game.cancellationReason || '사유 미입력'}</span></p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 grid gap-2 grid-cols-2">
                {game.status === GAME_STATUS.SCHEDULED && (
                  <>
                    <button
                      onClick={() => handleStatusAction('start', game.id)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <PlayCircle size={16} /> 경기 시작
                    </button>
                    <button
                      onClick={() => handleStatusAction('cancel_prompt', game.id)}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle size={16} /> 취소 처리
                    </button>
                  </>
                )}

                {game.status === GAME_STATUS.IN_PROGRESS && (
                  <>
                    {isSuspended ? (
                      <>
                        <button
                          onClick={() => handleStatusAction('resume', game.id)}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-colors animate-pulse"
                        >
                          <PlayCircle size={16} /> 경기 재개
                        </button>
                        <button
                          onClick={() => handleStatusAction('cancel_prompt', game.id)}
                          className="flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle size={16} /> 우천 취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStatusAction('finish', game.id)}
                          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          <CheckCircle2 size={16} /> 경기 종료
                        </button>
                        <button
                          onClick={() => handleStatusAction('suspend_prompt', game.id)}
                          className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <PauseCircle size={16} /> 일시 중단
                        </button>
                        <button
                          onClick={() => handleStatusAction('cancel_prompt', game.id)}
                          className="col-span-2 flex items-center justify-center gap-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-500 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle size={16} /> 취소 처리 (노게임/콜드)
                        </button>
                      </>
                    )}
                  </>
                )}

                {(game.status === GAME_STATUS.FINISHED || game.status === GAME_STATUS.CANCELLED) && (
                  <button
                    onClick={() => handleStatusAction('reset', game.id)}
                    className="col-span-2 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 py-1 text-xs transition-colors"
                  >
                    <RefreshCw size={12} /> 관리자용: 상태 초기화 (잘못된 처리 수정)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel / Suspend Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`px-5 py-4 border-b flex items-center gap-3
              ${activeModal === 'cancel' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
              {activeModal === 'cancel' ? <XCircle className="text-red-600" /> : <PauseCircle className="text-amber-600" />}
              <h3 className={`font-bold text-lg ${activeModal === 'cancel' ? 'text-red-700' : 'text-amber-800'}`}>
                {activeModal === 'cancel' ? '경기 취소 처리' : '경기 중단 처리'}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                {activeModal === 'cancel'
                  ? '경기를 취소 상태로 변경합니다. 취소 사유를 선택해주세요.'
                  : '경기를 진행 중 상태로 유지하되, 중단(Suspended) 상태로 표시합니다.'}
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">사유 선택</label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {activeModal === 'cancel' ? (
                    <>
                      <option value="우천취소">우천취소 (Rain)</option>
                      <option value="미세먼지취소">미세먼지취소 (Dust)</option>
                      <option value="콜드게임">콜드게임 (Called Game)</option>
                      <option value="노게임">노게임 (No Game)</option>
                      <option value="기타">기타 사유</option>
                    </>
                  ) : (
                    <>
                      <option value="우천 중단">우천 중단 (Rain Delay)</option>
                      <option value="조명탑 고장">조명탑 고장</option>
                      <option value="심판 합의 판독">비디오 판독 중</option>
                      <option value="부상자 발생">부상자 발생 중단</option>
                      <option value="기타 중단">기타 중단</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={confirmModalAction}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium text-sm shadow-sm transition-colors
                  ${activeModal === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
