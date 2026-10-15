import React, { useState, useEffect } from 'react';
import type { MCQQuestion, MCQTopic, QuizMode, QuizSessionConfig } from '../types';
import { Layers, CheckSquare, Square, Play, Shuffle, Sparkles, Filter, AlertCircle, BookCheck } from 'lucide-react';

interface Props {
  topics: MCQTopic[];
  questions: MCQQuestion[];
  onStartSession: (config: QuizSessionConfig) => void;
}

export const TopicSelector: React.FC<Props> = ({ topics, questions, onStartSession }) => {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [mode, setMode] = useState<QuizMode>('study');
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'missed' | 'bookmarked'>('all');
  const [shuffle, setShuffle] = useState(true);
  const [questionLimit, setQuestionLimit] = useState<number | undefined>(undefined);

  // Sync selected topics on mount or when topics change
  useEffect(() => {
    if (topics.length > 0 && selectedTopicIds.length === 0) {
      setSelectedTopicIds(topics.map((t) => t.id));
    }
  }, [topics]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const selectSingleTopic = (topicId: string) => {
    setSelectedTopicIds([topicId]);
  };

  const selectAllTopics = () => {
    setSelectedTopicIds(topics.map((t) => t.id));
  };

  const clearTopics = () => {
    setSelectedTopicIds([]);
  };

  // Compute matched question count based on selected topics + filter
  const matchingQuestions = questions.filter((q) => {
    if (!selectedTopicIds.includes(q.topicId)) return false;
    if (filter === 'unanswered') return !q.lastAttempt;
    if (filter === 'missed') return q.lastAttempt && !q.lastAttempt.isFullyCorrect;
    if (filter === 'bookmarked') return !!q.bookmarked;
    return true;
  });

  const effectiveQuestionCount = questionLimit
    ? Math.min(questionLimit, matchingQuestions.length)
    : matchingQuestions.length;

  const handleLaunch = () => {
    if (effectiveQuestionCount === 0) return;
    onStartSession({
      mode,
      topicIds: selectedTopicIds,
      filter,
      shuffle,
      questionLimit,
    });
  };

  return (
    <div className="space-y-6">
      {/* Session Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Créer une Session Personnalisée
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sélectionnez un ou plusieurs thèmes pour réviser à votre rythme
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllTopics}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Tout cocher
            </button>
            <button
              onClick={clearTopics}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium transition"
            >
              Tout décocher
            </button>
          </div>
        </div>

        {/* Top Instant Launch Bar - ZERO SCROLL NEEDED */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/50 shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
            <span className="text-slate-200">
              <strong className="text-teal-300 font-bold">{effectiveQuestionCount} QCM</strong> prêts sur{' '}
              <strong className="text-white">{selectedTopicIds.length}</strong> thème{selectedTopicIds.length > 1 ? 's' : ''} ({mode === 'study' ? 'Mode Étude' : 'Mode Examen'})
            </span>
          </div>

          <button
            onClick={handleLaunch}
            disabled={effectiveQuestionCount === 0}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-md shrink-0 ${
              effectiveQuestionCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-950/60 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Démarrer ({effectiveQuestionCount} QCM)</span>
          </button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-5">
          {topics.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            const topicQuestions = questions.filter((q) => q.topicId === topic.id);
            const completed = topicQuestions.filter((q) => !!q.lastAttempt).length;
            const missed = topicQuestions.filter((q) => q.lastAttempt && !q.lastAttempt.isFullyCorrect).length;
            const pct = topicQuestions.length > 0 ? Math.round((completed / topicQuestions.length) * 100) : 0;

            return (
              <div
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-950/30 border-teal-500/50 shadow-md shadow-teal-950/30'
                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-white leading-tight">
                      {topic.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopic(topic.id);
                      }}
                      className="text-teal-400 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 fill-teal-500 text-slate-950" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      {topicQuestions.length} QCM
                    </span>
                    {missed > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {missed} ratée{missed > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progression</span>
                    <span>{pct}% ({completed}/{topicQuestions.length})</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartSession({
                          mode,
                          topicIds: [topic.id],
                          filter,
                          shuffle,
                          questionLimit,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Lancer ({topicQuestions.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectSingleTopic(topic.id);
                      }}
                      className="text-[11px] text-slate-400 hover:text-teal-300 transition"
                    >
                      Sélectionner
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Options & Filters */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mode d'apprentissage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('study')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition text-center ${
                    mode === 'study'
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Mode Étude
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Correction immédiate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('exam')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition text-center ${
                    mode === 'exam'
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Mode Examen
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Bilan en fin de session</span>
                </button>
              </div>
            </div>

            {/* Filter selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Filtre de questions
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
              >
                <option value="all">Toutes les questions des thèmes</option>
                <option value="unanswered">Seulement les non encore faites</option>
                <option value="missed">Seulement les questions ratées</option>
                <option value="bookmarked">Seulement mes favoris</option>
              </select>
            </div>

            {/* Limit and Shuffle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Options de tirage
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShuffle(!shuffle)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    shuffle
                      ? 'bg-teal-950/60 text-teal-300 border-teal-600/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Mélanger</span>
                </button>

                <select
                  value={questionLimit || ''}
                  onChange={(e) => setQuestionLimit(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 flex-1"
                >
                  <option value="">Toutes ({matchingQuestions.length})</option>
                  <option value="5">Max 5 QCM</option>
                  <option value="10">Max 10 QCM</option>
                  <option value="20">Max 20 QCM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {selectedTopicIds.length === 0 ? (
              <span className="text-amber-400">Veuillez sélectionner au moins un thème</span>
            ) : matchingQuestions.length === 0 ? (
              <span className="text-amber-400">Aucun QCM ne correspond à ce filtre</span>
            ) : (
              <span>
                Prêt pour <strong className="text-white">{effectiveQuestionCount}</strong> QCM sur{' '}
                <strong className="text-teal-300">{selectedTopicIds.length}</strong> thème{selectedTopicIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            onClick={handleLaunch}
            disabled={effectiveQuestionCount === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition shadow-lg ${
              effectiveQuestionCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-900/40 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Démarrer la Session ({effectiveQuestionCount} QCM)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
