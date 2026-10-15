import React, { useState } from 'react';
import type { MCQQuestion } from '../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface Props {
  results: {
    questionId: string;
    question: MCQQuestion;
    userAnswers: Record<string, boolean>;
    isFullyCorrect: boolean;
    scorePercentage: number;
  }[];
  onRestartAll: () => void;
  onRestartMissed: () => void;
  onBackToTopics: () => void;
  onToggleBookmark: (questionId: string) => void;
}

export const SessionSummary: React.FC<Props> = ({
  results,
  onRestartAll,
  onRestartMissed,
  onBackToTopics,
  onToggleBookmark,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = results.length;
  const fullyCorrect = results.filter((r) => r.isFullyCorrect).length;
  const missedCount = total - fullyCorrect;
  const accuracyPct = total > 0 ? Math.round((fullyCorrect / total) * 100) : 0;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in">
      {/* Score Hero Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex p-3 rounded-2xl bg-teal-500/20 text-teal-400 mb-4 border border-teal-500/30">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Session Terminée !
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Voici le bilan détaillé de vos réponses
        </p>

        {/* Score Dial / Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 my-6">
          <div className="text-center">
            <span className="block text-3xl sm:text-4xl font-black text-teal-400">
              {accuracyPct}%
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Taux de Réussite
            </span>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="text-center">
            <span className="block text-3xl sm:text-4xl font-black text-white">
              {fullyCorrect} <span className="text-lg text-slate-500 font-normal">/ {total}</span>
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              QCM Validés
            </span>
          </div>

          {missedCount > 0 && (
            <>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="block text-3xl sm:text-4xl font-black text-rose-400">
                  {missedCount}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  À Revoir
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {missedCount > 0 && (
            <button
              onClick={onRestartMissed}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/60 transition active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Revoir les {missedCount} ratées</span>
            </button>
          )}

          <button
            onClick={onRestartAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-950/60 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refaire la session</span>
          </button>

          <button
            onClick={onBackToTopics}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux thèmes</span>
          </button>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white px-1">
          Détail des questions de la session
        </h3>

        {results.map((res, idx) => {
          const isExpanded = expandedId === res.questionId;
          const q = res.question;

          return (
            <div
              key={res.questionId}
              className={`rounded-2xl border transition-all overflow-hidden ${
                res.isFullyCorrect
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-rose-950/15 border-rose-900/40'
              }`}
            >
              <div
                onClick={() => toggleExpand(res.questionId)}
                className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {res.isFullyCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        QCM {idx + 1} • {q.topicName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 font-bold rounded-sm ${
                          res.isFullyCorrect
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {res.isFullyCorrect ? 'Exact (100%)' : `${res.scorePercentage}% exact`}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(q.id);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      q.bookmarked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'text-slate-500 hover:text-slate-300 border-transparent'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${q.bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const userChecked = !!res.userAnswers[opt.id];
                      const matched = userChecked === opt.isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                            matched
                              ? opt.isCorrect
                                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                              : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                          }`}
                        >
                          <span className="font-bold shrink-0">{letter}.</span>
                          <span className="flex-1">{opt.text}</span>
                          <span className="font-bold shrink-0">
                            [{opt.isCorrect ? 'VRAI' : 'FAUX'}]
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-teal-900/40 text-xs text-slate-300">
                      <strong className="text-teal-400 block mb-1">Explication :</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
