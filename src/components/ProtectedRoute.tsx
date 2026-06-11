import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { ReactNode } from 'react';

/**
 * 路由守卫组件 Props
 */
interface ProtectedRouteProps {
  /** 允许访问的角色 */
  role?: 'employee' | 'admin';
  /** 子组件 */
  children: ReactNode;
}

/**
 * 路由守卫组件
 * 功能：
 * 1. 检查用户是否登录（isAuthenticated）
 * 2. 未登录则重定向到 /login
 * 3. 支持角色访问控制（role prop）
 */
export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  // 获取用户认证状态和当前用户信息
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);
  const location = useLocation();

  // 未登录：重定向到登录页，附带当前路径以便登录后返回
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 已登录但角色不匹配：重定向到对应首页
  if (role && currentUser?.role !== role) {
    const redirectPath = currentUser?.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={redirectPath} replace />;
  }

  // 验证通过，渲染子组件
  return <>{children}</>;
}
