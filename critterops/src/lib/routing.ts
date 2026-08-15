export type GeoPoint = {
  id: string;
  lat: number;
  lng: number;
};

export function haversineMiles(a: GeoPoint, b: GeoPoint) {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function routeDistance(points: GeoPoint[]) {
  let miles = 0;
  for (let i = 1; i < points.length; i += 1) {
    miles += haversineMiles(points[i - 1], points[i]);
  }
  return miles;
}

export function nearestNeighbor(start: GeoPoint, stops: GeoPoint[]) {
  const remaining = [...stops];
  const ordered: GeoPoint[] = [start];
  while (remaining.length) {
    const current = ordered[ordered.length - 1];
    let bestIndex = 0;
    let best = Number.POSITIVE_INFINITY;
    remaining.forEach((stop, index) => {
      const miles = haversineMiles(current, stop);
      if (miles < best) {
        best = miles;
        bestIndex = index;
      }
    });
    ordered.push(remaining.splice(bestIndex, 1)[0]);
  }
  return ordered;
}

export function twoOpt(points: GeoPoint[]) {
  if (points.length < 4) return points;
  const route = [...points];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i += 1) {
      for (let k = i + 1; k < route.length - 1; k += 1) {
        const candidate = route
          .slice(0, i)
          .concat(route.slice(i, k + 1).reverse(), route.slice(k + 1));
        if (routeDistance(candidate) + 0.01 < routeDistance(route)) {
          route.splice(0, route.length, ...candidate);
          improved = true;
        }
      }
    }
  }
  return route;
}

export function optimizeRoute(start: GeoPoint, stops: GeoPoint[]) {
  if (stops.length === 0) {
    return { ordered: [start], totalMiles: 0, legs: [] as number[] };
  }
  const seeded = nearestNeighbor(start, stops);
  const optimized = twoOpt(seeded);
  const legs = optimized.slice(1).map((point, index) =>
    haversineMiles(optimized[index], point)
  );
  return {
    ordered: optimized,
    totalMiles: routeDistance(optimized),
    legs,
  };
}
