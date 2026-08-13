import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Footprints,
  Train,
  CheckCircle2,
  FastForward,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TransitRoute, SimulationState } from '../types';
import { formatDistance, formatDuration } from '../utils/routingEngine';

interface TurnByTurnSimulatorProps {
  route: TransitRoute;
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onClose: () => void;
}

export const TurnByTurnSimulator: React.FC<TurnByTurnSimulatorProps> = ({
  route,
  simulationState,
  setSimulationState,
  onClose,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio chime when entering a new leg or arriving
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Main simulation timer loop
  useEffect(() => {
    if (!simulationState.isActive || simulationState.isPaused || simulationState.hasArrived) return;

    const interval = setInterval(() => {
      setSimulationState((prev) => {
        if (!prev.isActive || prev.isPaused) return prev;

        const coords = route.pathCoordinates;
        if (coords.length === 0) return prev;

        const stepIncrement = (0.35 * prev.speedMultiplier);
        const newProgress = Math.min(100, prev.progressPercent + stepIncrement);

        // Find current point on path
        const targetIndex = Math.min(
          coords.length - 1,
          Math.floor((newProgress / 100) * (coords.length - 1))
        );
        const currentCoord = coords[targetIndex];

        // Determine current active leg
        let cumulativeDuration = 0;
        let currentLegIndex = 0;
        for (let i = 0; i < route.legs.length; i++) {
          const legPercent = (route.legs[i].durationMinutes / route.totalDurationMinutes) * 100;
          cumulativeDuration += legPercent;
          if (newProgress <= cumulativeDuration) {
            currentLegIndex = i;
            break;
          }
        }

        const justArrived = newProgress >= 100 && !prev.hasArrived;
        if (justArrived) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          playChime();
        }

        return {
          ...prev,
          progressPercent: newProgress,
          currentPosition: currentCoord,
          currentLegIndex,
          elapsedSeconds: prev.elapsedSeconds + 1,
          hasArrived: newProgress >= 100,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [simulationState.isActive, simulationState.isPaused, simulationState.hasArrived, simulationState.speedMultiplier, route]);

  const currentLeg = route.legs[simulationState.currentLegIndex] || route.legs[0];
  const nextLeg = route.legs[simulationState.currentLegIndex + 1];

  const togglePlayPause = () => {
    setSimulationState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleRestart = () => {
    setSimulationState({
      isActive: true,
      isPaused: false,
      currentLegIndex: 0,
      progressPercent: 0,
      currentPosition: route.pathCoordinates[0] || [0, 0],
      elapsedSeconds: 0,
      speedMultiplier: 1,
      hasArrived: false,
    });
  };

  const changeSpeed = () => {
    setSimulationState((prev) => {
      const nextSpeed = prev.speedMultiplier === 1 ? 2 : prev.speedMultiplier === 2 ? 5 : 1;
      return { ...prev, speedMultiplier: nextSpeed };
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl text-white">
        {/* Top bar with mode info and close button */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Navegação Ativa em Tempo Real
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              title={soundEnabled ? 'Silenciar avisos' : 'Ativar som'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Fechar Navegação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Instruction Banner */}
        <div className="flex items-start gap-3 py-1">
          <div
            style={{
              backgroundColor: currentLeg.mode === 'walk' ? '#475569' : currentLeg.lineColor || '#06b6d4',
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 mt-0.5"
          >
            {currentLeg.mode === 'walk' ? <Footprints className="w-5 h-5" /> : <Train className="w-5 h-5" />}
          </div>

          <div className="flex-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">
              {simulationState.hasArrived ? 'Destino Atingido!' : `Passo ${simulationState.currentLegIndex + 1} de ${route.legs.length}`}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white leading-tight">
              {simulationState.hasArrived ? 'Você chegou ao seu destino final.' : currentLeg.instruction}
            </div>

            {/* Next step hint */}
            {!simulationState.hasArrived && nextLeg && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">A seguir:</span>
                <span className="truncate">{nextLeg.instruction}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1">
            <span>{Math.round(simulationState.progressPercent)}% Concluído</span>
            <span>{formatDuration(route.totalDurationMinutes)} total</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${simulationState.progressPercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
            />
          </div>
        </div>

        {/* Simulator Control Actions */}
        <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition-all"
            >
              {simulationState.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continuar</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar</span>
                </>
              )}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Reiniciar Trajeto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={changeSpeed}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs"
            title="Velocidade de Simulação"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{simulationState.speedMultiplier}x</span>
          </button>
        </div>
      </div>
    </div>
  );
};
