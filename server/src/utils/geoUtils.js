/**
 * Calculate distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Filter shops that are within a given radius of a point.
 * @param {Array} shops - Array of shop objects with latitude/longitude
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusKm - Search radius in km
 * @returns {Array} Shops within radius, sorted by distance (with distance_km attached)
 */
const filterNearbyShops = (shops, lat, lng, radiusKm = 15) => {
  return shops
    .map((shop) => {
      const distance = haversineDistance(
        lat, lng,
        parseFloat(shop.latitude),
        parseFloat(shop.longitude)
      );
      return { ...shop, distance_km: Math.round(distance * 10) / 10 };
    })
    .filter((shop) => shop.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
};

module.exports = { haversineDistance, filterNearbyShops };
