import polyline from "@mapbox/polyline";

/**
 * Extract unique cities along a route polyline
 * @param {string} encodedPolyline - Google encoded polyline
 * @returns {Promise<string[]>} cities list
 */
export async function getCitiesFromPolyline(encodedPolyline) {
  if (!window.google || !window.google.maps) {
    throw new Error("Google Maps not loaded");
  }

  if (!encodedPolyline) return [];

  // Decode polyline → [ [lat, lng], ... ]
  const points = polyline.decode(encodedPolyline);

  // Sample points (1 every ~15-20 points to save quota)
  const sampledPoints = points.filter((_, i) => i % 20 === 0);

  const geocoder = new window.google.maps.Geocoder();

  const getCity = (lat, lng) => {
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const components = results[0].address_components;

          const cityObj = components.find(c =>
            c.types.includes("locality") ||
            c.types.includes("administrative_area_level_2")
          );

          resolve(cityObj?.long_name || null);
        } else {
          resolve(null);
        }
      });
    });
  };

  // Run geocoding
  const cityPromises = sampledPoints.map(
    ([lat, lng]) => getCity(lat, lng)
  );

  const cities = await Promise.all(cityPromises);

  // Remove null + duplicates
  return [...new Set(cities.filter(Boolean))];
}
