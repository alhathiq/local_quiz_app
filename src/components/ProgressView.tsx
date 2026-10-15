import React from 'react';
import type { MCQQuestion, MCQTopic, SessionResult } from '../types';
import {
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

interface Props {
  questions: MCQQuestion[];
  topics: MCQTopic[];
  sessionHistory: SessionResult[];
  onStartReviewMissed: () => void;
  onSelectTopic: (topicId: string) => void;
}

export const ProgressView: React.FC<Props> = ({
  questions,
  topics,
  sessionHistory,
  onStartReviewMissed,
  onSelectTopic,
}) => {
  const total = questions.length;
  const attempted = questions.filter((q) => !!q.lastAttempt);
  const fullyCorrect = attempted.filter((q) => q.lastAttempt?.isFullyCorrect).length;
  const missedQuestions = attempted.filter((q) => q.lastAttempt && !q.lastAttempt.isFullyCorrect);

  const accuracyPct = attempted.length > 0 ? Math.round((fullyCorrect / attempted.length) * 100) : 0;
  const globalCompletion = total > 0 ? Math.round((attempted.length / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Complétion Globale</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">{globalCompletion}%</div>
          <p className="text-xs text-slate-400 mt-1">
            {attempted.length} sur {total} QCM répondus
          </p>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${globalCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Précision Moyenne</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {attempted.length === 0 ? '-' : `${accuracyPct}%`}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {fullyCorrect} questions sans aucune faute
          </p>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${accuracyPct}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Questions à Corriger</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{missedQuestions.length}</div>
          <p className="text-xs text-slate-400 mt-1">
            {missedQuestions.length > 0 ? 'Erreurs à retravailler' : 'Aucune erreur en attente'}
          </p>
          {missedQuestions.length > 0 && (
            <button
              onClick={onStartReviewMissed}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white font-semibold underline"
            >
              <span>Lancer le rattrapage maintenant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Topics Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-teal-400" />
          Détail par Thématique Médicale
        </h3>

        <div className="space-y-4">
          {topics.map((topic) => {
            const topicQuestions = questions.filter((q) => q.topicId === topic.id);
            const topicAttempted = topicQuestions.filter((q) => !!q.lastAttempt);
            const topicCorrect = topicAttempted.filter((q) => q.lastAttempt?.isFullyCorrect).length;
            const topicMissed = topicAttempted.filter((q) => q.lastAttempt && !q.lastAttempt.isFullyCorrect).length;
            const pct = topicQuestions.length > 0 ? Math.round((topicAttempted.length / topicQuestions.length) * 100) : 0;
            const accuracy = topicAttempted.length > 0 ? Math.round((topicCorrect / topicAttempted.length) * 100) : 0;

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/50 cursor-pointer transition select-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{topic.name}</span>
                    <span className="text-xs text-slate-400">({topicQuestions.length} QCM)</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {topicMissed > 0 && (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {topicMissed} ratée{topicMissed > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-emerald-400 font-semibold">
                      {topicAttempted.length > 0 ? `${accuracy}% réussite` : 'Non commencé'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-teal-400" />
            Historique des Récentes Sessions
          </h3>

          <div className="space-y-3">
            {sessionHistory.slice(0, 10).map((session, idx) => {
              const scorePct = session.totalQuestions > 0
                ? Math.round((session.fullyCorrectCount / session.totalQuestions) * 100)
                : 0;
              const dateStr = new Date(session.completedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block sm:inline">
                      {session.topicNames.join(', ') || 'Session Mixte'}
                    </span>
                    <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
                      • {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-300">
                      {session.fullyCorrectCount} / {session.totalQuestions} QCM
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-md ${
                        scorePct >= 70
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {scorePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
