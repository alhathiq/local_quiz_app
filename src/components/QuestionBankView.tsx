import React, { useState, useMemo, useDeferredValue } from 'react';
import type { MCQQuestion, MCQTopic } from '../types';
import {
  Search,
  Filter,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  questions: MCQQuestion[];
  topics: MCQTopic[];
  onToggleBookmark: (questionId: string) => void;
  onTestSingleQuestion: (question: MCQQuestion) => void;
}

export const QuestionBankView: React.FC<Props> = ({
  questions,
  topics,
  onToggleBookmark,
  onTestSingleQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed' | 'unanswered' | 'bookmarked'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(searchQuery);

  const filteredQuestions = useMemo(() => {
    const qText = deferredQuery.trim().toLowerCase();

    return questions.filter((q) => {
      // Topic filter
      if (selectedTopicId !== 'all' && q.topicId !== selectedTopicId) return false;

      // Status filter
      if (statusFilter === 'completed' && !q.lastAttempt) return false;
      if (statusFilter === 'missed' && (!q.lastAttempt || q.lastAttempt.isFullyCorrect)) return false;
      if (statusFilter === 'unanswered' && !!q.lastAttempt) return false;
      if (statusFilter === 'bookmarked' && !q.bookmarked) return false;

      // Search query
      if (qText) {
        const inTitle = q.title.toLowerCase().includes(qText);
        const inTopic = q.topicName.toLowerCase().includes(qText);
        const inOptions = q.options.some((opt) => opt.text.toLowerCase().includes(qText));
        const inExpl = (q.explanation || '').toLowerCase().includes(qText);
        return inTitle || inTopic || inOptions || inExpl;
      }

      return true;
    });
  }, [questions, deferredQuery, selectedTopicId, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par mot-clé (ex: Pardee, ST+, Rifampicine...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Topic Dropdown */}
          <div className="min-w-[180px]">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">Tous les thèmes ({questions.length})</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.questionCount})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="missed">Questions ratées</option>
              <option value="completed">Questions faites</option>
              <option value="unanswered">Non faites</option>
              <option value="bookmarked">Mes favoris</option>
            </select>
          </div>
        </div>

        {/* Count result summary */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Affichage de <strong className="text-white">{filteredQuestions.length}</strong> QCM sur {questions.length}
          </span>
          {(searchQuery || selectedTopicId !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopicId('all');
                setStatusFilter('all');
              }}
              className="text-teal-400 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-sm font-medium">Aucun QCM ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const hasAttempt = !!q.lastAttempt;
            const isFullyCorrect = q.lastAttempt?.isFullyCorrect;

            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
              >
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {hasAttempt ? (
                        isFullyCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600 bg-slate-800" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                          {q.topicName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {q.options.length} propositions
                        </span>
                        {hasAttempt && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              isFullyCorrect
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {isFullyCorrect ? 'Validé (100%)' : `Dernier essai : ${q.lastAttempt?.scorePercentage}%`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {q.questionNumber ? `Q ${q.questionNumber} : ` : ''}
                        {q.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestSingleQuestion(q);
                      }}
                      title="S'entraîner sur ce QCM"
                      className="p-2 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(q.id);
                      }}
                      className={`p-2 rounded-xl border transition ${
                        q.bookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'text-slate-500 hover:text-slate-300 border-slate-800'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${q.bookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                    {/* Propositions */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Propositions &amp; Clé de correction :
                      </h4>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 border ${
                                opt.isCorrect
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="font-bold text-slate-400">{letter}.</span>
                              <span className="flex-1">{opt.text}</span>
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded-sm text-[10px] uppercase shrink-0 ${
                                  opt.isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {opt.isCorrect ? 'VRAI' : 'FAUX'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-800/40 text-xs text-slate-200">
                        <strong className="text-teal-400 block mb-1">Rappel &amp; Explication :</strong>
                        <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onTestSingleQuestion(q)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>S'auto-évaluer sur ce QCM</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
