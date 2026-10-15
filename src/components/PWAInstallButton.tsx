import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, HelpCircle, CheckCircle2, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-800/60 text-xs font-medium text-teal-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline">Installé (App Native)</span>
        <span className="sm:hidden">Installé</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          aria-label="Installer l'application sur votre smartphone Android"
          className={`inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-lg shadow-md shadow-teal-900/40 transition active:scale-95 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
          }`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Installer l'App</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Guide installation sur iPhone"
          className={`inline-flex items-center gap-1.5 font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4 text-slate-400" />
          <span>Installer (iOS)</span>
        </button>
      ) : (
        <button
          onClick={() => setShowAndroidGuide(true)}
          aria-label="Comment installer sur smartphone Android"
          className={`inline-flex items-center gap-1.5 font-medium text-teal-300 bg-teal-950/50 hover:bg-teal-900/60 border border-teal-800/60 rounded-lg transition shrink-0 ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
          <span className="hidden sm:inline">Installer sur Téléphone</span>
          <span className="sm:inline hidden md:hidden">Installer</span>
          <span className="inline sm:hidden">Installer</span>
        </button>
      )}

      {/* Android Installation Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Installer sur Android</h3>
                  <p className="text-xs text-slate-400">Fonctionne 100% hors-ligne comme une vraie APK</p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Ouvrez cette URL dans <strong>Google Chrome</strong> ou <strong>Brave</strong> sur votre smartphone.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Appuyez sur le menu <strong className="text-white">⋮ (trois points)</strong> en haut à droite du navigateur.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Sélectionnez <strong className="text-teal-400">"Installer l'application"</strong> ou <strong className="text-teal-400">"Ajouter à l'écran d'accueil"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
                ✓ L'icône MedMCQ apparaîtra sur votre écran d'accueil. Vous pourrez réviser partout sans aucune connexion Internet !
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-750 py-2.5 text-sm font-semibold text-white transition border border-slate-700"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* iOS Installation Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Installer sur iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>1. Dans Safari, appuyez sur le bouton <strong>Partager</strong> (icône avec une flèche vers le haut).</p>
              <p>2. Faites défiler et appuyez sur <strong>Sur l'écran d'accueil</strong>.</p>
              <p>3. Appuyez sur <strong>Ajouter</strong> en haut à droite.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 hover:bg-teal-500 py-2.5 text-sm font-semibold text-white transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
