/**
 * Distance helpers for the lat/long columns on events + anytime impacts.
 *
 * Every function takes plain numbers and returns null when either point is missing callers can guard with falsy check
 */

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// straight line distance
export function distanceInMiles(fromLat, fromLng, toLat, toLng) {
  if (
    fromLat == null ||
    fromLng == null ||
    toLat == null ||
    toLng == null
  ) {
    return null;
  }

  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "6.9 mi" — one decimal under 10 miles, whole numbers past that
export function formatDistance(miles) {
  if (miles == null) return null;
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
}

// "Santa Monica, CA" from the split location columns
export function formatPlace(city, state) {
  return [city, state].filter(Boolean).join(", ") || null;
}

// takes the expo-location object MapScreen already uses
export function distanceFromUser(userLocation, item) {
  if (!userLocation?.coords) return null;

  return distanceInMiles(
    userLocation.coords.latitude,
    userLocation.coords.longitude,
    item?.latitude,
    item?.longitude,
  );
}