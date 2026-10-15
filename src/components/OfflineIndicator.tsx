import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
        isOnline
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
          : 'bg-amber-950/80 text-amber-300 border-amber-700/80 shadow-lg shadow-amber-950/40 animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Connecté (Prêt hors-ligne)</span>
          <span className="sm:hidden">En ligne</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Mode 100% Hors-ligne</span>
        </>
      )}
    </div>
  );
};
