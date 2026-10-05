import { useEffect, useRef } from 'react';
import Axios from '../services/axios';
import { toast } from 'react-toastify';

const useLiveLocationTracker = (isActive) => {
  const watchIdRef = useRef(null);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    // We only track when isActive is true (i.e. rider has an active delivery)
    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        // Optionally turn off live location in DB
        Axios.post('/user/toggle-live-location', { liveLocationEnabled: false }).catch(() => {});
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.warn("Geolocation is not supported by your browser");
      return;
    }

    // First, ensure live location is enabled in the backend for this user
    Axios.post('/user/toggle-live-location', { liveLocationEnabled: true })
      .catch((err) => console.warn("Could not enable live location:", err));

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const now = Date.now();
        
        // Throttle updates to at most once every 5 seconds to prevent spamming the backend
        if (now - lastSyncRef.current < 5000) return;
        
        lastSyncRef.current = now;

        try {
          await Axios.post('/user/update-live-location', {
            latitude,
            longitude,
            accuracy
          });
        } catch (err) {
          console.warn("Failed to sync live location:", err);
        }
      },
      (err) => {
        console.warn("Geolocation watch error:", err);
        if (err.code === 1) {
          toast.warn("Please allow location access to track deliveries accurately.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // Accept cached position up to 10 seconds old
        timeout: 10000     // Timeout after 10 seconds
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive]);
};

export default useLiveLocationTracker;
