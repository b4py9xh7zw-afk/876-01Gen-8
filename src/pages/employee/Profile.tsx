import { useMemo } from 'react';
import { useAppStore, courses, departments, floors, positions } from '@/store';
import { cn } from '@/lib/utils';
import {
  User,
  IdCard,
  Building2,
  Layers,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  ClipboardList,
  MapPinCheck,
  Flame,
  Navigation,
  Phone,
  CheckCircle2,
  Clock,
  CalendarDays,
  Trophy,
  XCircle,
  RotateCcw,
  Award,
  Hash,
  MapPin,
  Circle,
  GraduationCap,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Navigation,
  Phone,
};

const getCourseIcon = (iconName: string) => iconMap[iconName] || BookOpen;

export default function Profile() {
  const {
    currentUser,
    learningRecords,
    getUserQuizResults,
    checkinRecords,
    getCourseProgress,
    isCourseCompleted,
  } = useAppStore();

  const userDetail = useMemo(() => {
    if (!currentUser) return null;
    const dept = departments.find((d) => d.id === currentUser.departmentId);
    const fl = floors.find((f) => f.id === currentUser.floorId);
    const pos = positions.find((p) => p.id === currentUser.positionId);
    return {
      ...currentUser,
      departmentName: dept?.name || '-',
      floorName: fl ? `${fl.building}${fl.name}` : '-',
      positionName: pos?.name || '-',
    };
  }, [currentUser]);

  const myLearningRecords = useMemo(() => {
    if (!currentUser) return [];
    return courses.map((course) => {
      const rec = learningRecords.find(
        (r) => r.userId === currentUser.id && r.courseId === course.id
      );
      return {
        course,
        record: rec || null,
        progress: getCourseProgress(course.id),
        completed: isCourseCompleted(course.id),
      };
    });
  }, [currentUser, learningRecords, getCourseProgress, isCourseCompleted]);

  const quizResults = useMemo(() => getUserQuizResults(), [getUserQuizResults]);

  const myCheckinRecords = useMemo(() => {
    if (!currentUser) return [];
    return checkinRecords
      .filter((r) => r.userId === currentUser.id)
      .sort((a, b) => new Date(b.checkinAt).getTime() - new Date(a.checkinAt).getTime());
  }, [currentUser, checkinRecords]);

  if (!userDetail) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        <div className="card p-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-ocean-800 mb-3">请先登录</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl shadow-xl animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-900" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-fire-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute top-8 right-8 opacity-10">
          <ShieldCheck className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10 p-8 lg:p-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-shrink-0 relative">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-fire-400 via-fire-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-fire-500/50 border-4 border-white/20">
                <span className="text-5xl font-black drop-shadow-lg">
                  {userDetail.name.charAt(0)}
                </span>
              </div>
              {userDetail.status === 'retraining' && (
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-warn-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  复训
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-black">{userDetail.name}</h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold border backdrop-blur-sm',
                    userDetail.status === 'retraining'
                      ? 'bg-warn-400/20 text-warn-200 border-warn-400/40'
                      : 'bg-success-400/20 text-success-200 border-success-400/40'
                  )}
                >
                  {userDetail.status === 'retraining' ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {userDetail.status === 'retraining' ? '复训中' : '状态正常'}
                </span>
              </div>
              <p className="text-white/60 mb-6 text-sm">
                消防培训学员 · 加入时间{' '}
                {new Date(userDetail.createdAt).toLocaleDateString('zh-CN')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                    <IdCard className="w-3.5 h-3.5" />
                    工号
                  </div>
                  <div className="font-bold font-mono">{userDetail.employeeNo}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    部门
                  </div>
                  <div className="font-bold truncate">{userDetail.departmentName}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    楼层
                  </div>
                  <div className="font-bold">{userDetail.floorName}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    岗位
                  </div>
                  <div className="font-bold truncate">{userDetail.positionName}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    角色
                  </div>
                  <div className="font-bold">普通员工</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card stagger-1 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fire-50 text-fire-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ocean-800">学习记录</h3>
              <p className="text-sm text-slate-500">共 {courses.length} 门必修课程</p>
            </div>
          </div>
          <span className="badge badge-info">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已完成 {myLearningRecords.filter((x) => x.completed).length} / {courses.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myLearningRecords.map(({ course, record, progress, completed }, idx) => {
            const Icon = getCourseIcon(course.icon);
            return (
              <div
                key={course.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className={cn(
                    'relative h-24 flex items-center justify-center overflow-hidden bg-gradient-to-br',
                    course.color
                  )}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white blur-2xl" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center relative z-10">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {completed && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-bold border border-white/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已完成
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="font-bold text-ocean-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>学习进度</span>
                        <span className="font-bold text-ocean-700">{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', course.color)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration} 分钟
                      </div>
                      {record?.completedAt ? (
                        <div className="flex items-center gap-1 text-success-600 font-medium">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(record.completedAt).toLocaleDateString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </div>
                      ) : progress > 0 ? (
                        <span className="text-warn-600 font-medium">学习中</span>
                      ) : (
                        <span className="text-slate-400">未开始</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card stagger-2 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ocean-800">测验历史</h3>
              <p className="text-sm text-slate-500">共参加 {quizResults.length} 次考核</p>
            </div>
          </div>
          {quizResults.length > 0 && (
            <span
              className={cn(
                'badge',
                quizResults.some((r) => r.passed) ? 'badge-success' : 'badge-warn'
              )}
            >
              <Trophy className="w-3.5 h-3.5" />
              {quizResults.some((r) => r.passed) ? '已通过考核' : '尚未通过'}
            </span>
          )}
        </div>

        {quizResults.length > 0 ? (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-l-xl">
                    考试时间
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    分数
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    等级
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    用时
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    次数
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-r-xl">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quizResults.map((r, idx) => {
                  const grade =
                    r.score >= 95
                      ? { text: 'S', color: 'bg-yellow-50 text-yellow-600' }
                      : r.score >= 90
                      ? { text: 'A', color: 'bg-success-50 text-success-600' }
                      : r.score >= 80
                      ? { text: 'B', color: 'bg-ocean-50 text-ocean-600' }
                      : r.score >= 60
                      ? { text: 'C', color: 'bg-warn-50 text-warn-600' }
                      : { text: 'D', color: 'bg-fire-50 text-fire-600' };
                  return (
                    <tr
                      key={r.id}
                      className="group hover:bg-slate-50/60 transition-colors"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-ocean-700">
                          {new Date(r.takenAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(r.takenAt).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 font-black text-lg tabular-nums',
                            r.passed ? 'text-success-600' : 'text-fire-600'
                          )}
                        >
                          {r.score}
                          <span className="text-sm font-normal text-slate-400">/{r.totalScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-9 h-9 rounded-2xl font-black text-sm',
                            grade.color
                          )}
                        >
                          {grade.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                        {Math.floor(r.timeUsed / 60)}分{r.timeUsed % 60}秒
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600 font-medium">
                          <RotateCcw className="w-3.5 h-3.5" />
                          第 {r.attemptNo} 次
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('badge', r.passed ? 'badge-success' : 'badge-danger')}>
                          {r.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {r.passed ? '通过' : '未通过'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无考核记录</p>
            <p className="text-sm mt-1">完成课程学习后即可参加考核</p>
          </div>
        )}
      </div>

      <div className="card stagger-3 animate-fade-in-up mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
              <MapPinCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ocean-800">签到记录</h3>
              <p className="text-sm text-slate-500">
                共 {myCheckinRecords.filter((r) => r.success).length} 次成功签到
              </p>
            </div>
          </div>
          {myCheckinRecords.length > 0 && (
            <span className="badge badge-success">
              <Award className="w-3.5 h-3.5" />
              已完成签到
            </span>
          )}
        </div>

        {myCheckinRecords.length > 0 ? (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-l-xl">
                    签到时间
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    签到地点
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    签到码
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 rounded-r-xl">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myCheckinRecords.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-slate-50/60 transition-colors"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-ocean-700">
                        {new Date(r.checkinAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(r.checkinAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <MapPin className="w-4 h-4 text-success-500 flex-shrink-0" />
                        {r.location || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-ocean-700 font-mono font-bold text-sm">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {r.checkinCode}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('badge', r.success ? 'badge-success' : 'badge-danger')}>
                        {r.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        {r.success ? '签到成功' : '签到失败'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <MapPinCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无签到记录</p>
            <p className="text-sm mt-1">通过考核后即可参加线下演练签到</p>
          </div>
        )}
      </div>
    </div>
  );
}
