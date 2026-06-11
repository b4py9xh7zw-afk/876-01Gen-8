import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  AlertTriangle,
  Flame,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * 导航项配置
 */
interface NavItem {
  /** 显示名称 */
  label: string;
  /** 路由路径 */
  path: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 标记角标（可选） */
  badge?: 'warning';
}

/** 管理端导航菜单配置 */
const NAV_ITEMS: NavItem[] = [
  { label: '仪表盘', path: '/admin', icon: LayoutDashboard },
  { label: '员工管理', path: '/admin/employees', icon: Users },
  { label: '统计报表', path: '/admin/statistics', icon: BarChart3 },
  { label: '复训名单', path: '/admin/retraining', icon: AlertTriangle, badge: 'warning' },
];

/**
 * 管理端侧边栏布局组件
 * 结构：左侧240px深蓝色侧边栏 + 顶部栏 + 主内容区域
 */
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const getRetrainingList = useAppStore((state) => state.getRetrainingList);

  // 复训人员数量
  const retrainingCount = getRetrainingList().length;

  /** 页面标题映射：根据路径生成标题 */
  const getPageTitle = (): string => {
    const pathname = location.pathname;
    if (pathname === '/admin') return '数据仪表盘';
    const matched = NAV_ITEMS.find((item) => pathname.startsWith(item.path) && item.path !== '/admin');
    return matched?.label || '管理后台';
  };

  /** 退出登录 */
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = getPageTitle();

  return (
    <div className="min-h-screen flex bg-ocean-50">
      {/* ========== 左侧固定深色侧边栏 ========== */}
      <aside className="w-60 shrink-0 bg-gradient-to-b from-ocean-900 to-ocean-800 flex flex-col fixed left-0 top-0 bottom-0 z-20 shadow-xl">
        {/* Logo 区域 */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fire-500 to-fire-600 flex items-center justify-center shadow-lg shadow-fire-500/30">
            <Flame className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">消防安全</h1>
            <p className="text-xs text-ocean-300 leading-tight">管理控制台</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group cursor-pointer',
                    isActive
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-ocean-200 hover:bg-white/8 hover:text-white'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-fire-500" />
                  )}
                  <item.icon
                    className={cn(
                      'w-[18px] h-[18px] transition-transform duration-200',
                      isActive ? 'text-fire-400' : 'group-hover:text-fire-400'
                    )}
                    strokeWidth={2}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === 'warning' && retrainingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-fire-500 text-white text-[11px] font-semibold min-w-[20px] text-center">
                      {retrainingCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 底部管理员信息 + 退出按钮 */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fire-500 to-fire-700 flex items-center justify-center text-white font-bold shadow-lg shadow-fire-500/20">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {currentUser?.name || '管理员'}
              </p>
              <p className="text-xs text-ocean-300 truncate flex items-center gap-1">
                <Shield className="w-3 h-3" strokeWidth={2.5} />
                系统管理员
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-ocean-200 hover:bg-white/10 hover:text-white hover:shadow-inner transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            退出登录
          </button>
        </div>
      </aside>

      {/* ========== 右侧主区域 ========== */}
      <div className="flex-1 ml-60 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-ocean-100 sticky top-0 z-10 flex items-center px-8 gap-6">
          {/* 面包屑 + 页面标题 */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center text-sm text-ocean-400">
              <span className="hover:text-ocean-600 cursor-pointer transition-colors">管理后台</span>
              {pageTitle !== '数据仪表盘' && (
                <>
                  <ChevronRight className="w-4 h-4 mx-1.5 text-ocean-300" strokeWidth={2} />
                  <span className="text-ocean-700 font-semibold">{pageTitle}</span>
                </>
              )}
            </nav>
          </div>

          {/* 页面大标题 */}
          <h2 className="text-xl font-bold text-ocean-800 ml-4 border-l-2 border-fire-500 pl-4">
            {pageTitle}
          </h2>

          {/* 右侧管理员快捷信息 */}
          <div className="ml-auto flex items-center gap-4">
            {/* 复训提醒（有数据时显示） */}
            {retrainingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fire-50 border border-fire-200 text-fire-600 text-sm">
                <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">{retrainingCount} 人待复训</span>
              </div>
            )}

            {/* 管理员头像 */}
            <div className="flex items-center gap-3 pl-4 border-l border-ocean-100">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-ocean-800 leading-tight">
                  {currentUser?.name || '管理员'}
                </p>
                <p className="text-xs text-ocean-400 leading-tight">管理员账号</p>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
