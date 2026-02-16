import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar, AlertCircle, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboardStats, useNotifications } from '@/services/playerslog/hooks/useDashboard';

// Mock chart data - would come from a real analytics API in production
const chartData = [
  { name: '2/08', visitors: 4000, points: 2400 },
  { name: '2/09', visitors: 3000, points: 1398 },
  { name: '2/10', visitors: 2000, points: 9800 },
  { name: '2/11', visitors: 2780, points: 3908 },
  { name: '2/12', visitors: 1890, points: 4800 },
  { name: '2/13', visitors: 2390, points: 3800 },
  { name: '2/14', visitors: 3490, points: 4300 },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: notifications = [], isLoading: notiLoading } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">서비스 현황</h2>
        <span className="text-sm text-slate-500">최종 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 사용자"
          value={statsLoading ? '...' : (stats?.totalUsers?.toLocaleString() ?? '0')}
          trend="+12%"
          trendUp
          icon={Users}
          color="blue"
        />
        <StatCard
          title="오늘 경기 수"
          value={statsLoading ? '...' : String(stats?.todayGames ?? 0)}
          subtext="경기 일정 메뉴에서 확인"
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="미처리 신고"
          value={statsLoading ? '...' : String(stats?.pendingReports ?? 0)}
          trend={stats?.pendingReports ? `+${stats.pendingReports}` : undefined}
          trendUp={false}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="정산 대기"
          value={statsLoading ? '...' : `${stats?.pendingSettlement ?? 0}건`}
          subtext="정산 관리에서 처리"
          icon={Coins}
          color="amber"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">주간 트래픽 및 포인트 추이</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
                name="방문자 수"
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPoints)"
                name="포인트 흐름"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">최근 가입 유저</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-medium">
                    U{i}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">User_{990 + i}</p>
                    <p className="text-xs text-slate-500">최근 가입</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">시스템 알림</h3>
          <div className="space-y-3">
            {notiLoading ? (
              <p className="text-sm text-slate-400 py-4 text-center">로딩중...</p>
            ) : notifications.length > 0 ? (
              notifications.map((noti) => {
                const colorMap: Record<string, string> = {
                  info: 'bg-blue-50 text-blue-700',
                  warning: 'bg-amber-50 text-amber-700',
                  error: 'bg-red-50 text-red-700',
                };
                return (
                  <div key={noti.id} className={`flex gap-3 p-3 rounded-lg text-sm ${colorMap[noti.type] || colorMap.info}`}>
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{noti.message}</p>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>모든 시스템이 정상 운영 중입니다.</p>
                </div>
                <div className="flex gap-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>미정산 경기가 있으면 정산 관리에서 확인해주세요.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, subtext, icon: Icon, color }: {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend && (
          <span className={`flex items-center gap-1 font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trend}
          </span>
        )}
        {subtext && <span className="text-slate-500">{subtext}</span>}
        {trend && <span className="text-slate-400 ml-2">vs last week</span>}
      </div>
    </div>
  );
}
