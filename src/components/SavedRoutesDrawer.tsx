import React from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Navigation,
  ArrowRight,
  Clock,
  MapPin,
  Train
} from 'lucide-react';
import { SavedRoute, CityTransitData } from '../types';

interface SavedRoutesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRoutes: SavedRoute[];
  onSelectSavedRoute: (route: SavedRoute) => void;
  onDeleteSavedRoute: (id: string) => void;
  currentCity: CityTransitData;
}

export const SavedRoutesDrawer: React.FC<SavedRoutesDrawerProps> = ({
  isOpen,
  onClose,
  savedRoutes,
  onSelectSavedRoute,
  onDeleteSavedRoute,
  currentCity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white p-6 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Trajetos Salvos</h3>
                <p className="text-xs text-slate-400">Seus favoritos e rotas frequentes</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Saved Routes */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {savedRoutes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-300">Nenhuma rota salva ainda</div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Quando calcular um trajeto, clique no botão de favorito para acessá-lo rapidamente a qualquer momento.
                </p>
              </div>
            ) : (
              savedRoutes.map((saved) => (
                <div
                  key={saved.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{saved.name}</span>
                    <button
                      onClick={() => onDeleteSavedRoute(saved.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Excluir favorito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{saved.originName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span className="truncate">{saved.destinationName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSavedRoute(saved);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Calcular Este Trajeto</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
