export type UserRole = 'employee' | 'admin';
export type UserStatus = 'normal' | 'retraining';
export type CourseType = 'extinguisher' | 'evacuation' | 'alarm';
export type QuestionType = 'single' | 'multiple' | 'judge';
export type StatDimension = 'floor' | 'department' | 'position';

export interface Department {
  id: string;
  name: string;
}

export interface Floor {
  id: string;
  name: string;
  building: string;
}

export interface Position {
  id: string;
  name: string;
  level: number;
}

export interface User {
  id: string;
  employeeNo: string;
  name: string;
  password: string;
  departmentId: string;
  floorId: string;
  positionId: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface CourseChapter {
  id: string;
  title: string;
  content: string;
  mediaType?: 'video' | 'image' | 'text';
  keyPoints?: string[];
}

export interface Course {
  id: string;
  title: string;
  type: CourseType;
  duration: number;
  description: string;
  icon: string;
  color: string;
  chapters: CourseChapter[];
}

export interface LearningRecord {
  id: string;
  userId: string;
  courseId: string;
  completed: boolean;
  progress: number;
  completedChapters: string[];
  completedAt?: string;
  startedAt: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: { key: string; text: string }[];
  answer: string | string[];
  category: CourseType;
  score: number;
  explanation?: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  correct: boolean;
  scoreGot: number;
  questionContent: string;
  correctAnswer: string | string[];
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  totalScore: number;
  passed: boolean;
  attemptNo: number;
  timeUsed: number;
  takenAt: string;
  answers: QuizAnswer[];
}

export interface CheckinRecord {
  id: string;
  userId: string;
  checkinCode: string;
  success: boolean;
  location?: string;
  checkinAt: string;
}

export interface StatSummary {
  totalUsers: number;
  learnedUsers: number;
  passedUsers: number;
  checkedInUsers: number;
  retrainingUsers: number;
  completionRate: number;
  passRate: number;
  checkinRate: number;
}

export interface DimensionStat {
  dimension: StatDimension;
  dimensionId: string;
  dimensionName: string;
  total: number;
  learned: number;
  passed: number;
  checkedIn: number;
  retraining: number;
}

export interface EmployeeDetail extends User {
  departmentName: string;
  floorName: string;
  positionName: string;
  learned: boolean;
  passed: boolean;
  checkedIn: boolean;
  latestScore?: number;
}
