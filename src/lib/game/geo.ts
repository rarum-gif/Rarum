import { geoNaturalEarth1 } from "d3-geo";

/** Feste Kartenprojektion – identisch im Kartenskript und im Spiel */
export const MAP_W = 1000;
export const MAP_H = 520;

export function worldProjection() {
  return geoNaturalEarth1().scale(183).translate([MAP_W / 2, MAP_H / 2 + 8]).precision(0.2);
}

/** Grosskreis-Entfernung in Kilometern */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** 100 Punkte bis 25 km, danach sanft fallend (≈ 50 Punkte bei 650 km) */
export function geoPoints(km: number) {
  if (km <= 25) return 100;
  return Math.max(0, Math.round(100 * Math.exp(-(km - 25) / 900)));
}
