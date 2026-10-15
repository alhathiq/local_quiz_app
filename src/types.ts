export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean; // true if marked [True]/[Vrai]
}

export interface QuestionAttempt {
  timestamp: number;
  userAnswers: Record<string, boolean>; // optionId -> user chosen boolean (true or false)
  isFullyCorrect: boolean;
  correctAnswersCount: number;
  totalOptionsCount: number;
  scorePercentage: number;
}

export interface MCQQuestion {
  id: string;
  topicId: string;
  topicName: string;
  questionNumber?: number;
  title: string;
  options: MCQOption[];
  explanation?: string;
  bookmarked?: boolean;
  lastAttempt?: QuestionAttempt;
  attemptCount?: number;
  failureCount?: number;
}

export interface MCQTopic {
  id: string;
  name: string;
  questionCount: number;
  completedCount: number;
  missedCount: number;
}

export type QuizMode = 'study' | 'exam';

export interface QuizSessionConfig {
  mode: QuizMode;
  topicIds: string[];
  filter: 'all' | 'unanswered' | 'missed' | 'bookmarked';
  shuffle: boolean;
  questionLimit?: number;
}

export interface SessionResult {
  totalQuestions: number;
  answeredQuestions: number;
  fullyCorrectCount: number;
  partialScoreTotal: number;
  startedAt: number;
  completedAt: number;
  topicNames: string[];
  results: {
    questionId: string;
    question: MCQQuestion;
    userAnswers: Record<string, boolean>;
    isFullyCorrect: boolean;
    scorePercentage: number;
  }[];
}
