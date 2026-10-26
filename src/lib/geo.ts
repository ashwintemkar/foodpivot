import type { UserPreferences } from "./memory";

export type GeoPoint = { lat: number; lng: number };

export type Neighborhood = GeoPoint & { name: string };

export const MAX_DELIVERY_KM = 7;
export const FALLBACK_DELIVERY_KM = 12;

export const neighborhoods: Neighborhood[] = [
  { name: "Jubilee Hills", lat: 17.4239, lng: 78.407 },
  { name: "Banjara Hills", lat: 17.415, lng: 78.4346 },
  { name: "Film Nagar", lat: 17.4158, lng: 78.4095 },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915 },
  { name: "Hitech City", lat: 17.4486, lng: 78.3821 },
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  { name: "Kondapur", lat: 17.4622, lng: 78.3648 },
  { name: "Ameerpet", lat: 17.4375, lng: 78.4483 },
  { name: "Somajiguda", lat: 17.4244, lng: 78.4576 },
  { name: "Mehdipatnam", lat: 17.394, lng: 78.438 },
  { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { name: "Charminar", lat: 17.3616, lng: 78.4747 },
];

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function nearestNeighborhood(point: GeoPoint) {
  return neighborhoods
    .map((place) => ({ place, km: haversineKm(point, place) }))
    .sort((a, b) => a.km - b.km)[0];
}

export function resolveOrigin(prefs: UserPreferences): GeoPoint & { label: string } {
  if (typeof prefs.lat === "number" && typeof prefs.lng === "number") {
    const snapped = nearestNeighborhood({ lat: prefs.lat, lng: prefs.lng });
    return { lat: prefs.lat, lng: prefs.lng, label: prefs.location || `${snapped.place.name}, Hyderabad` };
  }
  const lower = prefs.location.toLowerCase();
  const match = neighborhoods.find((place) => lower.includes(place.name.toLowerCase()));
  const origin = match ?? neighborhoods[0];
  return { ...origin, label: prefs.location || `${origin.name}, Hyderabad` };
}

export function formatKm(km: number) {
  if (km < 0.15) return "nearby";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function etaMinutes(km: number, kitchenMinutes: number) {
  return Math.max(kitchenMinutes, Math.round(12 + km * 4.2 + Math.max(0, kitchenMinutes - 22) * 0.35));
}

export function locationLabel(name: string) {
  return `${name}, Hyderabad`;
}
