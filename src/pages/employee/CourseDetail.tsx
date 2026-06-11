import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  AlertCircle,
  PartyPopper,
  GraduationCap,
  ClipboardCheck,
  Lightbulb,
  Home,
} from 'lucide-react';
import { useAppStore, courses } from '@/store';
import type { CourseType, Course, CourseChapter } from '@/types';
import { cn } from '@/lib/utils';

const getCourseByType = (type: string): Course | undefined => {
  return courses.find((c) => c.type === type);
};

const getNextCourseType = (currentType: CourseType): CourseType | null => {
  const order: CourseType[] = ['extinguisher', 'evacuation', 'alarm'];
  const idx = order.indexOf(currentType);
  return idx < order.length - 1 ? order[idx + 1] : null;
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseType } = useParams<{ courseType: string }>();

  const markChapterComplete = useAppStore((s) => s.markChapterComplete);
  const isCourseCompleted = useAppStore((s) => s.isCourseCompleted);
  const learningRecords = useAppStore((s) => s.learningRecords);
  const currentUser = useAppStore((s) => s.currentUser);
  const isAllCoursesCompleted = useAppStore((s) => s.isAllCoursesCompleted);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);

  const course = courseType ? getCourseByType(courseType) : undefined;
  const validCourseType = course?.type as CourseType | undefined;

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [markedChapters, setMarkedChapters] = useState<Set<string>>(new Set());

  const completedChapters = currentUser && course
    ? new Set(
        learningRecords
          .filter(
            (r) => r.userId === currentUser.id && r.courseId === course.id
          )
          .flatMap((r) => r.completedChapters)
      )
    : new Set<string>();

  useEffect(() => {
    if (course && completedChapters.size > 0) {
      const firstIncompleteIdx = course.chapters.findIndex(
        (ch) => !completedChapters.has(ch.id)
      );
      if (firstIncompleteIdx !== -1) {
        setCurrentChapterIdx(firstIncompleteIdx);
      } else {
        setCurrentChapterIdx(0);
      }
    }
  }, [course?.id]);

  useEffect(() => {
    if (!course) return;
    const chapter = course.chapters[currentChapterIdx];
    if (!chapter) return;
    if (completedChapters.has(chapter.id) || markedChapters.has(chapter.id))
      return;

    const timer = setTimeout(() => {
      markChapterComplete(course.id, chapter.id);
      setMarkedChapters((prev) => new Set(prev).add(chapter.id));
    }, 500);

    return () => clearTimeout(timer);
  }, [course?.id, currentChapterIdx]);

  if (!course || !validCourseType) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-fire-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ocean-500 mb-2">课程不存在</h2>
          <p className="text-gray-500 mb-6">未找到指定的课程，请返回学习中心重新选择</p>
          <button
            onClick={() => navigate('/employee/learning')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-500 text-white font-medium hover:bg-ocean-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回学习中心
          </button>
        </div>
      </div>
    );
  }

  const currentChapter = course.chapters[currentChapterIdx];
  const isFirstChapter = currentChapterIdx === 0;
  const isLastChapter = currentChapterIdx === course.chapters.length - 1;
  const allChaptersDone = course.chapters.every((ch) =>
    completedChapters.has(ch.id) || markedChapters.has(ch.id)
  );
  const nextCourseType = getNextCourseType(validCourseType);

  const handlePrev = () => {
    if (!isFirstChapter) setCurrentChapterIdx((i) => i - 1);
  };

  const handleNext = () => {
    if (!isLastChapter) {
      setCurrentChapterIdx((i) => i + 1);
    }
  };

  const handleCompleteCourse = () => {
    if (nextCourseType) {
      navigate(`/employee/course/${nextCourseType}`);
    } else if (isAllCoursesCompleted()) {
      navigate('/employee/quiz');
    } else {
      navigate('/employee/learning');
    }
  };

  const overallProgress = getCourseProgress(course.id);
  const isCurrentChapterComplete =
    completedChapters.has(currentChapter.id) ||
    markedChapters.has(currentChapter.id);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <Link
          to="/employee/learning"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ocean-500 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          返回学习中心
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/employee/learning"
            className="text-gray-500 hover:text-ocean-500 transition-colors"
          >
            学习中心
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-ocean-500 font-medium">{course.title}</span>
        </div>
      </div>

      {allChaptersDone && (
        <div className="mb-6 p-6 bg-gradient-to-r from-success-500 to-emerald-500 rounded-2xl text-white shadow-lg animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">恭喜完成《{course.title}》全部学习！</h3>
                <p className="text-white/90 text-sm">
                  {nextCourseType
                    ? `继续学习下一门课程：《${getCourseByType(nextCourseType)?.title}》`
                    : isAllCoursesCompleted()
                    ? '全部课程已完成，现在可以参加测验了！'
                    : '请返回学习中心完成剩余课程'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCompleteCourse}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-success-600 font-medium hover:bg-white/90 transition-colors shadow-lg"
            >
              {nextCourseType ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  前往下一门课
                </>
              ) : isAllCoursesCompleted() ? (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  参加测验
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  返回学习中心
                </>
              )}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-[30%] w-full border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50">
            <div
              className={cn(
                'p-6 bg-gradient-to-br',
                course.color
              )}
            >
              <h2 className="text-white font-bold text-lg mb-2">
                {course.title}
              </h2>
              <div className="flex items-center justify-between text-white/80 text-xs mb-3">
                <span>{course.chapters.length} 个章节</span>
                <span>{course.duration} 分钟</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="text-white/80 text-xs mt-2">
                已完成 {overallProgress}%
              </div>
            </div>

            <div className="p-4 max-h-[calc(100vh-320px)] lg:max-h-[600px] overflow-y-auto">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
                课程目录
              </div>
              <div className="space-y-1">
                {course.chapters.map((chapter, idx) => {
                  const isCurrent = idx === currentChapterIdx;
                  const isDone =
                    completedChapters.has(chapter.id) ||
                    markedChapters.has(chapter.id);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setCurrentChapterIdx(idx)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200',
                        isCurrent
                          ? 'bg-ocean-500 text-white shadow-md shadow-ocean-500/30'
                          : isDone
                          ? 'hover:bg-success-50 text-success-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5',
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : isDone
                            ? 'bg-success-100 text-success-600'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-sm font-medium leading-snug',
                            isCurrent ? '' : 'line-clamp-2'
                          )}
                        >
                          {chapter.title}
                        </div>
                        {isCurrent && isCurrentChapterComplete && (
                          <div className="text-xs text-white/70 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            已学习
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-[70%] w-full">
            <div className="p-6 lg:p-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold bg-gradient-to-br',
                      course.color
                    )}
                  >
                    {String(currentChapterIdx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium tracking-wide">
                      第 {currentChapterIdx + 1} 章 / 共 {course.chapters.length} 章
                    </div>
                    <h2 className="text-2xl font-bold text-ocean-500 mt-0.5">
                      {currentChapter.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="prose prose-gray max-w-none mb-8">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed text-[15px] space-y-1">
                  {currentChapter.content}
                </div>
              </div>

              {currentChapter.keyPoints && currentChapter.keyPoints.length > 0 && (
                <div className="mb-10 p-6 bg-gradient-to-br from-warn-50 to-orange-50 rounded-2xl border border-warn-400/20">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-warn-500 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-warn-600">
                      关键要点
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {currentChapter.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-warn-500/10 text-warn-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed pt-0.5">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={handlePrev}
                  disabled={isFirstChapter}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                    isFirstChapter
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一章
                </button>

                <div className="hidden sm:flex items-center gap-1.5">
                  {course.chapters.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        idx === currentChapterIdx
                          ? 'w-8 bg-ocean-500'
                          : idx < currentChapterIdx ||
                            completedChapters.has(course.chapters[idx].id) ||
                            markedChapters.has(course.chapters[idx].id)
                          ? 'w-4 bg-success-400'
                          : 'w-4 bg-gray-200'
                      )}
                    />
                  ))}
                </div>

                {isLastChapter ? (
                  <button
                    onClick={handleCompleteCourse}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r',
                      allChaptersDone
                        ? 'from-success-500 to-emerald-500 shadow-success-500/30'
                        : course.color
                    )}
                  >
                    {allChaptersDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        完成学习
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        标记完成
                      </>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r',
                      course.color
                    )}
                  >
                    下一章
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
