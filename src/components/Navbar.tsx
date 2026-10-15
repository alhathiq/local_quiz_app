import React from 'react';
import { BookOpen, Layers, Database, ArrowUpDown, HelpCircle, BarChart3 } from 'lucide-react';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'topics' | 'bank' | 'import-export' | 'progress';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenComparison: () => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenComparison }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('topics')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-900/40 p-1.5">
              <BookOpen className="w-full h-full text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                MedMCQ <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-teal-500/20 text-teal-400 border border-teal-500/30">Offline</span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">QCM Médicaux Hors-Ligne</p>
            </div>
          </div>

          {/* Right Header items: Indicators & Install */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <OfflineIndicator />
            <button
              onClick={onOpenComparison}
              aria-label="PWA vs Bot Telegram"
              title="Pourquoi une PWA plutôt qu'un Bot Telegram ?"
              className="inline-flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">PWA vs Bot Telegram</span>
            </button>
            <PWAInstallButton compact />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Navigation principale" className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 border-t border-slate-800/60 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thèmes &amp; Révision</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'bank'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banque de QCM</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Progression</span>
          </button>

          <button
            onClick={() => setActiveTab('import-export')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'import-export'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Importer Markdown</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
