import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  Flame,
  ShieldCheck,
  BookOpenCheck,
  BarChart3,
  User,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

type Role = 'employee' | 'admin';

const roleTabs = [
  { key: 'employee' as Role, label: '员工登录' },
  { key: 'admin' as Role, label: '管理员登录' },
];

const features = [
  {
    icon: BookOpenCheck,
    title: '专业课程',
    desc: '三大核心消防知识体系',
  },
  {
    icon: ShieldCheck,
    title: '在线考核',
    desc: '标准化测验检验学习成果',
  },
  {
    icon: BarChart3,
    title: '数据统计',
    desc: '学习进度一目了然',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const [role, setRole] = useState<Role>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = role === 'employee' ? '请输入工号' : '请输入管理员账号';
    }
    if (!password) {
      errors.password = '请输入密码';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = login(username.trim(), password, role);
    if (result.success) {
      navigate(role === 'employee' ? '/employee' : '/admin');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const fillDefault = () => {
    if (role === 'employee') {
      setUsername('EMP0001');
      setPassword('123456');
    } else {
      setUsername('ADMIN001');
      setPassword('admin123');
    }
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-fire-600 via-fire-700 to-ocean-700">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.3" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute top-20 -left-16 w-80 h-80 rounded-full bg-fire-500/30 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-ocean-500/30 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="absolute top-12 right-12 w-24 h-24 border-2 border-white/20 rounded-2xl rotate-12" />
        <div className="absolute top-40 right-32 w-16 h-16 border-2 border-white/15 rounded-full" />
        <div className="absolute bottom-32 left-16 w-20 h-20 border-2 border-white/15 rotate-45" />
        <div className="absolute bottom-60 left-40 w-12 h-12 bg-white/10 rounded-xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-lg">FIRE SAFETY</div>
                <div className="text-xs text-white/60">Training Platform</div>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 text-balance">
              消防安全
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                培训考核平台
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              学习消防知识，守护生命安全
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up stagger-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-white/70 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-white/50 animate-fade-in-up stagger-3">
            © 2026 Fire Safety Training. 安全无小事，防患于未然。
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fire-500 to-fire-700 flex items-center justify-center shadow-lg shadow-fire-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-ocean-800">消防安全培训考核平台</div>
              <div className="text-xs text-slate-500">学习消防知识，守护生命安全</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ocean-800 mb-1">欢迎登录 👋</h2>
          <p className="text-slate-500 text-sm mb-8">请选择角色并填写账号信息</p>

          <div className="mb-6 p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setRole(tab.key);
                  setUsername('');
                  setPassword('');
                  setError('');
                  setFieldErrors({});
                }}
                className={cn(
                  'py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  role === tab.key
                    ? 'bg-white text-fire-600 shadow-sm'
                    : 'text-slate-500 hover:text-ocean-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                {role === 'employee' ? '工号' : '管理员账号'}
              </label>
              <div className="relative">
                <User className={cn(
                  'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
                  fieldErrors.username ? 'text-fire-500' : 'text-slate-400'
                )} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: undefined });
                  }}
                  placeholder={role === 'employee' ? '请输入工号，如 EMP0001' : '请输入管理员账号'}
                  className={cn(
                    'input pl-10',
                    fieldErrors.username && 'border-fire-400 focus:border-fire-400 focus:ring-fire-500/20'
                  )}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1.5 text-xs text-fire-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="label">密码</label>
              <div className="relative">
                <Lock className={cn(
                  'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
                  fieldErrors.password ? 'text-fire-500' : 'text-slate-400'
                )} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="请输入密码"
                  className={cn(
                    'input pl-10 pr-10',
                    fieldErrors.password && 'border-fire-400 focus:border-fire-400 focus:ring-fire-500/20'
                  )}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ocean-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-fire-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-fire-50 border border-fire-100 text-fire-700 text-sm flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base shadow-fire hover:shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '立即登录'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-fire-50 to-orange-50 border border-fire-100">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-fire-600" />
              <span className="text-sm font-semibold text-fire-700">测试账号</span>
            </div>
            <div className="space-y-1.5 text-xs text-fire-800/80">
              <div className="flex justify-between">
                <span>员工：</span>
                <button
                  type="button"
                  onClick={fillDefault}
                  className="font-mono font-semibold text-fire-700 hover:underline"
                >
                  EMP0001 / 123456 ← 点击填入
                </button>
              </div>
              <div className="flex justify-between">
                <span>管理员：</span>
                <span className="font-mono font-semibold">ADMIN001 / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
