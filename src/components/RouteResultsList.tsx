import React from 'react';
import {
  Clock,
  DollarSign,
  Footprints,
  Shuffle,
  Zap,
  Leaf,
  ChevronRight,
  Accessibility,
  ArrowRight
} from 'lucide-react';
import { TransitRoute, TransitMode } from '../types';
import { formatDistance, formatDuration } from '../utils/routingEngine';

interface RouteResultsListProps {
  routes: TransitRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (route: TransitRoute) => void;
  currencySymbol: string;
}

export const RouteResultsList: React.FC<RouteResultsListProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  currencySymbol,
}) => {
  if (routes.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <p className="text-sm">Nenhuma rota encontrada para os parâmetros informados.</p>
      </div>
    );
  }

  const getTagBadgeClass = (tag: TransitRoute['tag']) => {
    switch (tag) {
      case 'Mais Rápida':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Mais Barata':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Menos Baldeações':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Mais Acessível':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {routes.length} Opções de Trajeto Encontradas
        </span>
        <span className="text-[11px] text-slate-500">Ordenado por relevância</span>
      </div>

      <div className="space-y-2.5">
        {routes.map((route, idx) => {
          const isSelected = selectedRouteId === route.id;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`group relative rounded-2xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header with Title and Tags */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTagBadgeClass(
                      route.tag
                    )}`}
                  >
                    {route.tag}
                  </span>
                  {route.isFullyAccessible && (
                    <span className="p-1 rounded bg-slate-800 text-cyan-400" title="100% Acessível para PCD">
                      <Accessibility className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    Saindo em {route.nextDepartureMinutes} min
                  </span>
                </div>
              </div>

              {/* Main Numbers (Duration, Times, Fare) */}
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <div>
                  <div className="text-2xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
                    <span>{formatDuration(route.totalDurationMinutes)}</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({route.departureTime} → {route.arrivalTime})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-emerald-400">
                    {currencySymbol} {route.totalFare.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {route.transfersCount > 0 ? 'Tarifa Integrada' : 'Tarifa Única'}
                  </div>
                </div>
              </div>

              {/* Transit Modes Chain Pill */}
              <div className="flex items-center gap-1.5 flex-wrap py-1.5 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3">
                {route.summaryModes.map((item, mIdx) => (
                  <React.Fragment key={mIdx}>
                    <span
                      style={{
                        backgroundColor: item.color ? `${item.color}25` : 'rgba(100,116,139,0.2)',
                        borderColor: item.color || '#64748b',
                        color: item.color || '#e2e8f0',
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border"
                    >
                      {item.name}
                    </span>
                    {mIdx < route.summaryModes.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Secondary Stats Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="Baldeações">
                    <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                    {route.transfersCount === 0 ? 'Direto' : `${route.transfersCount} baldeação`}
                  </span>
                  <span className="flex items-center gap-1" title="Caminhada">
                    <Footprints className="w-3.5 h-3.5 text-slate-500" />
                    {formatDistance(route.totalWalkingDistanceMeters)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                    <Leaf className="w-3 h-3" />
                    -{route.co2SavedKg}kg CO₂
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
