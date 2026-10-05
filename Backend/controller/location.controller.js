import axios from "axios";

export const handleGetLocationSuggestion = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        message: "Empty or invalid query",
        error: true,
        success: false,
      });
    }

    let suggetions = [];
    try {
      const response = await axios.get(
        `${process.env.BKWRDFRWRDGEOCODING}/search`, {
        timeout: 3000,
        params: {
          q: query.trim(),
          format: "json",
          addressdetails: 1,
          limit: 12,
          polygon_geojson: 0,
          dedupe: 1,
          extratags: 1,
          namedetails: 1,
          countrycodes: "in",     
          street: 1,              
          city: 1,
        }
      });
      if (response.data && response.data.length > 0) {
        suggetions = response.data;
      }
    } catch (err) {
      console.error("Primary geocoder failed:", err.message);
    }

    if (suggetions.length === 0) {
      try {
        const photonRes = await axios.get("https://photon.komoot.io/api/", {
          timeout: 3000,
          params: { q: query.trim(), limit: 12, lat: 20.5937, lon: 78.9629 } 
        });
        if (photonRes.data && photonRes.data.features) {
          suggetions = photonRes.data.features.map(f => {
            const props = f.properties;
            const displayName = [props.name, props.street, props.city, props.state, props.country].filter(Boolean).join(", ");
            return {
              place_id: props.osm_id || Math.random().toString(),
              display_name: displayName,
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              address: {
                city: props.city || props.town || props.village,
                state: props.state,
                country: props.country
              }
            };
          });
        }
      } catch (err) {
        console.error("Photon API fallback failed:", err.message);
      }
    }

    // Tertiary Fallback: Nominatim OSM
    if (suggetions.length === 0) {
      try {
        const nomRes = await axios.get("https://nominatim.openstreetmap.org/search", {
          timeout: 4000,
          headers: { 'User-Agent': 'HamrahiApp/1.0' },
          params: { q: query.trim(), format: "json", addressdetails: 1, limit: 12, countrycodes: "in" }
        });
        if (nomRes.data && nomRes.data.length > 0) {
          suggetions = nomRes.data;
        }
      } catch (err) {
        console.error("Nominatim OSM fallback failed:", err.message);
      }
    }

    return res.status(200).json({
      message: "These are suggetions",
      error: false,
      success: true,
      suggetions: suggetions,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetLocationByCordinates = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude required",
        error: true,
        success: false,
      });
    }

    let location = null;

    // Primary Geocoder
    try {
      const response = await axios.get(
        `${process.env.BKWRDFRWRDGEOCODING}/reverse`, {
        timeout: 4000,
        params: { lat: latitude, lon: longitude, format: "json", addressdetails: 1, zoom: 18 }
      });
      if (response.data && response.data.display_name) {
        const addr = response.data.address || {};
        const isDetailed = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || addr.building || addr.village;
        if (isDetailed) {
          location = response.data;
        } else {
          console.warn("Primary geocoder returned a broad location, falling back to Photon.");
        }
      }
    } catch (err) {
      console.error("Primary reverse geocoder failed:", err.message);
    }

    // Fallback 1: Photon Komoot (Often provides better POI/street matching)
    if (!location) {
      try {
        const photonRes = await axios.get("https://photon.komoot.io/reverse", {
          timeout: 4000,
          params: { lat: latitude, lon: longitude }
        });
        if (photonRes.data && photonRes.data.features && photonRes.data.features.length > 0) {
          const props = photonRes.data.features[0].properties;
          const display_name = [
            props.name, props.street, props.locality, props.district, props.city, props.state, props.postcode, props.country
          ].filter(Boolean).join(", ");
          
          location = {
            display_name,
            address: props
          };
        }
      } catch (err) {
        console.error("Photon reverse fallback failed:", err.message);
      }
    }

    // Fallback 2: Nominatim OSM
    if (!location) {
      try {
        const nomRes = await axios.get("https://nominatim.openstreetmap.org/reverse", {
          timeout: 4000,
          headers: { 'User-Agent': 'HamrahiApp/1.0' },
          params: { lat: latitude, lon: longitude, format: "json", addressdetails: 1, zoom: 18 }
        });
        if (nomRes.data && nomRes.data.display_name) {
          location = nomRes.data;
        }
      } catch (err) {
        console.error("Nominatim reverse fallback failed:", err.message);
      }
    }

    if (!location) {
      return res.status(404).json({
        message: "Reverse geocoding failed",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      message: "Location updated",
      error: false,
      success: true,
      location
    });
  } catch (error) {
    next(error);
  }
};