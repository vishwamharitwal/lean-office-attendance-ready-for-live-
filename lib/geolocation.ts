// Haversine formula to calculate distance between two coordinates in meters
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Default office location settings
export const DEFAULT_SETTINGS = {
  officeLat: parseFloat(process.env.OFFICE_LAT || "26.9124"),
  officeLng: parseFloat(process.env.OFFICE_LNG || "75.7873"),
  radiusMeters: parseInt(process.env.OFFICE_RADIUS_METERS || "500"),
  strictGeofence: process.env.STRICT_GEOFENCE === "true",
};

// Validate if user is within office radius
export function isWithinOfficeRadius(
  userLat: number,
  userLng: number,
  officeLat: number = DEFAULT_SETTINGS.officeLat,
  officeLng: number = DEFAULT_SETTINGS.officeLng,
  radiusMeters: number = DEFAULT_SETTINGS.radiusMeters
): boolean {
  const distance = haversineDistance(userLat, userLng, officeLat, officeLng);
  return distance <= radiusMeters;
}

// Get distance from office in meters
export function getDistanceFromOffice(
  userLat: number,
  userLng: number,
  officeLat: number = DEFAULT_SETTINGS.officeLat,
  officeLng: number = DEFAULT_SETTINGS.officeLng
): number {
  return haversineDistance(userLat, userLng, officeLat, officeLng);
}
