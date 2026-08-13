import React from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Train,
  Bus,
  RefreshCw,
  Info
} from 'lucide-react';
import { CityTransitData, LineAlert, TransitLine } from '../types';

interface NetworkStatusModalProps {
  city: CityTransitData;
  alerts: LineAlert[];
  onClose: () => void;
}

export const NetworkStatusModal: React.FC<NetworkStatusModalProps> = ({
  city,
  alerts,
  onClose,
}) => {
  const getStatusBadge = (status: TransitLine['status']) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Operação Normal
          </span>
        );
      case 'reduced_speed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Velocidade Reduzida
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            Manutenção Programada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            Paralisação
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Status da Rede em Tempo Real</h3>
              <p className="text-xs text-slate-400">
                Monitoramento operacional do transporte público de {city.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Active Disruptions Section */}
          {alerts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Avisos e Ocorrências Ativas ({alerts.length})
              </h4>
              <div className="space-y-2.5">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>{alert.lineName}</span>
                      <span className="text-[11px] font-normal text-amber-400/80">{alert.updatedAt}</span>
                    </div>
                    <div className="font-semibold text-white">{alert.title}</div>
                    <p className="text-slate-300 leading-relaxed">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Lines Status Board */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Train className="w-4 h-4 text-cyan-400" />
              Linhas e Conexões de {city.name}
            </h4>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
              {city.lines.map((line) => (
                <div key={line.id} className="p-3.5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{ backgroundColor: line.color, color: line.textColor }}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm"
                      >
                        {line.shortName}
                      </span>
                      <span className="font-bold text-sm text-white">{line.name}</span>
                    </div>

                    <div>{getStatusBadge(line.status)}</div>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Operador: <strong className="text-slate-300">{line.operator}</strong>
                    </span>
                    <span>
                      Intervalo pico: <strong className="text-slate-300">~{line.frequencyPeakMin} min</strong>
                    </span>
                    <span>
                      Tarifa: <strong className="text-slate-300">{city.currencySymbol} {line.fare.toFixed(2)}</strong>
                    </span>
                  </div>

                  {line.statusDetails && (
                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      ℹ️ {line.statusDetails}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Atualizado a cada 60 segundos</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
