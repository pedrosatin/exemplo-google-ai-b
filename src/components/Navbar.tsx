import React from 'react';
import { Train, MapPin, AlertCircle, Sparkles, Bookmark, Activity, Compass, Clock } from 'lucide-react';
import { CityTransitData, LineAlert } from '../types';
import { CITIES_DATA } from '../data/transitData';

interface NavbarProps {
  currentCity: CityTransitData;
  onSelectCity: (city: CityTransitData) => void;
  onOpenStatusModal: () => void;
  onOpenAiAdvisor: () => void;
  onOpenSavedRoutes: () => void;
  alerts: LineAlert[];
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onSelectCity,
  onOpenStatusModal,
  onOpenAiAdvisor,
  onOpenSavedRoutes,
  alerts,
  savedCount
}) => {
  const hasWarning = alerts.some(a => a.severity === 'warning' || a.severity === 'alert');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                ViaTrânsito
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Rotas Inteligentes
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Metrô, Trem, BRT & Ônibus em Tempo Real
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 transition-all text-xs sm:text-sm font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
            <select
              value={currentCity.id}
              onChange={(e) => {
                const selected = CITIES_DATA.find(c => c.id === e.target.value);
                if (selected) onSelectCity(selected);
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-4 font-semibold"
            >
              {CITIES_DATA.map((city) => (
                <option key={city.id} value={city.id} className="bg-slate-900 text-white">
                  {city.name} ({city.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Modal Trigger */}
          <button
            onClick={onOpenStatusModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
              hasWarning
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Status das Linhas e Operação"
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Status Linhas</span>
            <span className={`w-2 h-2 rounded-full ${hasWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium transition-all"
            title="Dicas de Rotas com Inteligência Artificial"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="hidden lg:inline">Assistente IA</span>
          </button>

          {/* Saved Routes Button */}
          <button
            onClick={onOpenSavedRoutes}
            className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-all"
            title="Rotas Salvas & Favoritos"
          >
            <Bookmark className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden md:inline">Salvas</span>
            {savedCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-cyan-600 rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Live Disruption Alert Ticker (if any alerts) */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-t border-amber-500/20 py-1.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px] border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Aviso
              </span>
            </div>
            <div className="truncate text-slate-300 font-medium">
              <span className="font-semibold text-amber-200">{alerts[0].lineName}:</span> {alerts[0].title} — {alerts[0].description}
            </div>
            <button
              onClick={onOpenStatusModal}
              className="text-cyan-400 hover:underline shrink-0 font-medium text-[11px]"
            >
              Ver todos ({alerts.length})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
