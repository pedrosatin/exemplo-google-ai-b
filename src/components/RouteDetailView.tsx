import React, { useState } from 'react';
import {
  Clock,
  Footprints,
  Train,
  Bus,
  ArrowRight,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  Play,
  Sparkles,
  Info,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  TrendingDown
} from 'lucide-react';
import { TransitRoute, RouteLeg, CityTransitData } from '../types';
import { formatDistance, formatDuration } from '../utils/routingEngine';

interface RouteDetailViewProps {
  route: TransitRoute;
  city: CityTransitData;
  onHighlightLeg: (leg: RouteLeg | null) => void;
  highlightedLegId: string | null;
  onStartSimulation: () => void;
  onSaveRoute: (route: TransitRoute) => void;
  onAskAi: (route: TransitRoute) => void;
  isSaved: boolean;
}

export const RouteDetailView: React.FC<RouteDetailViewProps> = ({
  route,
  city,
  onHighlightLeg,
  highlightedLegId,
  onStartSimulation,
  onSaveRoute,
  onAskAi,
  isSaved,
}) => {
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleStops = (legId: string) => {
    setExpandedStops((prev) => ({
      ...prev,
      [legId]: !prev[legId],
    }));
  };

  const handleShare = () => {
    const text = `🚇 Rota: ${route.title} (${formatDuration(route.totalDurationMinutes)})\nPartida: ${route.departureTime} | Chegada: ${route.arrivalTime}\nTarifa: ${city.currencySymbol} ${route.totalFare.toFixed(2)}\nCalculado via ViaTrânsito`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Estimated taxi / ride-hailing cost comparison
  const estimatedUberFare = Math.max(16, Math.round((route.totalDistanceMeters / 1000) * 3.2 + 8));
  const estimatedSavings = Math.max(0, estimatedUberFare - route.totalFare);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Route Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-extrabold text-white">{route.title}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {route.tag}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Duração total: <span className="text-white font-bold">{formatDuration(route.totalDurationMinutes)}</span> • Partida às{' '}
            <span className="text-white font-bold">{route.departureTime}</span> • Chegada às{' '}
            <span className="text-white font-bold">{route.arrivalTime}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartSimulation}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Navegar / Simular</span>
          </button>

          <button
            onClick={() => onSaveRoute(route)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isSaved ? 'Rota Salva nos Favoritos' : 'Salvar nos Favoritos'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all relative"
            title="Copiar Resumo do Itinerário"
          >
            <Share2 className="w-4 h-4" />
            {copiedNotification && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                Copiado!
              </span>
            )}
          </button>

          <button
            onClick={() => onAskAi(route)}
            className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 transition-all"
            title="Dicas de Viagem com IA"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Itinerary Breakdown */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Itinerário Passo a Passo
        </h4>

        <div className="space-y-0 relative">
          {route.legs.map((leg, idx) => {
            const isHighlighted = highlightedLegId === leg.id;
            const isWalking = leg.mode === 'walk';
            const isLast = idx === route.legs.length - 1;
            const isStopsExpanded = expandedStops[leg.id] || false;

            return (
              <div
                key={leg.id}
                onMouseEnter={() => onHighlightLeg(leg)}
                onMouseLeave={() => onHighlightLeg(null)}
                className={`relative flex gap-4 p-3 rounded-xl transition-all cursor-pointer ${
                  isHighlighted ? 'bg-slate-800/80 shadow-md ring-1 ring-cyan-500/40' : 'hover:bg-slate-850/50'
                }`}
              >
                {/* Timeline Column with Line Color */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    style={{
                      backgroundColor: isWalking ? '#475569' : leg.lineColor || '#06b6d4',
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold"
                  >
                    {isWalking ? <Footprints className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        backgroundColor: isWalking ? '#334155' : leg.lineColor || '#06b6d4',
                        borderStyle: isWalking ? 'dashed' : 'solid',
                      }}
                      className="w-0.5 flex-1 min-h-[48px] my-1 opacity-70"
                    />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-bold text-sm text-white">{leg.instruction}</div>
                    <div className="text-xs font-semibold text-slate-400 shrink-0">
                      {leg.durationMinutes} min ({formatDistance(leg.distanceMeters)})
                    </div>
                  </div>

                  {/* Transit Specific Details (Headsign, Platform, Carriage Tip) */}
                  {!isWalking && (
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {leg.headsign && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                            🧭 {leg.headsign}
                          </span>
                        )}
                        {leg.platform && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                            🚉 {leg.platform}
                          </span>
                        )}
                        {leg.occupancy && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-300 font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" /> Lotação Normal
                          </span>
                        )}
                      </div>

                      {/* Intermediate Stops Dropdown */}
                      {leg.intermediateStops && leg.intermediateStops.length > 0 && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStops(leg.id);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1 py-1"
                          >
                            <span>
                              {isStopsExpanded
                                ? 'Ocultar paradas intermediárias'
                                : `Ver ${leg.intermediateStops.length} paradas no trajeto`}
                            </span>
                            {isStopsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isStopsExpanded && (
                            <div className="mt-2 ml-2 pl-3 border-l-2 border-slate-700 space-y-1.5 py-1 text-slate-300">
                              {leg.intermediateStops.map((st, sIdx) => (
                                <div key={st.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    <span>{st.name}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    +{Math.round(sIdx * 1.8 + 2)} min
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Smart Carriage Advice Box */}
                      {leg.carriageTip && (
                        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-xs flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                          <span>
                            <strong>Dica de Embarque:</strong> {leg.carriageTip}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial & Environmental Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Fare & Savings Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tarifa & Economia
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {city.cardName}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-slate-300 text-xs">Valor do transporte público:</span>
            <span className="text-xl font-extrabold text-white">
              {city.currencySymbol} {route.totalFare.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Economia estimada vs Carro:
            </span>
            <span>+{city.currencySymbol} {estimatedSavings.toFixed(2)}</span>
          </div>
        </div>

        {/* Sustainability & Health Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Impacto Ecológico
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Mobilidade Limpa</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-base font-bold text-emerald-400">-{route.co2SavedKg} kg</div>
              <div className="text-[10px] text-slate-400">Emissões CO₂ evitadas</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-base font-bold text-cyan-400">{route.caloriesBurned} kcal</div>
              <div className="text-[10px] text-slate-400">Calorias na caminhada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
