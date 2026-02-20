import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Radio,
  Calculator,
  FileText,
  Users,
  LogOut,
  ChevronDown,
  Flag,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/shared/hooks/useAuth'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface ServiceGroup {
  name: string
  prefix: string
  items: NavItem[]
  defaultOpen?: boolean
}

const serviceGroups: ServiceGroup[] = [
  {
    name: '플레이어스 로그',
    prefix: '/playerslog',
    defaultOpen: true,
    items: [
      { name: '대시보드', href: '/playerslog/dashboard', icon: LayoutDashboard },
      { name: '경기 일정 관리', href: '/playerslog/games', icon: Calendar },
      { name: '라이브 운영', href: '/playerslog/live', icon: Radio },
      { name: '정산 관리', href: '/playerslog/settlements', icon: Calculator },
      { name: '작성 로그 관리', href: '/playerslog/golls', icon: FileText },
      { name: '신고 관리', href: '/playerslog/reports', icon: Flag },
      { name: '사용자 관리', href: '/playerslog/users', icon: Users },
    ],
  },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(serviceGroups.map((g) => [g.prefix, g.defaultOpen ?? false]))
  )

  const toggleGroup = (prefix: string) => {
    setOpenGroups((prev) => ({ ...prev, [prefix]: !prev[prefix] }))
  }

  return (
    <aside className="flex w-64 flex-col bg-slate-900">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">통합 관리자</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {serviceGroups.map((group) => (
          <div key={group.prefix} className="mb-2">
            <button
              onClick={() => toggleGroup(group.prefix)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              {group.name}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  openGroups[group.prefix] && 'rotate-180'
                )}
              />
            </button>
            {openGroups[group.prefix] && (
              <div className="mt-1 space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
        <p className="mt-2 px-3 text-xs text-slate-400">Unified Admin v0.1.0</p>
      </div>
    </aside>
  )
}
