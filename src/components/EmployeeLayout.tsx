import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  MapPinCheck,
  LineChart,
  LogOut,
  User,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/employee', icon: LayoutDashboard, label: '首页', end: true },
  { to: '/employee/courses', icon: BookOpen, label: '课程学习' },
  { to: '/employee/quiz', icon: ClipboardList, label: '在线考核' },
  { to: '/employee/checkin', icon: MapPinCheck, label: '现场签到' },
  { to: '/employee/stats', icon: LineChart, label: '学习统计' },
];

export default function EmployeeLayout() {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-ocean-700 to-ocean-900 text-white flex flex-col transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fire-500 to-orange-500 flex items-center justify-center shadow-lg shadow-fire-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">消防安全培训</div>
            <div className="text-xs text-white/60">员工考核平台</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-fire-500/90 text-white shadow-lg shadow-fire-500/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fire-400 to-orange-400 flex items-center justify-center font-bold">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{currentUser?.name}</div>
              <div className="text-xs text-white/60 truncate">{currentUser?.employeeNo}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center px-4 lg:px-8 gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-fire-50 text-fire-600 text-xs font-medium">
              <User className="w-3.5 h-3.5" />
              员工端
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
