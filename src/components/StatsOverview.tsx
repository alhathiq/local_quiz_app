import React from 'react';
import type { MCQQuestion } from '../types';
import { CheckCircle, AlertCircle, Bookmark, Play, RefreshCw, Flame, Award } from 'lucide-react';

interface Props {
  questions: MCQQuestion[];
  onStartAll: () => void;
  onStartMissed: () => void;
  onStartBookmarked: () => void;
  onResetProgress: () => void;
}

export const StatsOverview: React.FC<Props> = ({
  questions,
  onStartAll,
  onStartMissed,
  onStartBookmarked,
  onResetProgress,
}) => {
  const total = questions.length;
  const attempted = questions.filter((q) => !!q.lastAttempt);
  const completedCount = attempted.length;
  const fullyCorrectCount = attempted.filter((q) => q.lastAttempt?.isFullyCorrect).length;
  const missedCount = attempted.filter((q) => q.lastAttempt && !q.lastAttempt.isFullyCorrect).length;
  const bookmarkedCount = questions.filter((q) => q.bookmarked).length;

  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const accuracyPercentage = completedCount > 0 ? Math.round((fullyCorrectCount / completedCount) * 100) : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Tableau de Bord &amp; Progression
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Toutes vos données sont sauvegardées en local sur cet appareil (100% hors-ligne)
          </p>
        </div>

        {completedCount > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment réinitialiser l’historique de vos réponses ?')) {
                onResetProgress();
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-950/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser les scores</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Completed */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions faites</span>
            <CheckCircle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{completedCount}</span>
            <span className="text-xs text-slate-400">/ {total}</span>
          </div>
          <div className="mt-2 w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taux de réussite</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${completedCount === 0 ? 'text-slate-500' : accuracyPercentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {completedCount === 0 ? '-' : `${accuracyPercentage}%`}
            </span>
            <span className="text-xs text-slate-400">({fullyCorrectCount} exactes)</span>
          </div>
          <div className="mt-2 w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${accuracyPercentage}%` }}
            />
          </div>
        </div>

        {/* Missed / Needs review */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions ratées</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${missedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {missedCount}
            </span>
            <span className="text-xs text-slate-400">à revoir</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {missedCount > 0 ? 'À retravailler en priorité' : 'Aucune erreur restante'}
          </p>
        </div>

        {/* Bookmarked */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Favoris</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-300">{bookmarkedCount}</span>
            <span className="text-xs text-slate-400">marquées</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Questions ciblées</p>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={onStartAll}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-950/60 transition active:scale-98"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Lancer Tout ({total})</span>
        </button>

        {missedCount > 0 && (
          <button
            onClick={onStartMissed}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-950/60 transition active:scale-98"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Revoir les Ratées ({missedCount})</span>
          </button>
        )}

        {bookmarkedCount > 0 && (
          <button
            onClick={onStartBookmarked}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-950/60 transition active:scale-98"
          >
            <Bookmark className="w-4 h-4" />
            <span>Réviser les Favoris ({bookmarkedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
