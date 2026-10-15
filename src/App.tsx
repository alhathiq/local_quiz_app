import React, { useState, useEffect, useMemo } from 'react';
import type { MCQQuestion, MCQTopic, QuizMode, QuizSessionConfig, SessionResult, QuestionAttempt } from './types';
import {
  loadStoredQuestions,
  saveQuestions,
  extractTopics,
  loadSessionHistory,
  saveSessionResult,
  clearAllProgress,
  resetToDefaultQuestions,
  recordQuestionAttempt,
} from './utils/storage';
import { Navbar, type ActiveTab } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { TopicSelector } from './components/TopicSelector';
import { QuizSession } from './components/QuizSession';
import { SessionSummary } from './components/SessionSummary';
import { QuestionBankView } from './components/QuestionBankView';
import { ImportExportView } from './components/ImportExportView';
import { ProgressView } from './components/ProgressView';
import { TelegramComparisonModal } from './components/TelegramComparisonModal';
import { Layers, Database, BarChart3, ArrowUpDown, Smartphone } from 'lucide-react';

export default function App() {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('topics');
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Derive topics with memoization to avoid redundant computations on tab switches
  const topics = useMemo(() => extractTopics(questions), [questions]);

  // Active quiz session state
  const [activeSession, setActiveSession] = useState<{
    questions: MCQQuestion[];
    mode: QuizMode;
  } | null>(null);

  // Session summary review state
  const [summaryResults, setSummaryResults] = useState<{
    questionId: string;
    question: MCQQuestion;
    userAnswers: Record<string, boolean>;
    isFullyCorrect: boolean;
    scorePercentage: number;
  }[] | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadStoredQuestions();
    setQuestions(loaded);
    setSessionHistory(loadSessionHistory());
  }, []);

  // Update questions and persist
  const updateQuestionsAndPersist = (newQuestions: MCQQuestion[]) => {
    setQuestions(newQuestions);
    saveQuestions(newQuestions);
  };

  // Immediate question-level attempt recording so progress is never lost
  const handleRecordQuestionAttempt = (
    questionId: string,
    userAnswers: Record<string, boolean>,
    evalResult: QuestionAttempt
  ) => {
    const updated = recordQuestionAttempt(
      questionId,
      userAnswers,
      evalResult.isFullyCorrect,
      evalResult.scorePercentage,
      evalResult.correctAnswersCount,
      evalResult.totalOptionsCount
    );
    setQuestions(updated);
  };

  // Toggle bookmark on a question
  const handleToggleBookmark = (questionId: string) => {
    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q
    );
    updateQuestionsAndPersist(updated);
  };

  // Start custom session from configuration
  const handleStartSession = (config: QuizSessionConfig) => {
    let pool = questions.filter((q) => config.topicIds.includes(q.topicId));

    if (config.filter === 'unanswered') {
      pool = pool.filter((q) => !q.lastAttempt);
    } else if (config.filter === 'missed') {
      pool = pool.filter((q) => q.lastAttempt && !q.lastAttempt.isFullyCorrect);
    } else if (config.filter === 'bookmarked') {
      pool = pool.filter((q) => !!q.bookmarked);
    }

    if (pool.length === 0) return;

    if (config.shuffle) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }

    if (config.questionLimit && config.questionLimit > 0) {
      pool = pool.slice(0, config.questionLimit);
    }

    setSummaryResults(null);
    setActiveSession({
      questions: pool,
      mode: config.mode,
    });
  };

  // Quick Start all questions
  const handleStartAll = () => {
    handleStartSession({
      mode: 'study',
      topicIds: topics.map((t) => t.id),
      filter: 'all',
      shuffle: true,
    });
  };

  // Quick Start missed questions
  const handleStartMissed = () => {
    handleStartSession({
      mode: 'study',
      topicIds: topics.map((t) => t.id),
      filter: 'missed',
      shuffle: true,
    });
  };

  // Quick Start bookmarked questions
  const handleStartBookmarked = () => {
    handleStartSession({
      mode: 'study',
      topicIds: topics.map((t) => t.id),
      filter: 'bookmarked',
      shuffle: false,
    });
  };

  // Start single question testing
  const handleTestSingleQuestion = (question: MCQQuestion) => {
    setSummaryResults(null);
    setActiveSession({
      questions: [question],
      mode: 'study',
    });
  };

  // Finish an active quiz session
  const handleFinishSession = (
    results: {
      questionId: string;
      question: MCQQuestion;
      userAnswers: Record<string, boolean>;
      isFullyCorrect: boolean;
      scorePercentage: number;
    }[]
  ) => {
    const updatedQuestions = questions.map((q) => {
      const match = results.find((r) => r.questionId === q.id);
      if (match) {
        const attempt = {
          timestamp: Date.now(),
          userAnswers: match.userAnswers,
          isFullyCorrect: match.isFullyCorrect,
          correctAnswersCount: Math.round((match.scorePercentage / 100) * q.options.length),
          totalOptionsCount: q.options.length,
          scorePercentage: match.scorePercentage,
        };
        return {
          ...q,
          lastAttempt: attempt,
          attemptCount: (q.attemptCount || 0) + 1,
          failureCount: match.isFullyCorrect ? (q.failureCount || 0) : (q.failureCount || 0) + 1,
        };
      }
      return q;
    });

    updateQuestionsAndPersist(updatedQuestions);

    // Save session result to history
    const fullyCorrectCount = results.filter((r) => r.isFullyCorrect).length;
    const topicNames = Array.from(new Set(results.map((r) => r.question.topicName)));

    const newSessionResult: SessionResult = {
      totalQuestions: results.length,
      answeredQuestions: results.length,
      fullyCorrectCount,
      partialScoreTotal: results.reduce((acc, curr) => acc + curr.scorePercentage, 0) / results.length,
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      topicNames,
      results,
    };

    const savedHistory = saveSessionResult(newSessionResult);
    setSessionHistory(savedHistory);

    setActiveSession(null);
    setSummaryResults(results);
  };

  // Re-start missed from summary
  const handleRestartMissedFromSummary = () => {
    if (!summaryResults) return;
    const missed = summaryResults
      .filter((r) => !r.isFullyCorrect)
      .map((r) => questions.find((q) => q.id === r.questionId) || r.question);

    if (missed.length > 0) {
      setSummaryResults(null);
      setActiveSession({
        questions: missed,
        mode: 'study',
      });
    }
  };

  // Re-start all from summary
  const handleRestartAllFromSummary = () => {
    if (!summaryResults) return;
    const retest = summaryResults.map(
      (r) => questions.find((q) => q.id === r.questionId) || r.question
    );
    setSummaryResults(null);
    setActiveSession({
      questions: retest,
      mode: 'study',
    });
  };

  // Reset progress stats
  const handleResetProgress = () => {
    const cleared = clearAllProgress(questions);
    updateQuestionsAndPersist(cleared);
    setSessionHistory([]);
  };

  // Reset to default questions
  const handleResetToDefaults = () => {
    const defaults = resetToDefaultQuestions();
    updateQuestionsAndPersist(defaults);
    setSummaryResults(null);
    setActiveSession(null);
  };

  // Import custom questions
  const handleImportQuestions = (newQuestions: MCQQuestion[], replaceAll: boolean) => {
    if (replaceAll) {
      updateQuestionsAndPersist(newQuestions);
    } else {
      // Merge by title/topic or append
      const merged = [...questions];
      for (const nq of newQuestions) {
        const existingIdx = merged.findIndex(
          (m) => m.title.toLowerCase().trim() === nq.title.toLowerCase().trim() && m.topicId === nq.topicId
        );
        if (existingIdx >= 0) {
          merged[existingIdx] = nq;
        } else {
          merged.push(nq);
        }
      }
      updateQuestionsAndPersist(merged);
    }
    setActiveTab('topics');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveSession(null);
          setSummaryResults(null);
          window.scrollTo(0, 0);
        }}
        onOpenComparison={() => setShowTelegramModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeSession ? (
          <QuizSession
            questions={activeSession.questions}
            mode={activeSession.mode}
            onFinishSession={handleFinishSession}
            onRecordQuestionAttempt={handleRecordQuestionAttempt}
            onExit={() => setActiveSession(null)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : summaryResults ? (
          <SessionSummary
            results={summaryResults}
            onRestartAll={handleRestartAllFromSummary}
            onRestartMissed={handleRestartMissedFromSummary}
            onBackToTopics={() => setSummaryResults(null)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          <>
            {activeTab === 'topics' && (
              <>
                <StatsOverview
                  questions={questions}
                  onStartAll={handleStartAll}
                  onStartMissed={handleStartMissed}
                  onStartBookmarked={handleStartBookmarked}
                  onResetProgress={handleResetProgress}
                />
                <TopicSelector
                  topics={topics}
                  questions={questions}
                  onStartSession={handleStartSession}
                />
              </>
            )}

            {activeTab === 'bank' && (
              <QuestionBankView
                questions={questions}
                topics={topics}
                onToggleBookmark={handleToggleBookmark}
                onTestSingleQuestion={handleTestSingleQuestion}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                questions={questions}
                topics={topics}
                sessionHistory={sessionHistory}
                onStartReviewMissed={handleStartMissed}
                onSelectTopic={(topicId) => {
                  setActiveTab('topics');
                  handleStartSession({
                    mode: 'study',
                    topicIds: [topicId],
                    filter: 'all',
                    shuffle: true,
                  });
                }}
              />
            )}

            {activeTab === 'import-export' && (
              <ImportExportView
                currentQuestions={questions}
                onImportQuestions={handleImportQuestions}
                onResetToDefaults={handleResetToDefaults}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation for easy one-hand usage */}
      {!activeSession && (
        <nav aria-label="Navigation mobile inférieure" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 px-2 py-1 flex items-center justify-around text-[10px]">
          <button
            onClick={() => {
              setActiveTab('topics');
              setActiveSession(null);
              setSummaryResults(null);
              window.scrollTo(0, 0);
            }}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition ${
              activeTab === 'topics' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Thèmes</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bank');
              setActiveSession(null);
              setSummaryResults(null);
              window.scrollTo(0, 0);
            }}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition ${
              activeTab === 'bank' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Database className="w-5 h-5" />
            <span>Banque</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('progress');
              setActiveSession(null);
              setSummaryResults(null);
              window.scrollTo(0, 0);
            }}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition ${
              activeTab === 'progress' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Scores</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import-export');
              setActiveSession(null);
              setSummaryResults(null);
              window.scrollTo(0, 0);
            }}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition ${
              activeTab === 'import-export' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ArrowUpDown className="w-5 h-5" />
            <span>Import</span>
          </button>
        </nav>
      )}

      {/* PWA vs Telegram Analysis Modal */}
      <TelegramComparisonModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
      />
    </div>
  );
}
