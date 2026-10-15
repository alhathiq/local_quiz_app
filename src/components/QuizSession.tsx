import React, { useState, useEffect } from 'react';
import type { MCQQuestion, QuestionAttempt, QuizMode } from '../types';
import { evaluateQuestion } from '../utils/markdownParser';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  X,
  Timer,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  questions: MCQQuestion[];
  mode: QuizMode;
  onFinishSession: (results: {
    questionId: string;
    question: MCQQuestion;
    userAnswers: Record<string, boolean>;
    isFullyCorrect: boolean;
    scorePercentage: number;
  }[]) => void;
  onRecordQuestionAttempt: (
    questionId: string,
    userAnswers: Record<string, boolean>,
    evalResult: QuestionAttempt
  ) => void;
  onExit: () => void;
  onToggleBookmark: (questionId: string) => void;
}

export const QuizSession: React.FC<Props> = ({
  questions,
  mode,
  onFinishSession,
  onRecordQuestionAttempt,
  onExit,
  onToggleBookmark,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [hasValidated, setHasValidated] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    {
      questionId: string;
      question: MCQQuestion;
      userAnswers: Record<string, boolean>;
      isFullyCorrect: boolean;
      scorePercentage: number;
    }[]
  >([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBinaryMode, setIsBinaryMode] = useState(false); // toggle between multi-checkbox vs explicit True/False buttons

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 1-9 to toggle options
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= currentQuestion.options.length) {
        if (!hasValidated || mode === 'exam') {
          const opt = currentQuestion.options[num - 1];
          toggleOption(opt.id);
        }
      }

      // Enter to validate or go to next
      if (e.key === 'Enter') {
        if (!hasValidated && mode === 'study') {
          handleValidate();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, userAnswers, hasValidated, mode, currentQuestion]);

  if (!currentQuestion) {
    return null;
  }

  const toggleOption = (optionId: string) => {
    if (hasValidated && mode === 'study') return;
    setUserAnswers((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const setOptionExplicit = (optionId: string, val: boolean) => {
    if (hasValidated && mode === 'study') return;
    setUserAnswers((prev) => ({
      ...prev,
      [optionId]: val,
    }));
  };

  const currentEval: QuestionAttempt = evaluateQuestion(currentQuestion, userAnswers);

  const handleValidate = () => {
    setHasValidated(true);
    const finalEval = evaluateQuestion(currentQuestion, userAnswers);
    // Instant real-time persistence so progress is never lost
    onRecordQuestionAttempt(currentQuestion.id, userAnswers, finalEval);

    const newResult = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      userAnswers,
      isFullyCorrect: finalEval.isFullyCorrect,
      scorePercentage: finalEval.scorePercentage,
    };

    setSessionResults((prev) => [
      ...prev.filter((r) => r.questionId !== currentQuestion.id),
      newResult,
    ]);
  };

  const handleNext = () => {
    const finalEval = evaluateQuestion(currentQuestion, userAnswers);
    onRecordQuestionAttempt(currentQuestion.id, userAnswers, finalEval);

    const updatedResults = [
      ...sessionResults.filter((r) => r.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        question: currentQuestion,
        userAnswers,
        isFullyCorrect: finalEval.isFullyCorrect,
        scorePercentage: finalEval.scorePercentage,
      },
    ];

    setSessionResults(updatedResults);

    if (isLast) {
      onFinishSession(updatedResults);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswers({});
      setHasValidated(false);
      window.scrollTo(0, 0);
    }
  };

  const handleExitClick = () => {
    // If user answered at least one question, log session results before closing
    if (sessionResults.length > 0 || hasValidated) {
      let finalResults = [...sessionResults];
      if (hasValidated && !finalResults.some((r) => r.questionId === currentQuestion.id)) {
        const finalEval = evaluateQuestion(currentQuestion, userAnswers);
        finalResults.push({
          questionId: currentQuestion.id,
          question: currentQuestion,
          userAnswers,
          isFullyCorrect: finalEval.isFullyCorrect,
          scorePercentage: finalEval.scorePercentage,
        });
      }
      onFinishSession(finalResults);
    } else {
      onExit();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg sticky top-20 z-30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 truncate max-w-[180px] sm:max-w-[260px]">
              {currentQuestion.topicName}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
              <Timer className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              aria-label={currentQuestion.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`p-2 rounded-lg border transition ${
                currentQuestion.bookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${currentQuestion.bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleExitClick}
              aria-label="Quitter la session"
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 hover:bg-slate-750 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>
              Question <strong className="text-white">{currentIndex + 1}</strong> sur{' '}
              <strong className="text-white">{questions.length}</strong>
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        {/* Question Header & Stem */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-400">
              QCM {currentQuestion.questionNumber ? `#${currentQuestion.questionNumber}` : `#${currentIndex + 1}`}
            </span>
            <button
              onClick={() => setIsBinaryMode(!isBinaryMode)}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition"
            >
              Affichage : {isBinaryMode ? 'Mode Vrai/Faux direct' : 'Mode Cases à cocher'}
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {currentQuestion.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isBinaryMode
              ? 'Indiquez pour chaque proposition si elle est Vraie ou Fausse :'
              : 'Cochez toutes les propositions que vous considérez VRAIES :'}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
            const isUserChecked = !!userAnswers[option.id];
            const isCorrect = option.isCorrect;

            // Evaluation state in study mode after validation
            let optionStyle = 'bg-slate-800/40 border-slate-750 hover:bg-slate-800/70 text-slate-200';
            let badgeNode = null;

            if (hasValidated && mode === 'study') {
              const matched = isUserChecked === isCorrect;
              if (matched) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-950/40 border-emerald-500/70 text-emerald-100 ring-1 ring-emerald-500/30';
                  badgeNode = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-xs shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      VRAI (Exact)
                    </span>
                  );
                } else {
                  optionStyle = 'bg-slate-900 border-slate-700/80 text-slate-300';
                  badgeNode = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium text-xs shrink-0">
                      FAUX (Exact)
                    </span>
                  );
                }
              } else {
                // User was wrong on this proposition
                if (isCorrect && !isUserChecked) {
                  // True option but user didn't check it (omission)
                  optionStyle = 'bg-amber-950/30 border-amber-600/70 text-amber-200 ring-1 ring-amber-500/30';
                  badgeNode = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-xs shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ÉTAIT VRAI (Oubli)
                    </span>
                  );
                } else {
                  // False option but user checked it (false positive)
                  optionStyle = 'bg-rose-950/40 border-rose-600/80 text-rose-200 ring-1 ring-rose-500/30';
                  badgeNode = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-semibold text-xs shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      ÉTAIT FAUX (Erreur)
                    </span>
                  );
                }
              }
            } else if (isUserChecked) {
              optionStyle = 'bg-teal-950/40 border-teal-500/70 text-teal-100 shadow-xs shadow-teal-950';
            }

            return (
              <div
                key={option.id}
                onClick={() => !isBinaryMode && toggleOption(option.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${optionStyle}`}
              >
                {/* Proposition Letter Badge */}
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs shrink-0 transition-colors ${
                    isUserChecked
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700/80 text-slate-300'
                  }`}
                >
                  {letter}
                </div>

                {/* Proposition Text */}
                <div className="flex-1 text-sm sm:text-base leading-snug pt-0.5">
                  <span className="break-words">{option.text}</span>
                </div>

                {/* Right side controls: Checkbox or Binary toggle or Result badge */}
                {badgeNode ? (
                  badgeNode
                ) : isBinaryMode ? (
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOptionExplicit(option.id, true)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                        isUserChecked
                          ? 'bg-teal-600 text-white border-teal-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Vrai
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptionExplicit(option.id, false)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                        !isUserChecked
                          ? 'bg-slate-700 text-white border-slate-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Faux
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isUserChecked
                        ? 'bg-teal-500 border-teal-400 text-slate-950'
                        : 'border-slate-600 bg-slate-800/60'
                    }`}
                  >
                    {isUserChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Validation Feedback & Explanation (Study Mode) */}
        {hasValidated && mode === 'study' && (
          <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in">
            {/* Outcome Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 mb-4 ${
                currentEval.isFullyCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-600/50 text-rose-200'
              }`}
            >
              {currentEval.isFullyCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">
                    {currentEval.isFullyCorrect
                      ? 'Parfait ! Question 100% Validée'
                      : 'Réponse Incomplète ou Erronée'}
                  </h4>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-black/30">
                    {currentEval.correctAnswersCount} / {currentEval.totalOptionsCount} exactes ({currentEval.scorePercentage}%)
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  {currentEval.isFullyCorrect
                    ? 'Toutes les propositions vraies et fausses ont été correctement identifiées.'
                    : 'Consultez le détail des propositions et l’explication ci-dessous pour mémoriser la règle.'}
                </p>
              </div>
            </div>

            {/* Explanation Section */}
            {currentQuestion.explanation && (
              <div className="bg-slate-950/70 border border-teal-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />
                <div className="flex items-center gap-2 mb-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>Explication &amp; Rappel Clinique</span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed pl-1 whitespace-pre-line font-normal">
                  {currentQuestion.explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            {mode === 'study' && !hasValidated
              ? 'Raccourci : 1 à 5 pour cocher, Entrée pour valider'
              : 'Raccourci : Entrée pour passer au suivant'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {mode === 'study' && !hasValidated ? (
              <button
                onClick={handleValidate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md shadow-teal-950/60 transition active:scale-95"
              >
                <span>Valider ma réponse</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-950/60 transition active:scale-95"
              >
                <span>{isLast ? 'Voir les Résultats' : 'Question Suivante'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
