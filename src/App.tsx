import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RouteSearchForm } from './components/RouteSearchForm';
import { RouteResultsList } from './components/RouteResultsList';
import { RouteDetailView } from './components/RouteDetailView';
import { TransitMap } from './components/TransitMap';
import { TurnByTurnSimulator } from './components/TurnByTurnSimulator';
import { NetworkStatusModal } from './components/NetworkStatusModal';
import { AiTransitAdvisor } from './components/AiTransitAdvisor';
import { SavedRoutesDrawer } from './components/SavedRoutesDrawer';
import { CITIES_DATA, SYSTEM_ALERTS } from './data/transitData';
import {
  CityTransitData,
  TransitRoute,
  RouteLeg,
  RoutePreference,
  TransitMode,
  SavedRoute,
  SimulationState,
  Station
} from './types';
import { computeTransitRoutes } from './utils/routingEngine';
import { Map, List, Navigation, Sparkles, AlertCircle, Compass } from 'lucide-react';

export default function App() {
  // Current City State
  const [currentCity, setCurrentCity] = useState<CityTransitData>(CITIES_DATA[0]);

  // Search Coordinates & Text State
  const [originText, setOriginText] = useState('Consolação (Av. Paulista)');
  const [originCoords, setOriginCoords] = useState<[number, number]>([-23.5579, -46.6603]);
  const [destText, setDestText] = useState('Faria Lima (Centro Financeiro)');
  const [destCoords, setDestCoords] = useState<[number, number]>([-23.5678, -46.6939]);

  // Route Filters & Preferences
  const [preference, setPreference] = useState<RoutePreference>('fastest');
  const [selectedModes, setSelectedModes] = useState<TransitMode[]>([
    'subway',
    'train',
    'bus',
    'brt',
    'tram',
  ]);
  const [onlyAccessible, setOnlyAccessible] = useState(false);

  // Calculation Results
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [highlightedLeg, setHighlightedLeg] = useState<RouteLeg | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mobile View Switcher ('results' | 'map')
  const [mobileTab, setMobileTab] = useState<'results' | 'map'>('results');

  // Simulation State
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    isPaused: false,
    currentLegIndex: 0,
    progressPercent: 0,
    currentPosition: [-23.5579, -46.6603],
    elapsedSeconds: 0,
    speedMultiplier: 1,
    hasArrived: false,
  });

  // Modals & Drawers
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Saved Routes Local Persistence
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => {
    try {
      const stored = localStorage.getItem('viatransito_saved_routes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Calculate Routes function
  const handleCalculateRoutes = () => {
    setIsCalculating(true);
    setSimulationState((prev) => ({ ...prev, isActive: false }));

    setTimeout(() => {
      const calculated = computeTransitRoutes(
        originCoords,
        originText,
        destCoords,
        destText,
        currentCity,
        preference,
        selectedModes,
        onlyAccessible
      );

      setRoutes(calculated);
      if (calculated.length > 0) {
        setSelectedRoute(calculated[0]);
      }
      setIsCalculating(false);
    }, 250);
  };

  // Initial auto calculation on first load
  useEffect(() => {
    handleCalculateRoutes();
  }, [currentCity]);

  // Recalculate when city changes
  const handleSelectCity = (city: CityTransitData) => {
    setCurrentCity(city);
    const firstPlace = city.popularPlaces[0] || {
      name: city.stations[0]?.name || 'Centro',
      lat: city.stations[0]?.lat || city.center[0],
      lng: city.stations[0]?.lng || city.center[1],
    };
    const secondPlace = city.popularPlaces[1] || {
      name: city.stations[1]?.name || 'Terminal',
      lat: city.stations[1]?.lat || city.center[0] + 0.02,
      lng: city.stations[1]?.lng || city.center[1] + 0.02,
    };

    setOriginText(firstPlace.name);
    setOriginCoords([firstPlace.lat, firstPlace.lng]);
    setDestText(secondPlace.name);
    setDestCoords([secondPlace.lat, secondPlace.lng]);
  };

  // Set Origin / Destination from map station click
  const handleSelectStationAsOrigin = (station: Station) => {
    setOriginText(station.name);
    setOriginCoords([station.lat, station.lng]);
  };

  const handleSelectStationAsDest = (station: Station) => {
    setDestText(station.name);
    setDestCoords([station.lat, station.lng]);
  };

  // Start turn-by-turn simulation
  const handleStartSimulation = () => {
    if (!selectedRoute) return;
    setSimulationState({
      isActive: true,
      isPaused: false,
      currentLegIndex: 0,
      progressPercent: 0,
      currentPosition: selectedRoute.pathCoordinates[0] || [0, 0],
      elapsedSeconds: 0,
      speedMultiplier: 1,
      hasArrived: false,
    });
    setMobileTab('map');
  };

  // Save Route
  const handleSaveRoute = (route: TransitRoute) => {
    const newSaved: SavedRoute = {
      id: `saved-${Date.now()}`,
      name: route.title,
      originName: originText,
      originCoords,
      destinationName: destText,
      destinationCoords: destCoords,
      cityId: currentCity.id,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    const updated = [newSaved, ...savedRoutes.filter((r) => r.name !== route.title)];
    setSavedRoutes(updated);
    try {
      localStorage.setItem('viatransito_saved_routes', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteSavedRoute = (id: string) => {
    const updated = savedRoutes.filter((r) => r.id !== id);
    setSavedRoutes(updated);
    try {
      localStorage.setItem('viatransito_saved_routes', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectSavedRoute = (saved: SavedRoute) => {
    setOriginText(saved.originName);
    setOriginCoords(saved.originCoords);
    setDestText(saved.destinationName);
    setDestCoords(saved.destinationCoords);
    handleCalculateRoutes();
  };

  const isCurrentRouteSaved = selectedRoute
    ? savedRoutes.some((r) => r.name === selectedRoute.title)
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenSavedRoutes={() => setIsSavedDrawerOpen(true)}
        alerts={SYSTEM_ALERTS}
        savedCount={savedRoutes.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 flex flex-col">
        {/* Mobile View Toggle Bar (Only visible on small screens) */}
        <div className="lg:hidden flex rounded-xl bg-slate-900 border border-slate-800 p-1 mb-3">
          <button
            onClick={() => setMobileTab('results')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'results' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Itinerário & Opções</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Mapa em Tempo Real</span>
          </button>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Search Form & Route Details */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Search Box */}
            <RouteSearchForm
              city={currentCity}
              originText={originText}
              setOriginText={setOriginText}
              originCoords={originCoords}
              setOriginCoords={setOriginCoords}
              destText={destText}
              setDestText={setDestText}
              destCoords={destCoords}
              setDestCoords={setDestCoords}
              preference={preference}
              setPreference={setPreference}
              selectedModes={selectedModes}
              setSelectedModes={setSelectedModes}
              onlyAccessible={onlyAccessible}
              setOnlyAccessible={setOnlyAccessible}
              onCalculateRoutes={handleCalculateRoutes}
              isCalculating={isCalculating}
            />

            {/* Results Options List */}
            <RouteResultsList
              routes={routes}
              selectedRouteId={selectedRoute?.id || null}
              onSelectRoute={(r) => setSelectedRoute(r)}
              currencySymbol={currentCity.currencySymbol}
            />

            {/* Detailed Selected Route Breakdown */}
            {selectedRoute && (
              <RouteDetailView
                route={selectedRoute}
                city={currentCity}
                onHighlightLeg={setHighlightedLeg}
                highlightedLegId={highlightedLeg?.id || null}
                onStartSimulation={handleStartSimulation}
                onSaveRoute={handleSaveRoute}
                onAskAi={() => setIsAiAdvisorOpen(true)}
                isSaved={isCurrentRouteSaved}
              />
            )}
          </div>

          {/* Right Column: Interactive Transit Map */}
          <div
            className={`lg:col-span-7 h-[500px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 ${
              mobileTab === 'results' ? 'hidden lg:block' : 'block'
            }`}
          >
            <TransitMap
              city={currentCity}
              activeRoute={selectedRoute}
              highlightedLeg={highlightedLeg}
              simulationState={simulationState}
              onSelectStationAsOrigin={handleSelectStationAsOrigin}
              onSelectStationAsDest={handleSelectStationAsDest}
            />
          </div>
        </div>
      </main>

      {/* Floating Turn-by-Turn Navigation Simulator HUD */}
      {simulationState.isActive && selectedRoute && (
        <TurnByTurnSimulator
          route={selectedRoute}
          simulationState={simulationState}
          setSimulationState={setSimulationState}
          onClose={() => setSimulationState((prev) => ({ ...prev, isActive: false }))}
        />
      )}

      {/* Line Status Modal */}
      {isStatusModalOpen && (
        <NetworkStatusModal
          city={currentCity}
          alerts={SYSTEM_ALERTS}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

      {/* AI Transit Advisor Modal */}
      {isAiAdvisorOpen && (
        <AiTransitAdvisor
          city={currentCity}
          activeRoute={selectedRoute}
          originText={originText}
          destText={destText}
          onClose={() => setIsAiAdvisorOpen(false)}
        />
      )}

      {/* Saved Routes Drawer */}
      <SavedRoutesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedRoutes={savedRoutes}
        onSelectSavedRoute={handleSelectSavedRoute}
        onDeleteSavedRoute={handleDeleteSavedRoute}
        currentCity={currentCity}
      />
    </div>
  );
}
