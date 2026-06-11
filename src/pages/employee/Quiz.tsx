import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, questions } from '@/store';
import { QUIZ_DURATION, PASS_SCORE } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  BookOpen,
  HelpCircle,
  ListChecks,
  Flame,
  Navigation,
  Phone,
  X,
} from 'lucide-react';

const typeLabel: Record<string, { text: string; color: string; icon: typeof HelpCircle }> = {
  single: { text: '单选题', color: 'bg-ocean-50 text-ocean-600', icon: ListChecks },
  multiple: { text: '多选题', color: 'bg-fire-50 text-fire-600', icon: CheckCircle2 },
  judge: { text: '判断题', color: 'bg-warn-50 text-warn-600', icon: HelpCircle },
};

const categoryLabel: Record<string, { text: string; icon: typeof Flame; color: string }> = {
  extinguisher: { text: '灭火器使用', icon: Flame, color: 'from-fire-500 to-orange-500' },
  evacuation: { text: '疏散逃生', icon: Navigation, color: 'from-ocean-500 to-cyan-500' },
  alarm: { text: '报警流程', icon: Phone, color: 'from-warn-500 to-amber-500' },
};

export default function Quiz() {
  const navigate = useNavigate();
  const { canTakeQuiz, hasPassedQuiz, submitQuiz } = useAppStore();
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'confirm'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);

  const canTake = canTakeQuiz();
  const passed = hasPassedQuiz();

  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const timeUsed = QUIZ_DURATION - timeLeft;
  const timeMin = Math.floor(timeLeft / 60);
  const timeSec = timeLeft % 60;
  const timeWarning = timeLeft < 60;

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = { extinguisher: 0, evacuation: 0, alarm: 0 };
    questions.forEach((q) => (counts[q.category] = (counts[q.category] || 0) + 1));
    return counts;
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];

  const handleSelectOption = (key: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      if (currentQuestion.type === 'multiple') {
        const arr = Array.isArray(prev[currentQuestion.id])
          ? [...(prev[currentQuestion.id] as string[])]
          : [];
        const idx = arr.indexOf(key);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(key);
        arr.sort();
        return { ...prev, [currentQuestion.id]: arr };
      }
      return { ...prev, [currentQuestion.id]: key };
    });
  };

  const handleSubmit = () => {
    const result = submitQuiz(answers, timeUsed);
    if (result) {
      navigate('/employee/quiz/result');
    }
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  if (!canTake) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="card p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-fire-50 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-fire-500" />
          </div>
          <h2 className="text-2xl font-bold text-ocean-800 mb-3">测验暂未解锁</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            您需要先完成全部三门课程的学习后，才能参加在线考核。请先返回课程学习中心完成学习。
          </p>
          <button onClick={() => navigate('/employee/courses')} className="btn-primary">
            <BookOpen className="w-4 h-4" />
            前往课程学习
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fire-500 to-orange-500 flex items-center justify-center shadow-fire">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ocean-800">消防安全知识在线考核</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              完成考核且分数达到及格线后，即可参加线下演练签到
            </p>
          </div>
          {passed && (
            <span className="badge-success ml-auto text-sm px-4 py-2">
              <Trophy className="w-4 h-4" />
              已通过，可继续刷分
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-1 animate-fade-in-up">
          <div className="card text-center">
            <div className="text-3xl font-black text-fire-500">{questions.length}</div>
            <div className="text-xs text-slate-500 mt-1">题目数量</div>
          </div>
          <div className="card text-center stagger-2 animate-fade-in-up">
            <div className="text-3xl font-black text-ocean-500">100</div>
            <div className="text-xs text-slate-500 mt-1">总分</div>
          </div>
          <div className="card text-center stagger-3 animate-fade-in-up">
            <div className="text-3xl font-black text-warn-500">10</div>
            <div className="text-xs text-slate-500 mt-1">答题时长（分钟）</div>
          </div>
          <div className="card text-center stagger-4 animate-fade-in-up">
            <div className="text-3xl font-black text-success-500">{PASS_SCORE}</div>
            <div className="text-xs text-slate-500 mt-1">及格分数</div>
          </div>
        </div>

        <div className="card stagger-5 animate-fade-in-up">
          <h3 className="font-bold text-ocean-800 mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-fire-500" />
            题型分布
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(categoryLabel).map(([key, cfg]) => {
              const CatIcon = cfg.icon;
              return (
                <div
                  key={key}
                  className={cn(
                    'relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br',
                    cfg.color
                  )}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                  <CatIcon className="w-8 h-8 mb-3 relative z-10" />
                  <div className="font-bold text-lg relative z-10">{cfg.text}</div>
                  <div className="text-white/80 text-sm mt-1 relative z-10">
                    共 {categoryStats[key]} 道题
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-ocean-50 to-cyan-50 border-ocean-100 stagger-6 animate-fade-in-up">
          <h3 className="font-bold text-ocean-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warn-500" />
            答题须知
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-fire-500 mt-1">•</span>
              考试时间为 10 分钟，时间结束系统将自动提交试卷
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fire-500 mt-1">•</span>
              单选题和判断题只有一个正确答案，多选题需选择全部正确选项才算得分
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fire-500 mt-1">•</span>
              答题过程中可随时切换题目，已选答案会自动保存
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fire-500 mt-1">•</span>
              达到 {PASS_SCORE} 分即为考核通过，未通过可多次参加考核
            </li>
          </ul>
        </div>

        <div className="flex justify-center pt-4 stagger-7 animate-fade-in-up">
          <button
            onClick={() => setPhase('quiz')}
            className="btn-primary text-base px-10 py-3.5 rounded-2xl"
          >
            <ClipboardList className="w-5 h-5" />
            开始答题
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="card p-4 mb-5 stagger-1 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fire-500 to-orange-500 flex items-center justify-center shadow-fire">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-ocean-800">消防安全知识考核</div>
              <div className="text-sm text-slate-500">
                已答 <span className="font-semibold text-fire-600">{answeredCount}</span> /{' '}
                {questions.length} 题
              </div>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-lg tabular-nums',
              timeWarning
                ? 'bg-fire-500 text-white shadow-fire animate-pulse'
                : 'bg-ocean-50 text-ocean-700'
            )}
          >
            <Clock className="w-5 h-5" />
            {String(timeMin).padStart(2, '0')}:{String(timeSec).padStart(2, '0')}
          </div>
        </div>
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              timeWarning
                ? 'bg-gradient-to-r from-fire-500 to-orange-500'
                : 'bg-gradient-to-r from-success-500 to-emerald-400'
            )}
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 card stagger-2 animate-fade-in-up">
          <h3 className="font-bold text-ocean-800 mb-4 text-sm">题目导航</h3>
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'aspect-square rounded-xl text-sm font-bold transition-all duration-200',
                    isCurrent
                      ? 'bg-gradient-to-br from-fire-500 to-orange-500 text-white shadow-fire scale-110 z-10'
                      : isAnswered
                      ? 'bg-success-500 text-white hover:bg-success-600'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gradient-to-br from-fire-500 to-orange-500" />
              当前题目
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-success-500" />
              已作答
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-slate-200" />
              未作答
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-5">
          <div className="card p-8 stagger-3 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-ocean-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {currentIndex + 1}
                </div>
                <div>
                  <span className={cn('badge mr-2', typeLabel[currentQuestion.type].color)}>
                    {typeLabel[currentQuestion.type].text}
                  </span>
                  <span className="badge badge-info">
                    {categoryLabel[currentQuestion.category].text}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                本题分值：
                <span className="font-bold text-fire-600 ml-1">{currentQuestion.score}分</span>
              </div>
            </div>

            <div className="text-lg font-semibold text-ocean-800 leading-relaxed mb-8">
              {currentQuestion.content}
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected =
                  currentQuestion.type === 'multiple'
                    ? Array.isArray(currentAnswer) && currentAnswer.includes(opt.key)
                    : currentAnswer === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={cn(
                      'w-full flex items-start gap-4 p-4.5 rounded-2xl border-2 text-left transition-all duration-200 group',
                      isSelected
                        ? 'border-fire-400 bg-fire-50 shadow-md shadow-fire-500/10'
                        : 'border-slate-100 bg-white hover:border-ocean-200 hover:bg-ocean-50/40'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all duration-200',
                        currentQuestion.type === 'multiple'
                          ? isSelected
                            ? 'bg-fire-500 text-white rounded-md'
                            : 'bg-slate-100 text-slate-400 rounded-md group-hover:bg-slate-200'
                          : isSelected
                          ? 'bg-fire-500 text-white rounded-full'
                          : 'bg-slate-100 text-slate-400 rounded-full group-hover:bg-slate-200'
                      )}
                    >
                      {opt.key}
                    </div>
                    <div className="flex-1 pt-0.5 text-slate-700 group-hover:text-ocean-800 transition-colors">
                      {opt.text}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-fire-500 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 stagger-4 animate-fade-in-up">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="btn-ghost px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              上一题
            </button>
            <div className="text-sm text-slate-400">
              {currentIndex + 1} / {questions.length}
            </div>
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setPhase('confirm')}
                className="btn-primary px-6"
              >
                <Send className="w-4 h-4" />
                提交试卷
              </button>
            ) : (
              <button onClick={goNext} className="btn-primary px-6">
                下一题
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {phase === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-warn-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-10 h-10 text-warn-500" />
            </div>
            <h3 className="text-2xl font-bold text-ocean-800 text-center mb-2">确认提交试卷？</h3>
            <p className="text-center text-slate-500 mb-6">
              您已作答 <span className="font-bold text-fire-600">{answeredCount}</span> 题，
              还有 <span className="font-bold text-ocean-600">{questions.length - answeredCount}</span>{' '}
              题未作答。
              <br />
              提交后将无法修改答案，确定要提交吗？
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPhase('quiz')} className="btn-ghost px-8">
                <X className="w-4 h-4" />
                继续作答
              </button>
              <button onClick={handleSubmit} className="btn-primary px-8">
                <Send className="w-4 h-4" />
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
