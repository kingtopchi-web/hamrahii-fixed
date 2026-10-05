export const getBrowserCoords = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => reject(err.message)
    );
  });
};


export const getCityFromCoords = async (lat, lng) => {
  return new Promise((resolve, reject) => {

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {

        if (status !== "OK" || !results?.length) {
          reject("Geocode failed");
          return;
        }

        // Find CITY component
        const cityComponent = results[0].address_components.find((c) =>
          c.types.includes("locality")
        );

        resolve(cityComponent?.long_name || null);
      }
    );
  });
};


export const getlocationFromCoords = async (lat, lng) => {
  return new Promise((resolve, reject) => {

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {

        if (status !== "OK" || !results?.length) {
          reject("Geocode failed");
          return;
        }

        // Find CITY component
        const cityComponent = results[0].address_components.find((c) =>
          c.types.includes("locality")
        );

        resolve(results[0]?.formatted_address || null);
      }
    );
  });
};