import { useMemo } from 'react';
import { useAppStore, courses } from '@/store';
import { StatCard, CourseCard } from '@/components';
import { cn } from '@/lib/utils';
import {
  Flame,
  BookOpen,
  ClipboardList,
  MapPinCheck,
  Trophy,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  Sparkles,
  Clock,
  Medal,
  ArrowRight,
} from 'lucide-react';

const safetyTips = [
  '消防通道莫堵塞，生命通道保畅通 🚒',
  '火场逃生弯腰走，湿巾捂鼻防烟害 😷',
  '灭火器使用四字诀：提、拔、握、压 💨',
  '电器起火先断电，切勿用水泼上去 ⚡',
  '火警电话119，沉着冷静说清楚 📞',
  '火灾逃生莫乘梯，安全通道是第一 🛗',
  '隐患险于明火，防范胜于救灾 🔐',
];

export default function Dashboard() {
  const { currentUser, getCourseProgress, isCourseCompleted, isAllCoursesCompleted, hasPassedQuiz, hasCheckedIn, getUserQuizResults } = useAppStore();

  const todayStr = useMemo(() => {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
  }, []);

  const tipOfDay = useMemo(() => {
    const idx = new Date().getDate() % safetyTips.length;
    return safetyTips[idx];
  }, []);

  const learningProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((sum, c) => sum + getCourseProgress(c.id), 0);
    return Math.round(total / courses.length);
  }, [getCourseProgress]);

  const completedCount = useMemo(
    () => courses.filter((c) => isCourseCompleted(c.id)).length,
    [isCourseCompleted]
  );

  const quizStatus = useMemo(() => {
    const results = getUserQuizResults();
    return {
      passed: hasPassedQuiz(),
      attempts: results.length,
      latest: results[0],
    };
  }, [getUserQuizResults, hasPassedQuiz]);

  const checkinStatus = hasCheckedIn();

  const overallProgress = useMemo(() => {
    let score = 0;
    score += (learningProgress / 100) * 40;
    score += (isAllCoursesCompleted() ? 1 : learningProgress / 100) * 30;
    score += quizStatus.passed ? 30 : 0;
    return Math.round(score);
  }, [learningProgress, isAllCoursesCompleted, quizStatus.passed]);

  const todoList = useMemo(() => {
    const todos: { id: string; text: string; done: boolean; type: 'course' | 'quiz' | 'checkin'; courseId?: string }[] = [];

    courses.forEach((c) => {
      if (!isCourseCompleted(c.id)) {
        const p = getCourseProgress(c.id);
        todos.push({
          id: `todo-${c.id}`,
          text: p > 0 ? `${c.title}（需继续学习，进度 ${p}%）` : `${c.title}（尚未开始学习）`,
          done: false,
          type: 'course',
          courseId: c.id,
        });
      }
    });

    todos.push({
      id: 'todo-quiz',
      text: isAllCoursesCompleted()
        ? quizStatus.passed
          ? '在线考核已通过 ✅'
          : '课程已学完，尽快参加在线考核'
        : '完成全部课程后可参加在线考核',
      done: quizStatus.passed,
      type: 'quiz',
    });

    todos.push({
      id: 'todo-checkin',
      text: quizStatus.passed
        ? checkinStatus
          ? '现场签到已完成 ✅'
          : '考核已通过，尽快完成现场签到'
        : '通过考核后可进行现场签到',
      done: checkinStatus,
      type: 'checkin',
    });

    return todos;
  }, [isCourseCompleted, getCourseProgress, isAllCoursesCompleted, quizStatus.passed, checkinStatus]);

  const pendingTodos = todoList.filter((t) => !t.done);
  const doneTodos = todoList.filter((t) => t.done);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card relative overflow-hidden p-8 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-fire-500 via-fire-600 to-orange-500 opacity-95" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute top-6 right-6 opacity-10">
          <Flame className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <CalendarDays className="w-4 h-4" />
              {todayStr}
            </div>
            <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
              欢迎回来，{currentUser?.name || '学员'}
              <Sparkles className="w-7 h-7 text-yellow-300" />
            </h1>
            <p className="text-white/90 max-w-xl">
              {overallProgress >= 100
                ? '🎉 恭喜！您已完成全部消防安全培训考核流程，为您的安全意识点赞！'
                : `让我们继续加油，还有 ${pendingTodos.length} 项任务等待您完成。`}
            </p>
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 w-fit">
              <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span className="text-sm">今日安全提示：{tipOfDay}</span>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="text-center">
              <div className="text-5xl font-black text-white drop-shadow-lg">{overallProgress}%</div>
              <div className="text-sm text-white/70 mt-1">整体完成度</div>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={cn('w-2.5 h-2.5 rounded-full', completedCount === courses.length ? 'bg-emerald-300' : 'bg-yellow-300 animate-pulse')} />
                <span className="text-white/90">学习进度 {completedCount}/{courses.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn('w-2.5 h-2.5 rounded-full', quizStatus.passed ? 'bg-emerald-300' : 'bg-white/40')} />
                <span className="text-white/90">考核状态 {quizStatus.passed ? '已通过' : '未完成'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn('w-2.5 h-2.5 rounded-full', checkinStatus ? 'bg-emerald-300' : 'bg-white/40')} />
                <span className="text-white/90">签到状态 {checkinStatus ? '已完成' : '未完成'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="学习进度"
          value={`${completedCount} / ${courses.length}`}
          icon={BookOpen}
          color="fire"
          progress={learningProgress}
          subtitle={`共 ${courses.length} 门课程`}
          className="animate-fade-in-up stagger-1"
        />
        <StatCard
          title="测验状态"
          value={quizStatus.passed ? '已通过' : quizStatus.attempts > 0 ? '挑战中' : '未开始'}
          icon={ClipboardList}
          color="ocean"
          progress={quizStatus.passed ? 100 : quizStatus.attempts > 0 ? 50 : 0}
          subtitle={quizStatus.attempts > 0 ? `已尝试 ${quizStatus.attempts} 次` : '完成课程后解锁'}
          className="animate-fade-in-up stagger-2"
        />
        <StatCard
          title="签到状态"
          value={checkinStatus ? '已完成' : '未完成'}
          icon={MapPinCheck}
          color="warn"
          progress={checkinStatus ? 100 : 0}
          subtitle={checkinStatus ? '恭喜完成全部流程' : '考核通过后解锁'}
          className="animate-fade-in-up stagger-3"
        />
        <StatCard
          title="整体完成度"
          value={`${overallProgress}%`}
          icon={Trophy}
          color="success"
          progress={overallProgress}
          subtitle={overallProgress >= 100 ? '🏆 全部完成' : '继续加油'}
          className="animate-fade-in-up stagger-4"
        />
      </div>

      <div className="space-y-4 animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fire-50 text-fire-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ocean-800">我的学习任务</h2>
              <p className="text-sm text-slate-500">完成所有课程学习才能参加考核</p>
            </div>
          </div>
          <span className="text-sm text-fire-600 font-medium flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.25 + idx * 0.05}s` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card animate-fade-in-up stagger-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-warn-500/15 text-warn-600 flex items-center justify-center">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ocean-800">待办事项</h2>
                <p className="text-sm text-slate-500">
                  共 {todoList.length} 项，待完成 {pendingTodos.length} 项
                </p>
              </div>
            </div>
            <span className="badge-warn">
              {pendingTodos.length > 0 ? `${pendingTodos.length} 项待完成` : '全部完成'}
            </span>
          </div>

          <div className="space-y-2">
            {pendingTodos.length > 0 && (
              <div className="space-y-2">
                {pendingTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-fire-200 hover:bg-fire-50/50 transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-fire-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ocean-700">{todo.text}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'badge',
                            todo.type === 'course' && 'badge-info',
                            todo.type === 'quiz' && 'badge-warn',
                            todo.type === 'checkin' && 'badge-success'
                          )}
                        >
                          {todo.type === 'course' ? '课程学习' : todo.type === 'quiz' ? '在线考核' : '现场签到'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-fire-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {doneTodos.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  已完成
                </div>
                {doneTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl"
                  >
                    <div className="w-5 h-5 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white -m-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-500 line-through">{todo.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {todoList.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无待办事项</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card animate-fade-in-up stagger-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ocean-800">最近测验成绩</h2>
                <p className="text-sm text-slate-500">最近5次考核记录</p>
              </div>
            </div>
          </div>

          {quizStatus.latest ? (
            <div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-ocean-50 to-cyan-50 border border-ocean-100 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-ocean-600 font-medium">最新成绩</span>
                  <span
                    className={cn(
                      'badge',
                      quizStatus.latest.passed ? 'badge-success' : 'badge-danger'
                    )}
                  >
                    {quizStatus.latest.passed ? '已通过' : '未通过'}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-ocean-800">
                    {quizStatus.latest.score}
                  </span>
                  <span className="text-sm text-slate-400 pb-1.5">/ 100分</span>
                </div>
                <div className="progress-bar h-3 mb-3">
                  <div
                    className={cn(
                      'progress-fill h-full',
                      quizStatus.latest.passed
                        ? 'bg-gradient-to-r from-success-500 to-emerald-400'
                        : 'bg-gradient-to-r from-fire-500 to-orange-400'
                    )}
                    style={{ width: `${quizStatus.latest.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    用时 {Math.floor(quizStatus.latest.timeUsed / 60)}分{quizStatus.latest.timeUsed % 60}秒
                  </span>
                  <span>第 {quizStatus.latest.attemptNo} 次尝试</span>
                </div>
              </div>

              <div className="space-y-2">
                {getUserQuizResults()
                  .slice(1, 5)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                          r.passed
                            ? 'bg-success-50 text-success-600'
                            : 'bg-fire-50 text-fire-600'
                        )}
                      >
                        {r.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ocean-700">
                          第{r.attemptNo}次尝试
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(r.takenAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'badge',
                          r.passed ? 'badge-success' : 'badge-danger'
                        )}
                      >
                        {r.passed ? '通过' : '未通过'}
                      </span>
                    </div>
                  ))}
                {getUserQuizResults().length <= 1 && (
                  <div className="text-center py-4 text-sm text-slate-400">
                    暂无更多历史记录
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">暂无测验记录</p>
              <p className="text-sm text-slate-400 mt-1">
                完成全部课程学习后即可参加在线考核
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
