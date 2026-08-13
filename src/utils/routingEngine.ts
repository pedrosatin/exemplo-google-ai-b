import { CityTransitData, Station, TransitLine, TransitRoute, RouteLeg, TransitMode, RoutePreference } from '../types';

// Haversine formula to compute distance in meters between two coordinates
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Format meters to friendly string
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Format duration minutes to friendly string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
}

// Format time HH:MM
export function formatTimeOffset(date: Date, addMinutes: number): string {
  const target = new Date(date.getTime() + addMinutes * 60000);
  return target.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

interface GraphNode {
  station: Station;
  lineId: string;
}

interface GraphEdge {
  toStation: Station;
  toLineId: string;
  durationMinutes: number;
  distanceMeters: number;
  isTransfer: boolean;
  line?: TransitLine;
}

// Find closest stations to a given coordinate
export function findNearbyStations(
  coords: [number, number],
  stations: Station[],
  maxCount = 3,
  maxDistance = 6000
): { station: Station; distance: number }[] {
  const [lat, lng] = coords;
  return stations
    .map(station => ({
      station,
      distance: getDistanceMeters(lat, lng, station.lat, station.lng),
    }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxCount);
}

// Interpolate points between two coordinates for smooth polyline / simulation
export function interpolatePoints(start: [number, number], end: [number, number], segments = 5): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const ratio = i / segments;
    const lat = start[0] + (end[0] - start[0]) * ratio;
    const lng = start[1] + (end[1] - start[1]) * ratio;
    points.push([lat, lng]);
  }
  return points;
}

// Get carriage positioning strategy
function getCarriageAdvice(mode: TransitMode, isTransfer: boolean): string {
  if (mode === 'subway' && isTransfer) {
    const tips = [
      'Embarque nos vagões centrais (3 ou 4) para acesso imediato às escadas rolantes de baldeação.',
      'Embarque na extremidade dianteira (vagão 1) para desembarque rápido na próxima linha.',
      'Prefira os vagões traseiros para evitar o fluxo mais intenso de desembarque.'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
  if (mode === 'subway') {
    return 'Vagões intermediários costumam apresentar menor taxa de lotação.';
  }
  if (mode === 'brt' || mode === 'bus') {
    return 'Embarque pela porta dianteira ou portas centrais nas paradas com pré-embarque.';
  }
  return 'Mantenha-se atento aos avisos sonoros da próxima estação.';
}

export function computeTransitRoutes(
  originCoords: [number, number],
  originName: string,
  destCoords: [number, number],
  destName: string,
  cityData: CityTransitData,
  preference: RoutePreference = 'fastest',
  selectedModes: TransitMode[] = ['subway', 'train', 'bus', 'brt', 'tram', 'ferry'],
  onlyAccessible = false
): TransitRoute[] {
  const availableLines = cityData.lines.filter(l => selectedModes.includes(l.mode));
  const availableStations = cityData.stations.filter(s => {
    if (onlyAccessible && !s.isAccessible) return false;
    return s.lines.some(lId => availableLines.some(al => al.id === lId));
  });

  const originNearby = findNearbyStations(originCoords, availableStations, 3);
  const destNearby = findNearbyStations(destCoords, availableStations, 3);

  const routes: TransitRoute[] = [];
  const baseDate = new Date();

  // If no nearby stations found within range, create a walking / direct route
  if (originNearby.length === 0 || destNearby.length === 0) {
    const directDist = getDistanceMeters(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    const walkDuration = Math.round(directDist / 80); // ~4.8 km/h (80 m/min)
    const departureTime = formatTimeOffset(baseDate, 0);
    const arrivalTime = formatTimeOffset(baseDate, walkDuration);

    const walkingPath = interpolatePoints(originCoords, destCoords, 10);
    const singleLeg: RouteLeg = {
      id: 'leg-walk-direct',
      mode: 'walk',
      instruction: `Caminhe de ${originName} até ${destName}`,
      durationMinutes: walkDuration,
      distanceMeters: directDist,
      pathCoordinates: walkingPath,
      departureTime,
      arrivalTime
    };

    return [
      {
        id: 'route-walk-only',
        title: 'Trajeto a pé direto',
        tag: 'Ecológica',
        totalDurationMinutes: walkDuration,
        totalDistanceMeters: directDist,
        totalWalkingDistanceMeters: directDist,
        totalWalkingMinutes: walkDuration,
        totalFare: 0,
        integratedFare: 0,
        transfersCount: 0,
        co2SavedKg: Number(((directDist / 1000) * 0.14).toFixed(2)),
        caloriesBurned: Math.round(walkDuration * 4.5),
        departureTime,
        arrivalTime,
        legs: [singleLeg],
        isFullyAccessible: true,
        nextDepartureMinutes: 0,
        summaryModes: [{ mode: 'walk', name: 'Caminhada' }],
        pathCoordinates: walkingPath
      }
    ];
  }

  // Iterate over origin and destination station pairs to discover viable multi-modal transit paths
  for (const orig of originNearby) {
    for (const dst of destNearby) {
      if (orig.station.id === dst.station.id) continue;

      // 1. Check for direct single-line connections
      const commonLineIds = orig.station.lines.filter(l => dst.station.lines.includes(l));

      for (const lineId of commonLineIds) {
        const line = cityData.lines.find(l => l.id === lineId);
        if (!line || !selectedModes.includes(line.mode)) continue;

        const idxA = line.stations.indexOf(orig.station.id);
        const idxB = line.stations.indexOf(dst.station.id);
        if (idxA === -1 || idxB === -1) continue;

        const stopsInBetweenIds = idxA < idxB
          ? line.stations.slice(idxA, idxB + 1)
          : line.stations.slice(idxB, idxA + 1).reverse();

        const intermediateStops = stopsInBetweenIds
          .map(sId => cityData.stations.find(s => s.id === sId))
          .filter((s): s is Station => Boolean(s));

        const transitSpeedKmH = line.mode === 'subway' ? 36 : line.mode === 'train' ? 42 : line.mode === 'brt' ? 24 : 18;
        let transitDistance = 0;
        const lineCoords: [number, number][] = [];

        for (let i = 0; i < intermediateStops.length - 1; i++) {
          const s1 = intermediateStops[i];
          const s2 = intermediateStops[i + 1];
          transitDistance += getDistanceMeters(s1.lat, s1.lng, s2.lat, s2.lng);
          lineCoords.push(...interpolatePoints([s1.lat, s1.lng], [s2.lat, s2.lng], 4));
        }

        const transitDurationMin = Math.max(3, Math.round((transitDistance / 1000 / transitSpeedKmH) * 60) + (intermediateStops.length * 0.7));
        const walkOrigDist = orig.distance;
        const walkOrigMin = Math.max(1, Math.round(walkOrigDist / 80));
        const walkDestDist = dst.distance;
        const walkDestMin = Math.max(1, Math.round(walkDestDist / 80));

        const totalDuration = Math.round(walkOrigMin + transitDurationMin + walkDestMin);
        const totalDistance = Math.round(walkOrigDist + transitDistance + walkDestDist);
        const totalWalkDist = Math.round(walkOrigDist + walkDestDist);
        const totalWalkMin = Math.round(walkOrigMin + walkDestMin);

        const walk1Path = interpolatePoints(originCoords, [orig.station.lat, orig.station.lng], 4);
        const walk2Path = interpolatePoints([dst.station.lat, dst.station.lng], destCoords, 4);

        const allCoords = [...walk1Path, ...lineCoords, ...walk2Path];

        const t0 = 0;
        const t1 = t0 + walkOrigMin;
        const t2 = t1 + transitDurationMin;
        const t3 = t2 + walkDestMin;

        const legs: RouteLeg[] = [
          {
            id: `leg-walk-start-${orig.station.id}`,
            mode: 'walk',
            instruction: `Caminhe de ${originName} até ${orig.station.name}`,
            durationMinutes: walkOrigMin,
            distanceMeters: walkOrigDist,
            pathCoordinates: walk1Path,
            departureTime: formatTimeOffset(baseDate, t0),
            arrivalTime: formatTimeOffset(baseDate, t1)
          },
          {
            id: `leg-transit-${line.id}`,
            mode: line.mode,
            instruction: `Embarque em ${orig.station.name} (${line.name})`,
            durationMinutes: Math.round(transitDurationMin),
            distanceMeters: Math.round(transitDistance),
            lineId: line.id,
            lineName: line.name,
            lineColor: line.color,
            lineShortName: line.shortName,
            headsign: `Sentido ${idxA < idxB ? cityData.stations.find(s => s.id === line.stations[line.stations.length - 1])?.name || '' : cityData.stations.find(s => s.id === line.stations[0])?.name || ''}`,
            fromStation: orig.station,
            toStation: dst.station,
            intermediateStops,
            stopsCount: intermediateStops.length,
            pathCoordinates: lineCoords,
            departureTime: formatTimeOffset(baseDate, t1),
            arrivalTime: formatTimeOffset(baseDate, t2),
            occupancy: line.mode === 'subway' ? 'medium' : 'low',
            platform: 'Plataforma 1',
            carriageTip: getCarriageAdvice(line.mode, false)
          },
          {
            id: `leg-walk-end-${dst.station.id}`,
            mode: 'walk',
            instruction: `Caminhe de ${dst.station.name} até ${destName}`,
            durationMinutes: walkDestMin,
            distanceMeters: walkDestDist,
            pathCoordinates: walk2Path,
            departureTime: formatTimeOffset(baseDate, t2),
            arrivalTime: formatTimeOffset(baseDate, t3)
          }
        ];

        routes.push({
          id: `route-direct-${line.id}-${orig.station.id}-${dst.station.id}`,
          title: `Direto via ${line.name}`,
          tag: 'Menos Baldeações',
          totalDurationMinutes: totalDuration,
          totalDistanceMeters: totalDistance,
          totalWalkingDistanceMeters: totalWalkDist,
          totalWalkingMinutes: totalWalkMin,
          totalFare: line.fare,
          integratedFare: line.fare,
          transfersCount: 0,
          co2SavedKg: Number(((totalDistance / 1000) * 0.14).toFixed(2)),
          caloriesBurned: Math.round(totalWalkMin * 4.5),
          departureTime: formatTimeOffset(baseDate, 0),
          arrivalTime: formatTimeOffset(baseDate, totalDuration),
          legs,
          isFullyAccessible: orig.station.isAccessible && dst.station.isAccessible,
          nextDepartureMinutes: Math.floor(Math.random() * 3) + 1,
          summaryModes: [
            { mode: 'walk', name: 'A pé' },
            { mode: line.mode, color: line.color, name: line.shortName },
            { mode: 'walk', name: 'A pé' }
          ],
          pathCoordinates: allCoords
        });
      }

      // 2. Discover 1-Transfer connections (Hub Transfer)
      // Find intersection stations between origin station lines and destination station lines
      for (const line1Id of orig.station.lines) {
        const line1 = cityData.lines.find(l => l.id === line1Id);
        if (!line1 || !selectedModes.includes(line1.mode)) continue;

        for (const line2Id of dst.station.lines) {
          if (line1Id === line2Id) continue;
          const line2 = cityData.lines.find(l => l.id === line2Id);
          if (!line2 || !selectedModes.includes(line2.mode)) continue;

          // Find common transfer station between line1 and line2
          const transferStationId = line1.stations.find(sId => line2.stations.includes(sId));
          if (!transferStationId) continue;
          const transferStation = cityData.stations.find(s => s.id === transferStationId);
          if (!transferStation) continue;
          if (transferStation.id === orig.station.id || transferStation.id === dst.station.id) continue;

          // Leg 1: orig to transfer
          const idx1A = line1.stations.indexOf(orig.station.id);
          const idx1B = line1.stations.indexOf(transferStation.id);
          if (idx1A === -1 || idx1B === -1) continue;

          const stopsLeg1Ids = idx1A < idx1B
            ? line1.stations.slice(idx1A, idx1B + 1)
            : line1.stations.slice(idx1B, idx1A + 1).reverse();
          const stopsLeg1 = stopsLeg1Ids.map(sId => cityData.stations.find(s => s.id === sId)!).filter(Boolean);

          // Leg 2: transfer to dst
          const idx2A = line2.stations.indexOf(transferStation.id);
          const idx2B = line2.stations.indexOf(dst.station.id);
          if (idx2A === -1 || idx2B === -1) continue;

          const stopsLeg2Ids = idx2A < idx2B
            ? line2.stations.slice(idx2A, idx2B + 1)
            : line2.stations.slice(idx2B, idx2A + 1).reverse();
          const stopsLeg2 = stopsLeg2Ids.map(sId => cityData.stations.find(s => s.id === sId)!).filter(Boolean);

          let dist1 = 0;
          const coords1: [number, number][] = [];
          for (let i = 0; i < stopsLeg1.length - 1; i++) {
            dist1 += getDistanceMeters(stopsLeg1[i].lat, stopsLeg1[i].lng, stopsLeg1[i + 1].lat, stopsLeg1[i + 1].lng);
            coords1.push(...interpolatePoints([stopsLeg1[i].lat, stopsLeg1[i].lng], [stopsLeg1[i + 1].lat, stopsLeg1[i + 1].lng], 4));
          }

          let dist2 = 0;
          const coords2: [number, number][] = [];
          for (let i = 0; i < stopsLeg2.length - 1; i++) {
            dist2 += getDistanceMeters(stopsLeg2[i].lat, stopsLeg2[i].lng, stopsLeg2[i + 1].lat, stopsLeg2[i + 1].lng);
            coords2.push(...interpolatePoints([stopsLeg2[i].lat, stopsLeg2[i].lng], [stopsLeg2[i + 1].lat, stopsLeg2[i + 1].lng], 4));
          }

          const dur1 = Math.max(3, Math.round((dist1 / 1000 / 35) * 60) + stopsLeg1.length * 0.7);
          const durTransfer = 3.5; // Baldeação interna
          const dur2 = Math.max(3, Math.round((dist2 / 1000 / 35) * 60) + stopsLeg2.length * 0.7);

          const walkOrigDist = orig.distance;
          const walkOrigMin = Math.max(1, Math.round(walkOrigDist / 80));
          const walkDestDist = dst.distance;
          const walkDestMin = Math.max(1, Math.round(walkDestDist / 80));

          const totalDuration = Math.round(walkOrigMin + dur1 + durTransfer + dur2 + walkDestMin);
          const totalDistance = Math.round(walkOrigDist + dist1 + dist2 + walkDestDist);
          const totalWalkDist = Math.round(walkOrigDist + walkDestDist + 150); // plus transfer walk
          const totalWalkMin = Math.round(walkOrigMin + walkDestMin + durTransfer);

          const walk1Path = interpolatePoints(originCoords, [orig.station.lat, orig.station.lng], 4);
          const walk2Path = interpolatePoints([dst.station.lat, dst.station.lng], destCoords, 4);

          const allCoords = [...walk1Path, ...coords1, ...coords2, ...walk2Path];

          let clock = 0;
          const legs: RouteLeg[] = [
            {
              id: `leg-walk-1-${orig.station.id}`,
              mode: 'walk',
              instruction: `Caminhe de ${originName} até ${orig.station.name}`,
              durationMinutes: walkOrigMin,
              distanceMeters: walkOrigDist,
              pathCoordinates: walk1Path,
              departureTime: formatTimeOffset(baseDate, clock),
              arrivalTime: formatTimeOffset(baseDate, (clock += walkOrigMin))
            },
            {
              id: `leg-transit-1-${line1.id}`,
              mode: line1.mode,
              instruction: `Embarque em ${orig.station.name} (${line1.name})`,
              durationMinutes: Math.round(dur1),
              distanceMeters: Math.round(dist1),
              lineId: line1.id,
              lineName: line1.name,
              lineColor: line1.color,
              lineShortName: line1.shortName,
              headsign: `Sentido ${idx1A < idx1B ? cityData.stations.find(s => s.id === line1.stations[line1.stations.length - 1])?.name || '' : cityData.stations.find(s => s.id === line1.stations[0])?.name || ''}`,
              fromStation: orig.station,
              toStation: transferStation,
              intermediateStops: stopsLeg1,
              stopsCount: stopsLeg1.length,
              pathCoordinates: coords1,
              departureTime: formatTimeOffset(baseDate, clock),
              arrivalTime: formatTimeOffset(baseDate, (clock += dur1)),
              occupancy: 'medium',
              carriageTip: getCarriageAdvice(line1.mode, true)
            },
            {
              id: `leg-transfer-${transferStation.id}`,
              mode: 'walk',
              instruction: `Baldeação interna em ${transferStation.name}: siga as placas para ${line2.name}`,
              durationMinutes: Math.round(durTransfer),
              distanceMeters: 150,
              pathCoordinates: interpolatePoints([transferStation.lat, transferStation.lng], [transferStation.lat, transferStation.lng], 2),
              departureTime: formatTimeOffset(baseDate, clock),
              arrivalTime: formatTimeOffset(baseDate, (clock += durTransfer))
            },
            {
              id: `leg-transit-2-${line2.id}`,
              mode: line2.mode,
              instruction: `Embarque na conexão (${line2.name}) em ${transferStation.name}`,
              durationMinutes: Math.round(dur2),
              distanceMeters: Math.round(dist2),
              lineId: line2.id,
              lineName: line2.name,
              lineColor: line2.color,
              lineShortName: line2.shortName,
              headsign: `Sentido ${idx2A < idx2B ? cityData.stations.find(s => s.id === line2.stations[line2.stations.length - 1])?.name || '' : cityData.stations.find(s => s.id === line2.stations[0])?.name || ''}`,
              fromStation: transferStation,
              toStation: dst.station,
              intermediateStops: stopsLeg2,
              stopsCount: stopsLeg2.length,
              pathCoordinates: coords2,
              departureTime: formatTimeOffset(baseDate, clock),
              arrivalTime: formatTimeOffset(baseDate, (clock += dur2)),
              occupancy: 'low',
              carriageTip: getCarriageAdvice(line2.mode, false)
            },
            {
              id: `leg-walk-2-${dst.station.id}`,
              mode: 'walk',
              instruction: `Caminhe de ${dst.station.name} até ${destName}`,
              durationMinutes: walkDestMin,
              distanceMeters: walkDestDist,
              pathCoordinates: walk2Path,
              departureTime: formatTimeOffset(baseDate, clock),
              arrivalTime: formatTimeOffset(baseDate, (clock += walkDestMin))
            }
          ];

          // Fare calculation: if both are metro/train, free transfer; if bus + metro, integrated fare
          const isFreeTransfer = (line1.mode === 'subway' || line1.mode === 'train') && (line2.mode === 'subway' || line2.mode === 'train');
          const totalFare = isFreeTransfer ? line1.fare : cityData.baseFareIntegrated;

          routes.push({
            id: `route-trans-${line1.id}-${line2.id}-${orig.station.id}-${dst.station.id}`,
            title: `${line1.shortName} + ${line2.shortName}`,
            tag: 'Mais Rápida',
            totalDurationMinutes: totalDuration,
            totalDistanceMeters: totalDistance,
            totalWalkingDistanceMeters: totalWalkDist,
            totalWalkingMinutes: totalWalkMin,
            totalFare,
            integratedFare: totalFare,
            transfersCount: 1,
            co2SavedKg: Number(((totalDistance / 1000) * 0.14).toFixed(2)),
            caloriesBurned: Math.round(totalWalkMin * 4.5),
            departureTime: formatTimeOffset(baseDate, 0),
            arrivalTime: formatTimeOffset(baseDate, totalDuration),
            legs,
            isFullyAccessible: orig.station.isAccessible && transferStation.isAccessible && dst.station.isAccessible,
            nextDepartureMinutes: 2,
            summaryModes: [
              { mode: 'walk', name: 'A pé' },
              { mode: line1.mode, color: line1.color, name: line1.shortName },
              { mode: line2.mode, color: line2.color, name: line2.shortName },
              { mode: 'walk', name: 'A pé' }
            ],
            pathCoordinates: allCoords
          });
        }
      }
    }
  }

  // Deduplicate and rank routes based on user preference
  const uniqueMap = new Map<string, TransitRoute>();
  for (const r of routes) {
    const key = `${r.summaryModes.map(m => m.name).join('>')}-${Math.round(r.totalDurationMinutes / 3)}`;
    if (!uniqueMap.has(key) || uniqueMap.get(key)!.totalDurationMinutes > r.totalDurationMinutes) {
      uniqueMap.set(key, r);
    }
  }

  let finalRoutes = Array.from(uniqueMap.values());

  if (finalRoutes.length === 0) {
    // Fallback: build closest hybrid multimodal route
    const oStation = originNearby[0]?.station || cityData.stations[0];
    const dStation = destNearby[0]?.station || cityData.stations[1];
    const fallbackDist = getDistanceMeters(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    const fallbackDuration = Math.round(fallbackDist / 350) + 12;

    const line = cityData.lines[0];
    const allCoords = interpolatePoints(originCoords, destCoords, 15);

    finalRoutes.push({
      id: 'route-fallback-smart',
      title: `Integração ${line.name}`,
      tag: 'Mais Rápida',
      totalDurationMinutes: fallbackDuration,
      totalDistanceMeters: fallbackDist,
      totalWalkingDistanceMeters: 400,
      totalWalkingMinutes: 6,
      totalFare: cityData.baseFareIntegrated,
      integratedFare: cityData.baseFareIntegrated,
      transfersCount: 1,
      co2SavedKg: Number(((fallbackDist / 1000) * 0.14).toFixed(2)),
      caloriesBurned: 35,
      departureTime: formatTimeOffset(baseDate, 0),
      arrivalTime: formatTimeOffset(baseDate, fallbackDuration),
      legs: [
        {
          id: 'leg-walk-1',
          mode: 'walk',
          instruction: `Caminhe até a estação ${oStation.name}`,
          durationMinutes: 4,
          distanceMeters: 280,
          pathCoordinates: interpolatePoints(originCoords, [oStation.lat, oStation.lng], 4)
        },
        {
          id: 'leg-transit-main',
          mode: line.mode,
          instruction: `Embarque em ${oStation.name} sentido terminal`,
          durationMinutes: fallbackDuration - 8,
          distanceMeters: fallbackDist - 400,
          lineId: line.id,
          lineName: line.name,
          lineColor: line.color,
          lineShortName: line.shortName,
          fromStation: oStation,
          toStation: dStation,
          pathCoordinates: interpolatePoints([oStation.lat, oStation.lng], [dStation.lat, dStation.lng], 8)
        },
        {
          id: 'leg-walk-2',
          mode: 'walk',
          instruction: `Caminhe de ${dStation.name} até ${destName}`,
          durationMinutes: 4,
          distanceMeters: 250,
          pathCoordinates: interpolatePoints([dStation.lat, dStation.lng], destCoords, 4)
        }
      ],
      isFullyAccessible: true,
      nextDepartureMinutes: 2,
      summaryModes: [
        { mode: 'walk', name: 'A pé' },
        { mode: line.mode, color: line.color, name: line.shortName },
        { mode: 'walk', name: 'A pé' }
      ],
      pathCoordinates: allCoords
    });
  }

  // Sort and assign badges
  if (preference === 'fastest') {
    finalRoutes.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (preference === 'cheapest') {
    finalRoutes.sort((a, b) => a.totalFare - b.totalFare || a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (preference === 'fewest_transfers') {
    finalRoutes.sort((a, b) => a.transfersCount - b.transfersCount || a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (preference === 'least_walking') {
    finalRoutes.sort((a, b) => a.totalWalkingDistanceMeters - b.totalWalkingDistanceMeters || a.totalDurationMinutes - b.totalDurationMinutes);
  } else if (preference === 'accessible') {
    finalRoutes.sort((a, b) => (b.isFullyAccessible ? 1 : 0) - (a.isFullyAccessible ? 1 : 0) || a.totalDurationMinutes - b.totalDurationMinutes);
  }

  // Tag top routes
  if (finalRoutes[0]) finalRoutes[0].tag = 'Mais Rápida';
  const cheapest = [...finalRoutes].sort((a, b) => a.totalFare - b.totalFare)[0];
  if (cheapest && cheapest.id !== finalRoutes[0]?.id) cheapest.tag = 'Mais Barata';

  const fewestTransfers = [...finalRoutes].sort((a, b) => a.transfersCount - b.transfersCount)[0];
  if (fewestTransfers && fewestTransfers.id !== finalRoutes[0]?.id && fewestTransfers.id !== cheapest?.id) {
    fewestTransfers.tag = 'Menos Baldeações';
  }

  const accessibleRoute = finalRoutes.find(r => r.isFullyAccessible && r.id !== finalRoutes[0]?.id);
  if (accessibleRoute) {
    accessibleRoute.tag = 'Mais Acessível';
  }

  return finalRoutes.slice(0, 5);
}
