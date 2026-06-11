import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, questions } from '@/store';
import { PASS_SCORE } from '@/data/mockData';
import type { QuizResult } from '@/types';
import { cn } from '@/lib/utils';
import {
  Trophy,
  XCircle,
  Clock,
  Target,
  CheckCircle2,
  XOctagon,
  Percent,
  BookOpen,
  MapPinCheck,
  Home,
  RotateCcw,
  ArrowLeft,
  Award,
  Flame,
  Navigation,
  Phone,
  Lightbulb,
} from 'lucide-react';

const categoryConfig: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  extinguisher: { label: '灭火器使用', icon: Flame, color: 'from-fire-500 to-orange-500' },
  evacuation: { label: '疏散逃生', icon: Navigation, color: 'from-ocean-500 to-cyan-500' },
  alarm: { label: '报警流程', icon: Phone, color: 'from-warn-500 to-amber-500' },
};

function formatAnswer(ans: string | string[]): string {
  if (Array.isArray(ans)) return ans.length > 0 ? ans.join('、') : '未作答';
  return ans || '未作答';
}

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { lastQuizResult, getUserQuizResults, hasPassedQuiz } = useAppStore();

  const result: QuizResult | null = useMemo(() => {
    if (lastQuizResult) return lastQuizResult;
    const list = getUserQuizResults();
    return list[0] || null;
  }, [lastQuizResult, getUserQuizResults]);

  const stats = useMemo(() => {
    if (!result) return null;
    const correct = result.answers.filter((a) => a.correct).length;
    const wrong = result.answers.length - correct;
    const rate = result.answers.length ? Math.round((correct / result.answers.length) * 100) : 0;

    const categoryStats: Record<string, { total: number; correct: number; rate: number }> = {};
    questions.forEach((q) => {
      const qResult = result.answers.find((a) => a.questionId === q.id);
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0, rate: 0 };
      }
      categoryStats[q.category].total++;
      if (qResult?.correct) categoryStats[q.category].correct++;
    });
    Object.keys(categoryStats).forEach((k) => {
      const s = categoryStats[k];
      s.rate = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    });

    return { correct, wrong, rate, categoryStats };
  }, [result]);

  const gradeBadge = useMemo(() => {
    if (!result) return null;
    const s = result.score;
    if (s >= 95) return { text: 'S级 · 满分达人', color: 'bg-yellow-400/20 text-yellow-700 border-yellow-400/40' };
    if (s >= 90) return { text: 'A级 · 优秀', color: 'bg-success-50 text-success-600 border-success-400/40' };
    if (s >= PASS_SCORE) return { text: 'B级 · 良好', color: 'bg-ocean-50 text-ocean-600 border-ocean-400/40' };
    if (s >= 60) return { text: 'C级 · 需加强', color: 'bg-warn-50 text-warn-600 border-warn-400/40' };
    return { text: 'D级 · 待努力', color: 'bg-fire-50 text-fire-600 border-fire-400/40' };
  }, [result]);

  const wrongAnswers = useMemo(() => {
    if (!result) return [];
    return result.answers
      .filter((a) => !a.correct)
      .map((a) => {
        const q = questions.find((qq) => qq.id === a.questionId);
        return { ...a, question: q };
      })
      .filter((x) => x.question);
  }, [result]);

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="card p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Target className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-ocean-800 mb-3">暂无成绩记录</h2>
          <p className="text-slate-500 mb-8">您还没有参加过任何考核，请先完成测验。</p>
          <button onClick={() => navigate('/employee/quiz')} className="btn-primary">
            <Target className="w-4 h-4" />
            前往参加测验
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white shadow-2xl',
          result.passed
            ? 'bg-gradient-to-br from-success-500 via-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-fire-500 via-fire-600 to-orange-600'
        )}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-10 right-10 opacity-20">
          {result.passed ? (
            <Trophy className="w-32 h-32 text-yellow-300" />
          ) : (
            <XCircle className="w-32 h-32 text-white" />
          )}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-shrink-0">
            <div
              className={cn(
                'w-32 h-32 rounded-3xl flex items-center justify-center backdrop-blur-sm border-4',
                result.passed
                  ? 'bg-white/20 border-yellow-300/50 shadow-lg'
                  : 'bg-white/15 border-white/30 shadow-lg'
              )}
            >
              {result.passed ? (
                <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
              ) : (
                <XCircle className="w-16 h-16 text-white drop-shadow-lg" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-black">
                {result.passed ? '🎉 恭喜通过考核！' : '💪 未通过，继续加油！'}
              </h1>
              {gradeBadge && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-sm',
                    gradeBadge.color
                  )}
                >
                  <Award className="w-4 h-4" />
                  {gradeBadge.text}
                </span>
              )}
            </div>

            <div className="flex items-end gap-2 mb-6">
              <span className="text-7xl lg:text-8xl font-black tracking-tighter drop-shadow-lg">
                {result.score}
              </span>
              <span className="text-2xl font-semibold pb-3 text-white/80">/ {result.totalScore}分</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">及格分数</div>
                <div className="text-2xl font-bold">{PASS_SCORE}分</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  用时
                </div>
                <div className="text-2xl font-bold">
                  {Math.floor(result.timeUsed / 60)}分{result.timeUsed % 60}秒
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  考试次数
                </div>
                <div className="text-2xl font-bold">第 {result.attemptNo} 次</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white/70 text-xs mb-1">考试时间</div>
                <div className="text-lg font-bold">
                  {new Date(result.takenAt).toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card stagger-1 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-success-50 text-success-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-black text-success-600">{stats.correct}</div>
            <div className="text-sm text-slate-500 mt-1">答对题数</div>
          </div>
          <div className="card stagger-2 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-fire-50 text-fire-600 flex items-center justify-center">
                <XOctagon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-black text-fire-600">{stats.wrong}</div>
            <div className="text-sm text-slate-500 mt-1">答错题数</div>
          </div>
          <div className="card stagger-3 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-black text-ocean-600">{stats.rate}%</div>
            <div className="text-sm text-slate-500 mt-1">整体正确率</div>
          </div>
          <div className="card stagger-4 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-warn-50 text-warn-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-black text-warn-600">
              {result.score >= PASS_SCORE ? '✓' : '✗'}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {result.score >= PASS_SCORE ? '达到及格线' : '未达及格线'}
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="card stagger-5 animate-fade-in-up">
          <h3 className="font-bold text-ocean-800 mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-fire-500" />
            各分类正确率
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(categoryConfig).map(([key, cfg]) => {
              const s = stats.categoryStats[key];
              const CatIcon = cfg.icon;
              if (!s) return null;
              return (
                <div
                  key={key}
                  className={cn(
                    'relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br text-white',
                    cfg.color
                  )}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                      <div className="font-bold">{cfg.label}</div>
                      <div className="text-white/70 text-xs">
                        {s.correct}/{s.total} 题正确
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-4xl font-black">{s.rate}%</span>
                    </div>
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${s.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {wrongAnswers.length > 0 && (
        <div className="card stagger-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-fire-50 text-fire-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ocean-800">错题回顾</h3>
                <p className="text-sm text-slate-500">
                  共 {wrongAnswers.length} 道错题，复习后可以再次挑战
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {wrongAnswers.map((wa, idx) => {
              const q = wa.question!;
              return (
                <div
                  key={wa.questionId}
                  className="border-2 border-fire-100 bg-fire-50/30 rounded-2xl p-5 hover:border-fire-200 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-fire-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="badge badge-danger">
                          {q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}
                        </span>
                        <span className="badge badge-info">{categoryConfig[q.category]?.label}</span>
                        <span className="text-xs text-slate-400">分值 {q.score}分</span>
                      </div>
                      <div className="font-semibold text-ocean-800 leading-relaxed">
                        {q.content}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-11">
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1.5 font-medium">您的答案</div>
                      <div className="font-bold text-fire-600">{formatAnswer(wa.userAnswer)}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1.5 font-medium">正确答案</div>
                      <div className="font-bold text-success-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {formatAnswer(wa.correctAnswer)}
                      </div>
                    </div>
                    <div className="bg-success-50 rounded-xl p-4 border border-success-100 md:col-span-1">
                      <div className="text-xs text-success-700 mb-1.5 font-medium flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        解析
                      </div>
                      <div className="text-sm text-success-700 leading-relaxed">
                        {q.explanation || '暂无解析'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pb-6 stagger-7 animate-fade-in-up">
        {!result.passed ? (
          <>
            <button onClick={() => navigate('/employee/courses')} className="btn-ghost px-8">
              <ArrowLeft className="w-4 h-4" />
              返回学习
            </button>
            <button onClick={() => navigate('/employee/quiz')} className="btn-primary px-8">
              <RotateCcw className="w-4 h-4" />
              重新测验
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/employee/checkin')} className="btn-primary px-8">
              <MapPinCheck className="w-4 h-4" />
              前往签到
            </button>
            <button onClick={() => navigate('/employee')} className="btn-ghost px-8">
              <Home className="w-4 h-4" />
              返回首页
            </button>
            {!hasPassedQuiz() && (
              <button onClick={() => navigate('/employee/quiz')} className="btn-secondary px-8">
                <RotateCcw className="w-4 h-4" />
                再考一次
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
