export type TransitMode = 'subway' | 'train' | 'bus' | 'brt' | 'tram' | 'ferry' | 'walk';

export type RoutePreference = 'fastest' | 'cheapest' | 'fewest_transfers' | 'least_walking' | 'accessible';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[]; // Line IDs
  isAccessible: boolean;
  hasElevator: boolean;
  hasBicycleParking?: boolean;
  zone?: string;
  address?: string;
}

export interface TransitLine {
  id: string;
  name: string;
  shortName: string;
  mode: TransitMode;
  color: string;
  textColor: string;
  operator: string;
  frequencyPeakMin: number;
  frequencyOffPeakMin: number;
  status: 'normal' | 'reduced_speed' | 'maintenance' | 'interrupted';
  statusDetails?: string;
  stations: string[]; // Station IDs in order
  fare: number;
}

export interface RouteLeg {
  id: string;
  mode: TransitMode;
  instruction: string;
  durationMinutes: number;
  distanceMeters: number;
  lineId?: string;
  lineName?: string;
  lineColor?: string;
  lineShortName?: string;
  headsign?: string;
  fromStation?: Station;
  toStation?: Station;
  intermediateStops?: Station[];
  stopsCount?: number;
  pathCoordinates: [number, number][]; // [lat, lng] array
  departureTime?: string;
  arrivalTime?: string;
  occupancy?: 'low' | 'medium' | 'high';
  platform?: string;
  carriageTip?: string;
}

export interface TransitRoute {
  id: string;
  title: string;
  tag: 'Mais Rápida' | 'Mais Barata' | 'Menos Baldeações' | 'Mais Acessível' | 'Ecológica' | 'Alternativa';
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  totalWalkingDistanceMeters: number;
  totalWalkingMinutes: number;
  totalFare: number;
  integratedFare: number;
  transfersCount: number;
  co2SavedKg: number;
  caloriesBurned: number;
  departureTime: string;
  arrivalTime: string;
  legs: RouteLeg[];
  isFullyAccessible: boolean;
  nextDepartureMinutes: number;
  summaryModes: { mode: TransitMode; color?: string; name: string }[];
  pathCoordinates: [number, number][];
}

export interface CityTransitData {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  zoom: number;
  currency: string;
  currencySymbol: string;
  baseFareSingle: number;
  baseFareIntegrated: number;
  cardName: string; // e.g. "Bilhete Único", "RioCard", "Cartão Urbs"
  stations: Station[];
  lines: TransitLine[];
  popularPlaces: {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    nearestStation: string;
    category: 'transport' | 'culture' | 'business' | 'landmark' | 'university' | 'park';
  }[];
}

export interface LineAlert {
  id: string;
  lineId: string;
  lineName: string;
  lineColor: string;
  severity: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  updatedAt: string;
}

export interface SavedRoute {
  id: string;
  name: string;
  originName: string;
  originCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  cityId: string;
  createdAt: string;
}

export interface SimulationState {
  isActive: boolean;
  isPaused: boolean;
  currentLegIndex: number;
  progressPercent: number; // 0 to 100
  currentPosition: [number, number];
  elapsedSeconds: number;
  speedMultiplier: number;
  hasArrived: boolean;
}
