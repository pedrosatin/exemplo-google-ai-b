import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CityTransitData, TransitRoute, RouteLeg, Station, SimulationState } from '../types';
import { Layers, Maximize2, Navigation, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';

interface TransitMapProps {
  city: CityTransitData;
  activeRoute: TransitRoute | null;
  highlightedLeg: RouteLeg | null;
  simulationState: SimulationState | null;
  onSelectStationAsOrigin?: (station: Station) => void;
  onSelectStationAsDest?: (station: Station) => void;
}

type MapLayerType = 'dark' | 'streets' | 'transit';

export const TransitMap: React.FC<TransitMapProps> = ({
  city,
  activeRoute,
  highlightedLeg,
  simulationState,
  onSelectStationAsOrigin,
  onSelectStationAsDest
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer groups for clean updates
  const networkLinesLayerRef = useRef<L.LayerGroup | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const activeRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const simulationMarkerRef = useRef<L.Marker | null>(null);

  const [currentLayerType, setCurrentLayerType] = useState<MapLayerType>('dark');
  const [showFullNetwork, setShowFullNetwork] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: city.center,
        zoom: city.zoom,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tile layer
      const darkTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      );
      darkTiles.addTo(map);
      tileLayerRef.current = darkTiles;

      // Create Layer Groups
      networkLinesLayerRef.current = L.layerGroup().addTo(map);
      stationsLayerRef.current = L.layerGroup().addTo(map);
      activeRouteLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(city.center, city.zoom);
    }
  }, [city]);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = '';
    if (currentLayerType === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (currentLayerType === 'transit') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    const newTiles = L.tileLayer(url, {
      subdomains: 'abcd',
      maxZoom: 19,
    });
    newTiles.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [currentLayerType]);

  // Draw background network lines and station dots
  useEffect(() => {
    if (!mapInstanceRef.current || !networkLinesLayerRef.current || !stationsLayerRef.current) return;

    networkLinesLayerRef.current.clearLayers();
    stationsLayerRef.current.clearLayers();

    if (!showFullNetwork) return;

    // Draw lines
    city.lines.forEach((line) => {
      const lineStationCoords = line.stations
        .map((sId) => city.stations.find((s) => s.id === sId))
        .filter((s): s is Station => Boolean(s))
        .map((s) => [s.lat, s.lng] as [number, number]);

      if (lineStationCoords.length > 1) {
        const polyline = L.polyline(lineStationCoords, {
          color: line.color,
          weight: 4,
          opacity: 0.45,
          dashArray: line.mode === 'bus' || line.mode === 'brt' ? '6, 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        });
        polyline.bindTooltip(`<b>${line.name}</b><br>Operador: ${line.operator}`, {
          sticky: true,
          className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded px-2 py-1',
        });
        networkLinesLayerRef.current?.addLayer(polyline);
      }
    });

    // Draw stations
    city.stations.forEach((station) => {
      const isTransfer = station.lines.length > 1;
      const markerHtml = `
        <div style="
          width: ${isTransfer ? '14px' : '10px'};
          height: ${isTransfer ? '14px' : '10px'};
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid ${isTransfer ? '#06b6d4' : '#64748b'};
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
          cursor: pointer;
        "></div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'station-dot',
        iconSize: [isTransfer ? 14 : 10, isTransfer ? 14 : 10],
        iconAnchor: [isTransfer ? 7 : 5, isTransfer ? 7 : 5],
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-100 min-w-[200px] text-xs font-sans';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-white mb-1">${station.name}</div>
        <div class="flex flex-wrap gap-1 mb-2">
          ${station.lines
            .map((lId) => {
              const line = city.lines.find((l) => l.id === lId);
              return `<span style="background:${line?.color || '#64748b'}; color:${line?.textColor || '#fff'}" class="px-1.5 py-0.5 rounded text-[10px] font-bold">${line?.shortName || lId}</span>`;
            })
            .join('')}
        </div>
        <div class="text-[11px] text-slate-400 space-y-1 mb-2">
          <div>${station.isAccessible ? '♿ Acessível (Elevador)' : '⚠️ Acesso por escadas'}</div>
          ${station.hasBicycleParking ? '<div>🚲 Bicicletário integrado</div>' : ''}
        </div>
        <div class="flex gap-1.5 pt-1 border-t border-slate-700">
          <button id="btn-orig-${station.id}" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded py-1 px-1.5 text-center font-semibold">Origem</button>
          <button id="btn-dest-${station.id}" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1 px-1.5 text-center font-semibold">Destino</button>
        </div>
      `;

      popupContent.querySelector(`#btn-orig-${station.id}`)?.addEventListener('click', () => {
        onSelectStationAsOrigin?.(station);
        marker.closePopup();
      });
      popupContent.querySelector(`#btn-dest-${station.id}`)?.addEventListener('click', () => {
        onSelectStationAsDest?.(station);
        marker.closePopup();
      });

      marker.bindPopup(popupContent);
      stationsLayerRef.current?.addLayer(marker);
    });
  }, [city, showFullNetwork]);

  // Render Active Route Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !activeRouteLayerRef.current) return;

    activeRouteLayerRef.current.clearLayers();

    if (!activeRoute || activeRoute.legs.length === 0) return;

    // Draw active route path legs
    activeRoute.legs.forEach((leg) => {
      const isWalking = leg.mode === 'walk';
      const color = isWalking ? '#94a3b8' : leg.lineColor || '#06b6d4';
      const isHighlighted = highlightedLeg?.id === leg.id;

      const polyline = L.polyline(leg.pathCoordinates, {
        color: isHighlighted ? '#38bdf8' : color,
        weight: isHighlighted ? 8 : isWalking ? 4 : 6,
        opacity: isHighlighted ? 1 : 0.9,
        dashArray: isWalking ? '4, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindTooltip(`<b>${leg.instruction}</b><br>${leg.durationMinutes} min`, {
        sticky: true,
        className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded px-2 py-1',
      });

      activeRouteLayerRef.current?.addLayer(polyline);

      // Add intermediate stops markers if transit
      if (leg.intermediateStops && leg.intermediateStops.length > 0) {
        leg.intermediateStops.forEach((st) => {
          const stopIcon = L.divIcon({
            html: `<div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff; border: 2px solid ${color};"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          const m = L.marker([st.lat, st.lng], { icon: stopIcon });
          m.bindTooltip(`<b>${st.name}</b>`, { direction: 'top', offset: [0, -6] });
          activeRouteLayerRef.current?.addLayer(m);
        });
      }
    });

    // Add Origin Marker (Green Pulse)
    const firstCoord = activeRoute.pathCoordinates[0];
    if (firstCoord) {
      const originHtml = `
        <div class="custom-pulse-marker" style="width: 28px; height: 28px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(16,185,129,0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
          A
        </div>
      `;
      const originIcon = L.divIcon({
        html: originHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const originMarker = L.marker(firstCoord, { icon: originIcon });
      originMarker.bindTooltip('<b>Ponto de Partida</b>', { direction: 'top', offset: [0, -14] });
      activeRouteLayerRef.current.addLayer(originMarker);
    }

    // Add Destination Marker (Cyan/Red Flag)
    const lastCoord = activeRoute.pathCoordinates[activeRoute.pathCoordinates.length - 1];
    if (lastCoord) {
      const destHtml = `
        <div class="custom-pulse-marker" style="width: 28px; height: 28px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(239,68,68,0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
          B
        </div>
      `;
      const destIcon = L.divIcon({
        html: destHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const destMarker = L.marker(lastCoord, { icon: destIcon });
      destMarker.bindTooltip('<b>Destino Final</b>', { direction: 'top', offset: [0, -14] });
      activeRouteLayerRef.current.addLayer(destMarker);
    }

    // Fit map bounds to route if not simulating
    if (!simulationState?.isActive && activeRoute.pathCoordinates.length > 0) {
      const bounds = L.latLngBounds(activeRoute.pathCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [activeRoute, highlightedLeg]);

  // Simulation position tracking
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (simulationState?.isActive && simulationState.currentPosition) {
      const [lat, lng] = simulationState.currentPosition;

      if (!simulationMarkerRef.current) {
        const vehicleHtml = `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4, #2563eb);
            border: 3px solid #ffffff;
            box-shadow: 0 0 16px rgba(6,182,212,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 16px;
            animation: pulse-ring 1.5s infinite;
          ">
            🚇
          </div>
        `;
        const vehicleIcon = L.divIcon({
          html: vehicleHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([lat, lng], { icon: vehicleIcon, zIndexOffset: 1000 });
        marker.addTo(mapInstanceRef.current);
        simulationMarkerRef.current = marker;
      } else {
        simulationMarkerRef.current.setLatLng([lat, lng]);
      }

      // Smoothly pan to follow vehicle
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    } else {
      if (simulationMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(simulationMarkerRef.current);
        simulationMarkerRef.current = null;
      }
    }
  }, [simulationState]);

  // Center on Highlighted Leg
  useEffect(() => {
    if (highlightedLeg && highlightedLeg.pathCoordinates.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(highlightedLeg.pathCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [highlightedLeg]);

  const fitRouteBounds = () => {
    if (activeRoute && activeRoute.pathCoordinates.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(activeRoute.pathCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(city.center, city.zoom);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg text-xs font-medium text-slate-300">
          <button
            onClick={() => setCurrentLayerType('dark')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              currentLayerType === 'dark' ? 'bg-cyan-600 text-white font-bold shadow' : 'hover:text-white'
            }`}
          >
            Escuro
          </button>
          <button
            onClick={() => setCurrentLayerType('streets')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              currentLayerType === 'streets' ? 'bg-cyan-600 text-white font-bold shadow' : 'hover:text-white'
            }`}
          >
            Claro
          </button>
          <button
            onClick={() => setCurrentLayerType('transit')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              currentLayerType === 'transit' ? 'bg-cyan-600 text-white font-bold shadow' : 'hover:text-white'
            }`}
          >
            Satélite / OSM
          </button>
        </div>

        {/* Toggle Full Network */}
        <button
          onClick={() => setShowFullNetwork(!showFullNetwork)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
            showFullNetwork
              ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/70 border-slate-700 text-slate-400'
          }`}
          title="Exibir ou ocultar todas as linhas do sistema"
        >
          {showFullNetwork ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Malha Completa</span>
        </button>
      </div>

      {/* Right Floating Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={fitRouteBounds}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all"
          title="Centralizar Rota ou Cidade"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all"
          title="Aproximar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all"
          title="Afastar Zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="inline-flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 shadow-lg text-[11px] text-slate-300 pointer-events-auto">
          <span className="text-slate-400 font-semibold">Legenda:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            <span>Origem</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
            <span>Destino</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white" />
            <span>Estação/Baldeação</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-1 border-t-2 border-dashed border-slate-400" />
            <span>Caminhada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
