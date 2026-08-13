import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Search,
  Clock,
  Zap,
  DollarSign,
  Shuffle,
  Footprints,
  Accessibility,
  Train,
  Bus,
  Check,
  ChevronDown,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { CityTransitData, RoutePreference, Station, TransitMode } from '../types';

interface RouteSearchFormProps {
  city: CityTransitData;
  originText: string;
  setOriginText: (text: string) => void;
  originCoords: [number, number];
  setOriginCoords: (coords: [number, number]) => void;
  destText: string;
  setDestText: (text: string) => void;
  destCoords: [number, number];
  setDestCoords: (coords: [number, number]) => void;
  preference: RoutePreference;
  setPreference: (pref: RoutePreference) => void;
  selectedModes: TransitMode[];
  setSelectedModes: (modes: TransitMode[]) => void;
  onlyAccessible: boolean;
  setOnlyAccessible: (acc: boolean) => void;
  onCalculateRoutes: () => void;
  isCalculating: boolean;
}

export const RouteSearchForm: React.FC<RouteSearchFormProps> = ({
  city,
  originText,
  setOriginText,
  originCoords,
  setOriginCoords,
  destText,
  setDestText,
  destCoords,
  setDestCoords,
  preference,
  setPreference,
  selectedModes,
  setSelectedModes,
  onlyAccessible,
  setOnlyAccessible,
  onCalculateRoutes,
  isCalculating,
}) => {
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [departureType, setDepartureType] = useState<'now' | 'depart_at' | 'arrive_by'>('now');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [isLocating, setIsLocating] = useState(false);

  const originWrapperRef = useRef<HTMLDivElement>(null);
  const destWrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originWrapperRef.current && !originWrapperRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destWrapperRef.current && !destWrapperRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestion list based on query
  const getSuggestions = (query: string) => {
    const q = query.toLowerCase().trim();
    const stations = city.stations.map((s) => ({
      id: s.id,
      name: s.name,
      subtitle: `Estação de ${s.lines.map((lId) => city.lines.find((l) => l.id === lId)?.shortName || lId).join(', ')}`,
      lat: s.lat,
      lng: s.lng,
      type: 'station' as const,
    }));

    const places = city.popularPlaces.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.description,
      lat: p.lat,
      lng: p.lng,
      type: 'place' as const,
    }));

    const all = [...places, ...stations];
    if (!q) return all.slice(0, 7);
    return all.filter((item) => item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)).slice(0, 7);
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const tempText = originText;
    const tempCoords = originCoords;
    setOriginText(destText);
    setOriginCoords(destCoords);
    setDestText(tempText);
    setDestCoords(tempCoords);
  };

  // Handle GPS Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setOriginCoords([lat, lng]);
        setOriginText('📍 Minha Localização Atual');
      },
      (error) => {
        setIsLocating(false);
        // If outside or error, fallback to first city center station
        const centerStation = city.stations[0];
        if (centerStation) {
          setOriginCoords([centerStation.lat, centerStation.lng]);
          setOriginText(`📍 Próximo a ${centerStation.name}`);
        }
      },
      { timeout: 8000 }
    );
  };

  const toggleTransitMode = (mode: TransitMode) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const preferencesList: { key: RoutePreference; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'fastest', label: 'Mais Rápida', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Menor tempo' },
    { key: 'cheapest', label: 'Menor Custo', icon: <DollarSign className="w-3.5 h-3.5" />, desc: 'Tarifa mínima' },
    { key: 'fewest_transfers', label: 'Menos Baldeações', icon: <Shuffle className="w-3.5 h-3.5" />, desc: 'Direta' },
    { key: 'least_walking', label: 'Menos Caminhada', icon: <Footprints className="w-3.5 h-3.5" />, desc: 'Perto do ponto' },
    { key: 'accessible', label: 'Acessível PCD', icon: <Accessibility className="w-3.5 h-3.5" />, desc: '100% Elevadores' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Form Title & Quick Presets */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          Calcular Trajeto em {city.name}
        </h2>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-2.5 relative">
        {/* Origin Input */}
        <div ref={originWrapperRef} className="relative">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Ponto de Partida (Origem)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={originText}
              onChange={(e) => {
                setOriginText(e.target.value);
                setShowOriginSuggestions(true);
              }}
              onFocus={() => setShowOriginSuggestions(true)}
              placeholder="Digite estação, endereço ou ponto de interesse..."
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-24 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {/* GPS Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="absolute right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
              title="Usar localização GPS atual"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'GPS...' : 'Meu Local'}</span>
            </button>
          </div>

          {/* Origin Autocomplete Dropdown */}
          {showOriginSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
              <div className="p-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/50">
                Sugestões & Estações em {city.name}
              </div>
              {getSuggestions(originText).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOriginText(item.name);
                    setOriginCoords([item.lat, item.lng]);
                    setShowOriginSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <span className="p-1 rounded bg-slate-800 text-emerald-400 mt-0.5 shrink-0">
                    {item.type === 'station' ? <Train className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Origin / Destination Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all shadow"
            title="Inverter origem e destino"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Input */}
        <div ref={destWrapperRef} className="relative">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Destino Final
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-red-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={destText}
              onChange={(e) => {
                setDestText(e.target.value);
                setShowDestSuggestions(true);
              }}
              onFocus={() => setShowDestSuggestions(true)}
              placeholder="Para onde você vai? Ex: MASP, Faria Lima, Ibirapuera..."
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
              <div className="p-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-950/50">
                Pontos Populares & Estações
              </div>
              {getSuggestions(destText).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDestText(item.name);
                    setDestCoords([item.lat, item.lng]);
                    setShowDestSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <span className="p-1 rounded bg-slate-800 text-red-400 mt-0.5 shrink-0">
                    {item.type === 'station' ? <Train className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Popular Presets for City */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-500 font-medium shrink-0">Atalhos:</span>
        {city.popularPlaces.slice(0, 4).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setDestText(p.name);
              setDestCoords([p.lat, p.lng]);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] transition-all"
          >
            {p.name.split('(')[0]}
          </button>
        ))}
      </div>

      {/* Route Preference Selector Tabs */}
      <div className="mt-4">
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Prioridade da Rota
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {preferencesList.map((pref) => {
            const isSelected = preference === pref.key;
            return (
              <button
                key={pref.key}
                type="button"
                onClick={() => setPreference(pref.key)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800'}`}>
                  {pref.icon}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate leading-none">{pref.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{pref.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters (Transit Modes, Schedule, Accessibility) */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
          {/* Modes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Modais de Transporte
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { mode: 'subway' as TransitMode, label: 'Metrô' },
                { mode: 'train' as TransitMode, label: 'Trem CPTM' },
                { mode: 'brt' as TransitMode, label: 'BRT / Corredor' },
                { mode: 'bus' as TransitMode, label: 'Ônibus' },
                { mode: 'tram' as TransitMode, label: 'VLT' },
              ].map((item) => {
                const isActive = selectedModes.includes(item.mode);
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => toggleTransitMode(item.mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={departureType}
                onChange={(e) => setDepartureType(e.target.value as any)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="now" className="bg-slate-900">Sair Agora (Tempo Real)</option>
                <option value="depart_at" className="bg-slate-900">Sair às...</option>
                <option value="arrive_by" className="bg-slate-900">Chegar até...</option>
              </select>
            </div>

            <label className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={onlyAccessible}
                onChange={(e) => setOnlyAccessible(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Accessibility className="w-3.5 h-3.5 text-cyan-400" />
                Apenas 100% Acessível (PCD)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Calculate Routes Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onCalculateRoutes}
          disabled={isCalculating || !originText || !destText}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm tracking-wide transition-all"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Calculando Melhores Trajetos...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Calcular Melhores Rotas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
