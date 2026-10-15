import React from 'react';
import { X, Check, AlertTriangle, Smartphone, Bot, Zap, WifiOff, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramComparisonModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl text-white shadow-md shadow-teal-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Pourquoi cette App PWA plutôt qu'un Bot Telegram ?</h2>
              <p className="text-xs text-slate-400">Analyse comparative pour votre usage médical sur smartphone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Vous avez hésité entre cette application locale et un bot Telegram pour smartphone Android. Voici pourquoi l'approche <strong className="text-teal-400">Progressive Web App (PWA)</strong> est la solution idéale pour votre besoin :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* PWA Card */}
            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-600/40 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-teal-300">Cette App (PWA Locale)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold uppercase tracking-wider ml-auto">Recommandé</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Hors-ligne :</strong> Révision dans le métro, à l'hôpital ou sans réseau 4G.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Comme une vraie APK Android :</strong> S'installe en 1 clic sur l'écran d'accueil sans ouvrir de fichier HTML manuel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Interface QCM tactile &amp; fluide :</strong> Cases à cocher interactives, validation colorée (Vert/Rouge) et affichage immédiat de l'explication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Import Markdown direct :</strong> Glissez ou collez vos fichiers markdown instantanément sans serveur ni base de données distante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zéro coût d'hébergement :</strong> Pas besoin d'un serveur VPS actif 24h/24 pour faire tourner un bot.</span>
                </li>
              </ul>
            </div>

            {/* Telegram Bot Card */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-slate-300">Bot Telegram</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Impossible hors-ligne :</strong> Telegram nécessite une connexion Internet permanente (API Telegram Cloud).</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Nécessite un serveur allumé :</strong> Vous devez coder un script Python/Node et payer un serveur hébergé 24h/24.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Boutons de chat rigides :</strong> Difficile de cocher 5 propositions simultanément avant de valider.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Gestion des erreurs fastidieuse :</strong> Pas de statistiques visuelles, barres de progression ou filtres par questions ratées.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Conclusion :</strong> Grâce au Service Worker et au manifest PWA inclus, cette application résout exactement votre problème de fichier HTML : installez-la via le bouton <em>"Installer sur Téléphone"</em>, et elle se lancera en plein écran depuis votre écran d'accueil Android, même en mode avion !
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white shadow-md transition"
          >
            J'ai compris, commençons !
          </button>
        </div>
      </div>
    </div>
  );
};
