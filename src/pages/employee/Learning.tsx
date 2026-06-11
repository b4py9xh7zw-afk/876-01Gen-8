import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Navigation,
  Phone,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useAppStore, courses } from '@/store';
import type { Course, CourseChapter } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Navigation,
  Phone,
};

const getCourseIcon = (iconName: string) => {
  return iconMap[iconName] || BookOpen;
};

const CourseCard = ({ course }: { course: Course }) => {
  const navigate = useNavigate();
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const isCourseCompleted = useAppStore((s) => s.isCourseCompleted);
  const learningRecords = useAppStore((s) => s.learningRecords);
  const currentUser = useAppStore((s) => s.currentUser);

  const progress = getCourseProgress(course.id);
  const completed = isCourseCompleted(course.id);

  const completedChapters = currentUser
    ? learningRecords
        .filter(
          (r) => r.userId === currentUser.id && r.courseId === course.id
        )
        .flatMap((r) => r.completedChapters)
    : [];

  const Icon = getCourseIcon(course.icon);
  const isChapterComplete = (ch: CourseChapter) =>
    completedChapters.includes(ch.id);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        <div
          className={cn(
            'relative lg:w-72 w-full h-56 lg:h-auto bg-gradient-to-br flex items-center justify-center overflow-hidden',
            course.color
          )}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white blur-2xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Icon className="w-14 h-14 text-white" />
            </div>
            <div className="text-white/90 text-sm font-medium">
              {course.duration} 分钟
            </div>
            {completed && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已完成
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ocean-500 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {course.description}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-ocean-500">
                {progress}%
              </div>
              <div className="text-xs text-gray-400 mt-1">学习进度</div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium">
                章节列表（{completedChapters.length}/{course.chapters.length}）
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {course.chapters.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isChapterComplete(chapter)
                      ? 'bg-success-50 text-success-600'
                      : 'bg-gray-50 text-gray-600'
                  )}
                >
                  <span className="font-mono text-xs w-5 text-center opacity-60">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {isChapterComplete(chapter) ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0 opacity-40" />
                  )}
                  <span className="truncate">{chapter.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out animate-grow',
                  course.color
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={() => navigate(`/employee/course/${course.type}`)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                completed
                  ? 'bg-success-500 hover:bg-success-600 text-white shadow-lg shadow-success-500/30'
                  : 'bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
                course.color
              )}
            >
              {completed ? '复习课程' : progress > 0 ? '继续学习' : '开始学习'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Learning() {
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const isAllCoursesCompleted = useAppStore((s) => s.isAllCoursesCompleted);

  const totalProgress = Math.round(
    courses.reduce((acc, c) => acc + getCourseProgress(c.id), 0) /
      courses.length
  );
  const allCompleted = isAllCoursesCompleted();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fire-500 to-orange-500 flex items-center justify-center shadow-fire">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ocean-500">课程学习中心</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              完成全部三门课程学习后可参加测验
            </p>
          </div>
        </div>

        <div className="mt-6 p-6 bg-white rounded-2xl shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                总体学习进度
              </div>
              <div className="text-3xl font-bold text-ocean-500">
                {totalProgress}%
              </div>
            </div>
            {allCompleted && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success-50 text-success-600 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5" />
                全部课程已完成，可以参加测验了
              </div>
            )}
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fire-500 via-warn-500 to-success-500 transition-all duration-1000 ease-out animate-grow"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>灭火器使用</span>
            <span>疏散逃生</span>
            <span>报警流程</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
