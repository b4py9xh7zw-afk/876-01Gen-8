import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  MapPinCheck,
  Lock,
  ClipboardList,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  ShieldAlert,
  Home,
  Clock,
  Hash,
  PartyPopper,
} from 'lucide-react';

export default function Checkin() {
  const navigate = useNavigate();
  const { canCheckin, hasCheckedIn, doCheckin, checkinRecords, currentUser } = useAppStore();

  const [code, setCode] = useState<string[]>(Array(8).fill(''));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const canDo = canCheckin();
  const done = hasCheckedIn();

  const myCheckin = currentUser
    ? checkinRecords
        .filter((r) => r.userId === currentUser.id && r.success)
        .sort((a, b) => new Date(b.checkinAt).getTime() - new Date(a.checkinAt).getTime())[0]
    : null;

  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [canDo, done]);

  const handleCodeChange = (idx: number, val: string) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[idx] = v;
    setCode(newCode);
    setMessage(null);

    if (v && idx < 7) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (v && idx === 7) {
      const fullCode = newCode.join('');
      if (fullCode.length === 8) {
        setTimeout(() => handleSubmit(fullCode), 200);
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (!pasted) return;
    const newCode = [...code];
    for (let i = 0; i < pasted.length && i < 8; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextIdx = Math.min(pasted.length, 7);
    inputRefs.current[nextIdx]?.focus();
    if (pasted.length === 8) {
      setTimeout(() => handleSubmit(newCode.join('')), 200);
    }
  };

  const handleSubmit = (fullCode?: string) => {
    const codeStr = fullCode || code.join('');
    if (codeStr.length !== 8) {
      setMessage({ type: 'error', text: '请输入完整的 8 位签到码' });
      return;
    }
    const res = doCheckin(codeStr);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setShowSuccessAnim(true);
    } else {
      setMessage({ type: 'error', text: res.message });
      setCode(Array(8).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  if (!canDo) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="card p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-warn-50 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-warn-500" />
          </div>
          <h2 className="text-2xl font-bold text-ocean-800 mb-3">签到暂未解锁</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            您需要先通过在线考核（达到 80 分及以上）后，才能参加线下演练现场签到。
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/employee/courses')} className="btn-ghost px-6">
              <MapPin className="w-4 h-4" />
              返回学习
            </button>
            <button onClick={() => navigate('/employee/quiz')} className="btn-primary px-6">
              <ClipboardList className="w-4 h-4" />
              前往参加考核
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done && myCheckin) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white shadow-2xl bg-gradient-to-br from-success-500 via-emerald-500 to-teal-600 stagger-1"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-10 right-10 opacity-20">
            <PartyPopper className="w-32 h-32 text-yellow-300" />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-3xl flex items-center justify-center bg-white/20 backdrop-blur-sm border-4 border-yellow-300/50 shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h1 className="text-3xl lg:text-4xl font-black">🎉 签到成功！</h1>
              </div>
              <p className="text-white/90 text-lg mb-6">
                恭喜您完成全部消防安全培训考核流程，您的安全意识值得表扬！
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    签到时间
                  </div>
                  <div className="font-bold">
                    {new Date(myCheckin.checkinAt).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    签到地点
                  </div>
                  <div className="font-bold">{myCheckin.location || 'A栋1楼大厅'}</div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    签到码
                  </div>
                  <div className="font-bold font-mono tracking-wider">{myCheckin.checkinCode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6 stagger-2 animate-fade-in-up">
          <h3 className="font-bold text-ocean-800 mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warn-500" />
            完成进度
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-fire-50 to-orange-50 border border-fire-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-fire-500 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-ocean-800">课程学习</div>
                  <div className="text-xs text-slate-500">3 门必修课程</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span className="font-semibold text-success-600">已完成</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-ocean-50 to-cyan-50 border border-ocean-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-ocean-500 text-white flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-ocean-800">在线考核</div>
                  <div className="text-xs text-slate-500">80 分及格通过</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span className="font-semibold text-success-600">已通过</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-success-50 to-emerald-50 border border-success-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-success-500 text-white flex items-center justify-center">
                  <MapPinCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-ocean-800">现场签到</div>
                  <div className="text-xs text-slate-500">线下演练确认</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span className="font-semibold text-success-600">已签到</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button onClick={() => navigate('/employee')} className="btn-primary px-8">
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {showSuccessAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-10 text-center animate-scale-in">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-success-500/40">
              <CheckCircle2
                className="w-16 h-16 text-white animate-check"
                style={{
                  strokeDasharray: 100,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              />
            </div>
            <h3 className="text-2xl font-bold text-ocean-800 mb-2">签到成功！</h3>
            <p className="text-slate-500 mb-6">{message?.text}</p>
            <button onClick={() => setShowSuccessAnim(false)} className="btn-primary w-full">
              <Sparkles className="w-4 h-4" />
              太棒了
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warn-500 to-amber-500 flex items-center justify-center shadow-lg shadow-warn-500/30">
          <MapPinCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ocean-800">线下演练签到</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            请在演练现场输入工作人员提供的签到码完成签到
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 stagger-1 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 relative bg-gradient-to-br from-fire-500 via-fire-600 to-orange-600 p-8 lg:p-10 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg className="absolute top-8 right-8 w-40 h-40" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.6" />
              </svg>
              <svg className="absolute -bottom-10 -left-10 w-48 h-48 opacity-30" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10C40 30 20 35 25 55C28 70 40 80 50 90C60 80 72 70 75 55C80 35 60 30 50 10Z" />
              </svg>
              <svg className="absolute top-1/2 -right-6 w-24 h-24 opacity-20" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15C42 30 28 33 31 50C33 63 42 70 50 78C58 70 67 63 69 50C72 33 58 30 50 15Z" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6">
                <Flame className="w-10 h-10 text-yellow-300" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black mb-3">线下演练签到</h2>
              <p className="text-white/80 leading-relaxed mb-8">
                恭喜您已通过在线考核！现在请您前往指定的线下演练地点，向现场工作人员获取签到码，输入下方即可完成全部考核流程。
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">演练地点</div>
                    <div className="text-white/70 text-sm">A栋1楼大厅 · 消防演练现场</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">签到说明</div>
                    <div className="text-white/70 text-sm">
                      签到码为 8 位大写字母与数字组合，由现场工作人员发放
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-400/15 backdrop-blur-sm rounded-2xl border border-yellow-300/30">
                  <div className="w-9 h-9 rounded-xl bg-yellow-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5 text-yellow-100">测试签到码</div>
                    <div className="text-yellow-200 font-mono font-bold tracking-wider">FIRE2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-8 lg:p-10 bg-white">
            <h3 className="text-xl font-bold text-ocean-800 mb-2">输入签到码</h3>
            <p className="text-sm text-slate-500 mb-8">请输入工作人员提供的 8 位签到码</p>

            <div className="mb-8">
              <div className="grid grid-cols-8 gap-2 sm:gap-3" onPaste={handlePaste}>
                {code.map((char, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={2}
                    value={char}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={cn(
                      'w-full aspect-square text-center text-2xl font-black font-mono tracking-wider rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 uppercase',
                      char
                        ? 'border-fire-400 bg-fire-50 text-fire-700 shadow-md shadow-fire-500/10'
                        : 'border-slate-200 bg-slate-50 text-ocean-800 focus:border-fire-400 focus:bg-white focus:ring-fire-500/20 hover:border-slate-300'
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-ocean-50 border border-ocean-100">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    true && 'bg-success-500 animate-pulse'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ocean-700">定位状态</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    已定位 · A栋1楼大厅（演练现场）
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
              </div>
            </div>

            {message && (
              <div
                className={cn(
                  'mb-6 p-4 rounded-2xl flex items-start gap-3',
                  message.type === 'success'
                    ? 'bg-success-50 border border-success-100 text-success-700'
                    : 'bg-fire-50 border border-fire-100 text-fire-700'
                )}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <button
              onClick={() => handleSubmit()}
              disabled={code.join('').length !== 8}
              className="w-full btn-primary py-4 rounded-2xl text-base shadow-fire hover:shadow-lg transition-all"
            >
              <MapPinCheck className="w-5 h-5" />
              确认签到
            </button>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              提示：可复制粘贴完整签到码到任意输入框
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
