import { useState, useMemo, useRef } from 'react';
import { type SortingState, type PaginationState, type ColumnFiltersState } from '@tanstack/react-table';
import {
  Plus, Search, Filter, Edit2, X, AlertTriangle,
  RefreshCw, Save, CheckCircle, Upload, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useGames, useCreateGame, useUpdateGame, useDeleteGame, useBulkCreateGames } from '@/services/playerslog/hooks/useGames';
import type { Game, CreateGameInput, UpdateGameInput } from '@/services/playerslog/types';
import { GAME_STATUS, KBO_TEAMS, STADIUMS, getTeamByName, getStadiumByName } from '@/services/playerslog/constants';
import { DataTable, DataTableToolbar, DataTablePagination } from '@/shared/components/data-table';
import { getGamesColumns } from './games/columns';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

interface ParsedGame extends CreateGameInput {
  error?: string;
}

function parseKoreanDate(dateStr: string, year: string): string {
  const match = dateStr.match(/(\d+)월\s*(\d+)일/);
  if (!match) return '';
  const month = match[1].padStart(2, '0');
  const day = match[2].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTime(raw: string | number): string {
  if (typeof raw === 'number') {
    const totalMinutes = Math.round(raw * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return String(raw).trim();
}

function parseMatchup(matchStr: string): { homeTeam: string; awayTeam: string; error?: string } {
  const parts = matchStr.split(/\s*vs\s*/i);
  if (parts.length !== 2) return { homeTeam: '', awayTeam: '', error: '경기 형식 오류' };

  const awayShort = parts[0].trim();
  const homeShort = parts[1].trim();

  const awayTeam = getTeamByName(awayShort);
  const homeTeam = getTeamByName(homeShort);

  const errors: string[] = [];
  if (!awayTeam) errors.push(`팀 "${awayShort}" 매핑 실패`);
  if (!homeTeam) errors.push(`팀 "${homeShort}" 매핑 실패`);

  return {
    homeTeam: homeTeam?.name ?? homeShort,
    awayTeam: awayTeam?.name ?? awayShort,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
}

function assignSeriesNumbers(games: ParsedGame[]): ParsedGame[] {
  const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const counters = new Map<string, number>();

  for (const game of sorted) {
    const key = [game.homeTeam, game.awayTeam].sort().join('::');
    const count = (counters.get(key) ?? 0) + 1;
    counters.set(key, count);
    game.seriesNumber = count;
  }

  return sorted;
}

const INITIAL_FORM: Partial<Game> & { homeTeam: string; awayTeam: string } = {
  season: '2026',
  date: '',
  time: '18:30',
  homeTeam: '',
  awayTeam: '',
  stadium: '',
  status: GAME_STATUS.SCHEDULED,
  seriesNumber: 1,
  isRescheduled: false,
  cancellationReason: '',
};

export default function Games() {
  const { data: games = [], isLoading } = useGames();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();
  const bulkCreateGames = useBulkCreateGames();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSeason, setUploadSeason] = useState('2026');
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<Partial<Game>>(INITIAL_FORM);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: false }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const statusFilter = (columnFilters.find((f) => f.id === 'status')?.value as string[]) ?? [];

  const toggleStatusFilter = (status: string) => {
    const next = statusFilter.includes(status)
      ? statusFilter.filter((s) => s !== status)
      : [...statusFilter, status];
    setColumnFilters((prev) =>
      next.length === 0
        ? prev.filter((f) => f.id !== 'status')
        : [...prev.filter((f) => f.id !== 'status'), { id: 'status', value: next }],
    );
  };

  const clearStatusFilter = () => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== 'status'));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (game: Game) => {
    setModalMode('edit');
    setFormData(game);
    setIsModalOpen(true);
  };

  const openRescheduleModal = (cancelledGame: Game) => {
    setModalMode('create');
    setFormData({
      ...INITIAL_FORM,
      season: cancelledGame.season,
      homeTeam: cancelledGame.homeTeam,
      awayTeam: cancelledGame.awayTeam,
      stadium: cancelledGame.stadium,
      seriesNumber: cancelledGame.seriesNumber,
      isRescheduled: true,
      originalGameId: cancelledGame.id,
      status: GAME_STATUS.SCHEDULED,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.homeTeam || !formData.awayTeam) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (modalMode === 'edit' && formData.id) {
      const { id, createdAt, updatedAt, ...rest } = formData as Game;
      updateGame.mutate(
        { id, data: rest as UpdateGameInput },
        { onSuccess: closeModal }
      );
    } else {
      const payload: CreateGameInput = {
        season: formData.season!,
        date: formData.date!,
        time: formData.time!,
        homeTeam: formData.homeTeam!,
        awayTeam: formData.awayTeam!,
        stadium: formData.stadium!,
        seriesNumber: formData.seriesNumber,
        isRescheduled: formData.isRescheduled,
        originalGameId: formData.originalGameId,
      };
      createGame.mutate(payload, {
        onSuccess: closeModal,
        onError: (err: any) => {
          alert(err.response?.data?.message ?? '경기 등록에 실패했습니다.');
        },
      });
    }
  };

  const handleDelete = () => {
    if (!formData.id || !confirm('정말 이 일정을 삭제하시겠습니까? (복구 불가)')) return;
    deleteGame.mutate(formData.id, { onSuccess: closeModal });
  };

  const getOriginalGame = (originalId?: number) => games.find((g) => g.id === originalId);

  const openUploadModal = () => {
    setParsedGames([]);
    setIsUploadModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setParsedGames([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      const parsed: ParsedGame[] = rows.map((row) => {
        const errors: string[] = [];

        const rawDate = row['날짜'] ?? '';
        const rawTime = row['시간'] ?? '';
        const rawMatch = row['경기'] ?? '';
        const rawStadium = row['장소'] ?? '';

        const date = parseKoreanDate(rawDate, uploadSeason);
        if (!date) errors.push(`날짜 "${rawDate}" 파싱 실패`);

        const time = parseTime(rawTime);

        const matchup = parseMatchup(rawMatch);
        if (matchup.error) errors.push(matchup.error);

        const stadium = getStadiumByName(rawStadium.trim());
        if (!stadium) errors.push(`구장 "${rawStadium}" 매핑 실패`);

        return {
          season: uploadSeason,
          date,
          time,
          homeTeam: matchup.homeTeam,
          awayTeam: matchup.awayTeam,
          stadium: stadium?.name ?? rawStadium,
          seriesNumber: 1,
          error: errors.length > 0 ? errors.join('; ') : undefined,
        };
      });

      setParsedGames(assignSeriesNumbers(parsed));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = () => {
    const validGames = parsedGames.filter((g) => !g.error);
    if (validGames.length === 0) return;

    const inputs: CreateGameInput[] = validGames.map(({ error, ...rest }) => rest);
    bulkCreateGames.mutate(inputs, {
      onSuccess: closeUploadModal,
      onError: (err: any) => {
        alert(err.response?.data?.message ?? '일괄 등록에 실패했습니다.');
      },
    });
  };

  const columns = useMemo(
    () => getGamesColumns({ getOriginalGame, openEditModal }),
    [games],
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">경기 일정 관리</h2>
          <p className="text-sm text-slate-500 mt-1">시즌 경기 일정을 등록하고 우천 취소 및 대체 일정을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openUploadModal}
            className="flex items-center gap-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Upload size={16} />
            엑셀 업로드
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <Plus size={16} />
            일정 등록
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <DataTableToolbar>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="팀명, 구장 검색..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                  <Filter size={16} />
                  상태 필터
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {statusFilter.length}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-0">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-slate-900">상태 필터</span>
                  {statusFilter.length > 0 && (
                    <button
                      onClick={clearStatusFilter}
                      className="text-xs text-slate-500 hover:text-slate-900"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <Separator />
                <div className="p-2 space-y-1">
                  {Object.values(GAME_STATUS).map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <Checkbox
                        checked={statusFilter.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {statusFilter.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1 flex-wrap">
                  {statusFilter.map((status) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {status}
                      <button
                        onClick={() => toggleStatusFilter(status)}
                        className="rounded-full hover:bg-slate-300 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={clearStatusFilter}
                    className="text-xs text-slate-500 hover:text-slate-900 px-1"
                  >
                    모두 해제
                  </button>
                </div>
              </>
            )}
          </div>
        </DataTableToolbar>

        <div className="overflow-auto flex-1">
          <DataTable
            columns={columns}
            data={games}
            sorting={sorting}
            onSortingChange={setSorting}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            emptyMessage="등록된 일정이 없습니다."
            rowClassName={(row) =>
              row.original.status === GAME_STATUS.CANCELLED ? 'bg-slate-50/50' : ''
            }
            renderFooter={(table) => <DataTablePagination table={table} />}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {modalMode === 'create'
                  ? (formData.isRescheduled ? <RefreshCw className="text-blue-600" /> : <Plus className="text-blue-600" />)
                  : <Edit2 className="text-slate-600" />}
                {modalMode === 'create' ? (formData.isRescheduled ? '대체 일정 편성' : '새 경기 일정 등록') : '경기 일정 수정'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">시즌</label>
                    <input
                      type="text"
                      required
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">대체 일정 여부</label>
                    <div className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                      {formData.isRescheduled ? <CheckCircle className="text-blue-500" size={16} /> : <span className="w-4" />}
                      {formData.isRescheduled ? '예 (대체 편성)' : '아니오 (정규 편성)'}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">경기 날짜</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">경기 시간</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Matchup Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">홈 팀</label>
                    <select
                      required
                      value={formData.homeTeam}
                      onChange={(e) => {
                        const team = getTeamByName(e.target.value);
                        setFormData({
                          ...formData,
                          homeTeam: e.target.value,
                          ...(team ? { stadium: team.stadium } : {}),
                        });
                      }}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">팀 선택</option>
                      {KBO_TEAMS.map((team) => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">원정 팀</label>
                    <select
                      required
                      value={formData.awayTeam}
                      onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">팀 선택</option>
                      {KBO_TEAMS.map((team) => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">구장</label>
                    <select
                      required
                      value={formData.stadium}
                      onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">구장 선택</option>
                      {STADIUMS.map((stadium) => (
                        <option key={stadium.id} value={stadium.name}>{stadium.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">상대 차수 (Round)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="16"
                        required
                        value={formData.seriesNumber}
                        onChange={(e) => setFormData({ ...formData, seriesNumber: parseInt(e.target.value) })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-slate-500 shrink-0">차전</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">상태</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Game['status'] })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${formData.status === GAME_STATUS.CANCELLED ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300'}`}
                    >
                      <option value={GAME_STATUS.SCHEDULED}>예정</option>
                      <option value={GAME_STATUS.IN_PROGRESS}>진행중</option>
                      <option value={GAME_STATUS.FINISHED}>종료</option>
                      <option value={GAME_STATUS.CANCELLED}>취소</option>
                    </select>
                  </div>
                </div>

                {/* Cancellation Logic */}
                {formData.status === GAME_STATUS.CANCELLED && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-red-700 uppercase flex items-center gap-1">
                        <AlertTriangle size={14} /> 취소 상세 사유
                      </label>
                      <select
                        value={formData.cancellationReason}
                        onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                        className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">사유 선택...</option>
                        <option value="우천취소">우천취소 (Rain)</option>
                        <option value="미세먼지취소">미세먼지취소 (Fine Dust)</option>
                        <option value="그라운드 사정">그라운드 사정</option>
                        <option value="기타">기타 사유</option>
                      </select>
                    </div>

                    {modalMode === 'edit' && (
                      <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">대체 일정을 편성하시겠습니까?</p>
                          <p className="text-xs text-slate-500 mt-1">이 경기를 대신할 새로운 일정을 바로 등록할 수 있습니다.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(formData as Game)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                        >
                          <RefreshCw size={16} /> 대체 일정 등록
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              {modalMode === 'edit' ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  삭제
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  form="schedule-form"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === 'create' ? '일정 등록 완료' : '변경사항 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="text-green-600" />
                엑셀 일정 업로드
              </h3>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-end gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">시즌</label>
                  <input
                    type="text"
                    value={uploadSeason}
                    onChange={(e) => setUploadSeason(e.target.value)}
                    className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2026"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">엑셀 파일</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {parsedGames.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      미리보기 ({parsedGames.filter((g) => !g.error).length}건 정상 / {parsedGames.length}건 전체)
                    </p>
                    {parsedGames.some((g) => g.error) && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        오류가 있는 행은 등록에서 제외됩니다
                      </p>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-auto max-h-[50vh]">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">#</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">날짜</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">시간</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">홈팀</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">원정팀</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">구장</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">차수</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedGames.map((game, idx) => (
                          <tr key={idx} className={game.error ? 'bg-red-50' : 'hover:bg-slate-50'}>
                            <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2">{game.date}</td>
                            <td className="px-3 py-2">{game.time}</td>
                            <td className="px-3 py-2 font-medium">{game.homeTeam}</td>
                            <td className="px-3 py-2 font-medium">{game.awayTeam}</td>
                            <td className="px-3 py-2">{game.stadium}</td>
                            <td className="px-3 py-2 text-center">{game.seriesNumber}</td>
                            <td className="px-3 py-2">
                              {game.error ? (
                                <span className="text-xs text-red-600">{game.error}</span>
                              ) : (
                                <CheckCircle size={16} className="text-green-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeUploadModal}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={parsedGames.filter((g) => !g.error).length === 0 || bulkCreateGames.isPending}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                {bulkCreateGames.isPending
                  ? '등록 중...'
                  : `${parsedGames.filter((g) => !g.error).length}건 일괄 등록`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
