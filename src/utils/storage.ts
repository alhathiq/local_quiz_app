import type { MCQQuestion, MCQTopic, SessionResult } from '../types';
import { getDefaultQuestions } from '../data/defaultQuestions';

const STORAGE_KEYS = {
  QUESTIONS: 'medmcq_questions_v1',
  SESSION_HISTORY: 'medmcq_sessions_v1',
  PREFERENCES: 'medmcq_prefs_v1',
};

export interface UserPreferences {
  evalMode: 'checkbox' | 'binary'; // 'checkbox': select true items; 'binary': explicit True / False per option
  autoAdvanceOnSubmit: boolean;
  shuffleOptions: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  evalMode: 'checkbox',
  autoAdvanceOnSubmit: false,
  shuffleOptions: false,
};

export function loadStoredQuestions(): MCQQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      const defaults = getDefaultQuestions();
      saveQuestions(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load questions from storage, falling back to defaults', err);
  }
  const defaults = getDefaultQuestions();
  saveQuestions(defaults);
  return defaults;
}

export function saveQuestions(questions: MCQQuestion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

export function resetToDefaultQuestions(): MCQQuestion[] {
  const defaults = getDefaultQuestions();
  saveQuestions(defaults);
  return defaults;
}

export function recordQuestionAttempt(
  questionId: string,
  userAnswers: Record<string, boolean>,
  isFullyCorrect: boolean,
  scorePercentage: number,
  correctAnswersCount: number,
  totalOptionsCount: number
): MCQQuestion[] {
  const currentQuestions = loadStoredQuestions();
  const updated = currentQuestions.map((q) => {
    if (q.id === questionId) {
      return {
        ...q,
        lastAttempt: {
          timestamp: Date.now(),
          userAnswers,
          isFullyCorrect,
          correctAnswersCount,
          totalOptionsCount,
          scorePercentage,
        },
        attemptCount: (q.attemptCount || 0) + 1,
        failureCount: isFullyCorrect ? (q.failureCount || 0) : (q.failureCount || 0) + 1,
      };
    }
    return q;
  });
  saveQuestions(updated);
  return updated;
}

export function clearAllProgress(questions: MCQQuestion[]): MCQQuestion[] {
  const resetQuestions = questions.map((q) => {
    const { lastAttempt, attemptCount, failureCount, ...rest } = q;
    return {
      ...rest,
      attemptCount: 0,
      failureCount: 0,
    };
  });
  saveQuestions(resetQuestions);
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  } catch (err) {
    console.error('Failed to clear session history', err);
  }
  return resetQuestions;
}

export function loadSessionHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load session history', err);
  }
  return [];
}

export function saveSessionResult(result: SessionResult): SessionResult[] {
  try {
    const history = loadSessionHistory();
    history.unshift(result);
    // keep latest 50 sessions
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(trimmed));
    return trimmed;
  } catch (err) {
    console.error('Failed to save session history', err);
    return [];
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load preferences', err);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save preferences', err);
  }
}

/**
 * Computes aggregated topic metadata from the current question list
 */
export function extractTopics(questions: MCQQuestion[]): MCQTopic[] {
  const map = new Map<string, { name: string; total: number; completed: number; missed: number }>();

  for (const q of questions) {
    const current = map.get(q.topicId) || { name: q.topicName, total: 0, completed: 0, missed: 0 };
    current.total++;
    if (q.lastAttempt) {
      current.completed++;
      if (!q.lastAttempt.isFullyCorrect) {
        current.missed++;
      }
    }
    map.set(q.topicId, current);
  }

  const topics: MCQTopic[] = [];
  map.forEach((val, id) => {
    topics.push({
      id,
      name: val.name,
      questionCount: val.total,
      completedCount: val.completed,
      missedCount: val.missed,
    });
  });

  return topics.sort((a, b) => a.name.localeCompare(b.name));
}
