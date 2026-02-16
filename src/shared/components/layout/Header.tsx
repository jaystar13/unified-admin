import { Bell, Search, User, LogOut } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="검색..."
            className="h-10 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.nickname || '관리자'}
          </span>
        </div>
        <button
          onClick={logout}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="로그아웃"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
