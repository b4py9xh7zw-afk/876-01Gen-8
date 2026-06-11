import { cn } from '@/lib/utils';
import type { Course } from '@/types';
import { Flame, Navigation, Phone, ChevronRight, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';

interface CourseCardProps {
  course: Course;
  className?: string;
  onClick?: () => void;
}

const iconMap = {
  Flame,
  Navigation,
  Phone,
};

export default function CourseCard({ course, className, onClick }: CourseCardProps) {
  const { getCourseProgress, isCourseCompleted } = useAppStore();
  const progress = getCourseProgress(course.id);
  const completed = isCourseCompleted(course.id);
  const Icon = iconMap[course.icon as keyof typeof iconMap] || BookOpen;

  return (
    <div
      className={cn(
        'card-hoverable group',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white shadow-lg',
            course.color
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-ocean-800 text-base leading-snug line-clamp-2 group-hover:text-fire-600 transition-colors">
              {course.title}
            </h3>
            {completed && (
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration} 分钟
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.chapters.length} 章节
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">学习进度</span>
          <span className={cn(
            'font-semibold',
            completed ? 'text-success-600' : 'text-fire-600'
          )}>
            {progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={cn(
              'progress-fill',
              completed && 'bg-gradient-to-r from-success-500 to-emerald-400'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className={cn(
          'badge',
          completed ? 'badge-success' : 'badge-info'
        )}>
          {completed ? '已完成' : progress > 0 ? '学习中' : '未开始'}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-fire-600 group-hover:gap-2 transition-all">
          {completed ? '查看详情' : '继续学习'}
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
