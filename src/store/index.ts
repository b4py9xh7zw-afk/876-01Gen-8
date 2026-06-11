import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  LearningRecord,
  QuizResult,
  CheckinRecord,
  StatSummary,
  DimensionStat,
  StatDimension,
  QuizAnswer,
  EmployeeDetail,
} from '@/types';
import {
  users as mockUsers,
  courses,
  questions,
  learningRecords as mockLearningRecords,
  quizResults as mockQuizResults,
  checkinRecords as mockCheckinRecords,
  departments,
  floors,
  positions,
  CHECKIN_CODE,
  PASS_SCORE,
} from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  learningRecords: LearningRecord[];
  quizResults: QuizResult[];
  checkinRecords: CheckinRecord[];
  lastQuizResult: QuizResult | null;

  login: (username: string, password: string, role: string) => { success: boolean; message: string };
  logout: () => void;

  markChapterComplete: (courseId: string, chapterId: string) => void;
  isCourseCompleted: (courseId: string) => boolean;
  getCourseProgress: (courseId: string) => number;
  isAllCoursesCompleted: () => boolean;

  canTakeQuiz: () => boolean;
  submitQuiz: (answers: Record<string, string | string[]>, timeUsed: number) => QuizResult;
  getUserQuizResults: () => QuizResult[];
  hasPassedQuiz: () => boolean;

  canCheckin: () => boolean;
  hasCheckedIn: () => boolean;
  doCheckin: (code: string) => { success: boolean; message: string };

  getStatSummary: () => StatSummary;
  getDimensionStats: (dim: StatDimension) => DimensionStat[];
  getRetrainingList: () => EmployeeDetail[];
  getEmployeeDetails: (filters?: {
    departmentId?: string;
    floorId?: string;
    positionId?: string;
    keyword?: string;
    status?: 'all' | 'learned' | 'passed' | 'checkedin' | 'retraining';
  }) => EmployeeDetail[];

  setUserRetraining: (userId: string, status: 'normal' | 'retraining') => void;
}

const isUserLearned = (userId: string, records: LearningRecord[]) => {
  return courses.every(c =>
    records.some(r => r.userId === userId && r.courseId === c.id && r.completed)
  );
};

const isUserPassed = (userId: string, results: QuizResult[]) => {
  return results.some(r => r.userId === userId && r.passed);
};

const isUserCheckedIn = (userId: string, records: CheckinRecord[]) => {
  return records.some(r => r.userId === userId && r.success);
};

const updateUserStatus = (users: User[], records: LearningRecord[], results: QuizResult[], checkins: CheckinRecord[]): User[] => {
  return users.map(u => {
    if (u.role === 'admin') return u;
    const learned = isUserLearned(u.id, records);
    const passed = isUserPassed(u.id, results);
    const checkedIn = isUserCheckedIn(u.id, checkins);
    const completed = learned && passed && checkedIn;
    if (!completed && (learned && (!passed || !checkedIn))) {
      return { ...u, status: 'retraining' as const };
    }
    return { ...u, status: completed ? 'normal' as const : 'normal' as const };
  });
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: mockUsers,
      learningRecords: mockLearningRecords,
      quizResults: mockQuizResults,
      checkinRecords: mockCheckinRecords,
      lastQuizResult: null,

      login: (username, password, role) => {
        const user = mockUsers.find(
          u => u.employeeNo.toLowerCase() === username.toLowerCase() &&
            u.password === password &&
            u.role === role
        );
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return { success: true, message: '登录成功' };
        }
        return { success: false, message: '账号或密码错误' };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, lastQuizResult: null });
      },

      markChapterComplete: (courseId, chapterId) => {
        const { currentUser, learningRecords } = get();
        if (!currentUser) return;
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const idx = learningRecords.findIndex(
          r => r.userId === currentUser.id && r.courseId === courseId
        );
        const newRecords = [...learningRecords];
        const now = new Date().toISOString();

        if (idx >= 0) {
          const rec = newRecords[idx];
          const newChapters = rec.completedChapters.includes(chapterId)
            ? rec.completedChapters
            : [...rec.completedChapters, chapterId];
          const completed = newChapters.length >= course.chapters.length;
          newRecords[idx] = {
            ...rec,
            completedChapters: newChapters,
            progress: Math.round((newChapters.length / course.chapters.length) * 100),
            completed,
            completedAt: completed ? now : rec.completedAt,
          };
        } else {
          newRecords.push({
            id: `lr-${currentUser.id}-${courseId}-${Date.now()}`,
            userId: currentUser.id,
            courseId,
            completed: course.chapters.length === 1,
            progress: Math.round((1 / course.chapters.length) * 100),
            completedChapters: [chapterId],
            startedAt: now,
            completedAt: course.chapters.length === 1 ? now : undefined,
          });
        }

        const finalUsers = updateUserStatus(get().users, newRecords, get().quizResults, get().checkinRecords);
        const updatedCurrent = finalUsers.find(u => u.id === currentUser.id) || currentUser;
        set({ learningRecords: newRecords, users: finalUsers, currentUser: updatedCurrent });
      },

      isCourseCompleted: (courseId) => {
        const { currentUser, learningRecords } = get();
        if (!currentUser) return false;
        return learningRecords.some(
          r => r.userId === currentUser.id && r.courseId === courseId && r.completed
        );
      },

      getCourseProgress: (courseId) => {
        const { currentUser, learningRecords } = get();
        if (!currentUser) return 0;
        const rec = learningRecords.find(r => r.userId === currentUser.id && r.courseId === courseId);
        return rec?.progress || 0;
      },

      isAllCoursesCompleted: () => {
        const { currentUser, learningRecords } = get();
        if (!currentUser) return false;
        return courses.every(c =>
          learningRecords.some(r => r.userId === currentUser.id && r.courseId === c.id && r.completed)
        );
      },

      canTakeQuiz: () => get().isAllCoursesCompleted(),

      submitQuiz: (answers, timeUsed) => {
        const { currentUser, quizResults, learningRecords, checkinRecords, users } = get();
        if (!currentUser) throw new Error('未登录');

        let score = 0;
        const answerDetails: QuizAnswer[] = questions.map(q => {
          const userAns = answers[q.id];
          let correct = false;
          if (userAns) {
            if (Array.isArray(q.answer) && Array.isArray(userAns)) {
              correct =
                q.answer.length === userAns.length &&
                q.answer.every(a => userAns.includes(a));
            } else {
              correct = userAns === q.answer;
            }
          }
          const scoreGot = correct ? q.score : 0;
          score += scoreGot;
          return {
            questionId: q.id,
            userAnswer: userAns || (Array.isArray(q.answer) ? [] : ''),
            correct,
            scoreGot,
            questionContent: q.content,
            correctAnswer: q.answer,
          };
        });

        const passed = score >= PASS_SCORE;
        const userResults = quizResults.filter(r => r.userId === currentUser.id);
        const result: QuizResult = {
          id: `qr-${currentUser.id}-${Date.now()}`,
          userId: currentUser.id,
          score,
          totalScore: 100,
          passed,
          attemptNo: userResults.length + 1,
          timeUsed,
          takenAt: new Date().toISOString(),
          answers: answerDetails,
        };

        const newResults = [...quizResults, result];
        const finalUsers = updateUserStatus(users, learningRecords, newResults, checkinRecords);
        const updatedCurrent = finalUsers.find(u => u.id === currentUser.id) || currentUser;

        set({ quizResults: newResults, users: finalUsers, currentUser: updatedCurrent, lastQuizResult: result });
        return result;
      },

      getUserQuizResults: () => {
        const { currentUser, quizResults } = get();
        if (!currentUser) return [];
        return quizResults
          .filter(r => r.userId === currentUser.id)
          .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
      },

      hasPassedQuiz: () => {
        const { currentUser, quizResults } = get();
        if (!currentUser) return false;
        return quizResults.some(r => r.userId === currentUser.id && r.passed);
      },

      canCheckin: () => get().hasPassedQuiz(),

      hasCheckedIn: () => {
        const { currentUser, checkinRecords } = get();
        if (!currentUser) return false;
        return checkinRecords.some(r => r.userId === currentUser.id && r.success);
      },

      doCheckin: (code) => {
        const { currentUser, checkinRecords, learningRecords, quizResults, users } = get();
        if (!currentUser) return { success: false, message: '未登录' };
        if (get().hasCheckedIn()) return { success: false, message: '您已完成签到' };
        if (code.trim().toUpperCase() === CHECKIN_CODE) {
          const newRecord: CheckinRecord = {
            id: `cr-${currentUser.id}-${Date.now()}`,
            userId: currentUser.id,
            checkinCode: code.toUpperCase(),
            success: true,
            location: 'A栋1楼大厅',
            checkinAt: new Date().toISOString(),
          };
          const newCheckins = [...checkinRecords, newRecord];
          const finalUsers = updateUserStatus(users, learningRecords, quizResults, newCheckins);
          const updatedCurrent = finalUsers.find(u => u.id === currentUser.id) || currentUser;
          set({ checkinRecords: newCheckins, users: finalUsers, currentUser: updatedCurrent });
          return { success: true, message: '签到成功！恭喜完成全部考核流程！' };
        }
        return { success: false, message: '签到码错误，请重新输入' };
      },

      getStatSummary: () => {
        const { users, learningRecords, quizResults, checkinRecords } = get();
        const employees = users.filter(u => u.role === 'employee');
        const total = employees.length;
        let learned = 0, passed = 0, checkedIn = 0, retraining = 0;
        employees.forEach(u => {
          if (isUserLearned(u.id, learningRecords)) learned++;
          if (isUserPassed(u.id, quizResults)) passed++;
          if (isUserCheckedIn(u.id, checkinRecords)) checkedIn++;
          if (u.status === 'retraining') retraining++;
        });
        return {
          totalUsers: total,
          learnedUsers: learned,
          passedUsers: passed,
          checkedInUsers: checkedIn,
          retrainingUsers: retraining,
          completionRate: total ? Math.round((learned / total) * 100) : 0,
          passRate: total ? Math.round((passed / total) * 100) : 0,
          checkinRate: total ? Math.round((checkedIn / total) * 100) : 0,
        };
      },

      getDimensionStats: (dim) => {
        const { users, learningRecords, quizResults, checkinRecords } = get();
        const sourceMap =
          dim === 'floor' ? floors : dim === 'department' ? departments : positions;
        const keyField =
          dim === 'floor' ? 'floorId' : dim === 'department' ? 'departmentId' : 'positionId';

        return sourceMap.map(item => {
          const usersInDim = users.filter(u => u.role === 'employee' && u[keyField] === item.id);
          const total = usersInDim.length;
          let learned = 0, passed = 0, checkedIn = 0, retraining = 0;
          usersInDim.forEach(u => {
            if (isUserLearned(u.id, learningRecords)) learned++;
            if (isUserPassed(u.id, quizResults)) passed++;
            if (isUserCheckedIn(u.id, checkinRecords)) checkedIn++;
            if (u.status === 'retraining') retraining++;
          });
          return {
            dimension: dim,
            dimensionId: item.id,
            dimensionName: item.name,
            total,
            learned,
            passed,
            checkedIn,
            retraining,
          };
        }).filter(s => s.total > 0);
      },

      getRetrainingList: () => {
        const { users } = get();
        const retrainingUsers = users.filter(u => u.role === 'employee' && u.status === 'retraining');
        return get().getEmployeeDetails({}).filter(e => retrainingUsers.some(u => u.id === e.id));
      },

      getEmployeeDetails: (filters = {}) => {
        const { users, learningRecords, quizResults, checkinRecords } = get();
        const { departmentId, floorId, positionId, keyword, status } = filters;

        let list = users.filter(u => u.role === 'employee').map(u => {
          const dept = departments.find(d => d.id === u.departmentId);
          const fl = floors.find(f => f.id === u.floorId);
          const pos = positions.find(p => p.id === u.positionId);
          const userQuizResults = quizResults.filter(r => r.userId === u.id);
          const latest = userQuizResults.sort(
            (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
          )[0];
          return {
            ...u,
            departmentName: dept?.name || '-',
            floorName: fl ? `${fl.building}${fl.name}` : '-',
            positionName: pos?.name || '-',
            learned: isUserLearned(u.id, learningRecords),
            passed: isUserPassed(u.id, quizResults),
            checkedIn: isUserCheckedIn(u.id, checkinRecords),
            latestScore: latest?.score,
          } as EmployeeDetail;
        });

        if (departmentId) list = list.filter(e => e.departmentId === departmentId);
        if (floorId) list = list.filter(e => e.floorId === floorId);
        if (positionId) list = list.filter(e => e.positionId === positionId);
        if (keyword) {
          const kw = keyword.toLowerCase();
          list = list.filter(
            e => e.name.toLowerCase().includes(kw) || e.employeeNo.toLowerCase().includes(kw)
          );
        }
        if (status && status !== 'all') {
          if (status === 'learned') list = list.filter(e => e.learned);
          if (status === 'passed') list = list.filter(e => e.passed);
          if (status === 'checkedin') list = list.filter(e => e.checkedIn);
          if (status === 'retraining') list = list.filter(e => e.status === 'retraining');
        }

        return list;
      },

      setUserRetraining: (userId, status) => {
        const { users, learningRecords, quizResults, checkinRecords } = get();
        const updatedUsers = users.map(u =>
          u.id === userId ? { ...u, status } : u
        );
        const { currentUser } = get();
        const updatedCurrent = currentUser?.id === userId
          ? { ...currentUser, status }
          : currentUser;
        set({ users: updatedUsers, currentUser: updatedCurrent });
        void learningRecords;
        void quizResults;
        void checkinRecords;
      },
    }),
    {
      name: 'fire-safety-training-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        learningRecords: state.learningRecords,
        quizResults: state.quizResults,
        checkinRecords: state.checkinRecords,
        lastQuizResult: state.lastQuizResult,
      }),
    }
  )
);

export { courses, questions, departments, floors, positions };
