// src/contexts/GoogleMapsContext.jsx
import React, { createContext, useContext } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GoogleMapsContext = createContext();

// ✅ MOVE THIS OUTSIDE THE COMPONENT - FIXES THE WARNING
const LIBRARIES = ['places', 'geometry', 'drawing']; // Static array

export const useGoogleMaps = () => useContext(GoogleMapsContext);

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState(null);

  // Your Google Maps API Key - Store in environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";
  
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={LIBRARIES} // ✅ Use the static array
      onLoad={() => {
        setIsLoaded(true);
        // console.log('Google Maps script loaded successfully');
      }}
      onError={(error) => {
        setLoadError(error);
        // console.error('Error loading Google Maps:', error);
      }}
      loadingElement={
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-surface)] z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[var(--border-subtle)] border-t-[#E10600] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#555555]">Loading Google Maps...</p>
          </div>
        </div>
      }
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};


// import React, { createContext, useContext, useEffect, useState } from 'react';

// const GoogleMapsContext = createContext();
// const LIBRARIES = ['places', 'geometry']; // Keep outside component

// export const useGoogleMaps = () => useContext(GoogleMapsContext);

// export const GoogleMapsProvider = ({ children }) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [loadError, setLoadError] = useState(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);

//   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

//   // Check if Google Maps is already loaded globally
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsLoaded(true);
//       console.log('Google Maps already loaded globally');
//       return;
//     }

//     // Load Google Maps script only once
//     if (!scriptLoaded && !window.googleMapsLoading) {
//       window.googleMapsLoading = true;
      
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${LIBRARIES.join(',')}&callback=initGoogleMaps`;
//       script.async = true;
//       script.defer = true;
      
//       window.initGoogleMaps = () => {
//         setIsLoaded(true);
//         setScriptLoaded(true);
//         window.googleMapsLoading = false;
//         console.log('Google Maps script loaded');
//       };
      
//       script.onerror = () => {
//         setLoadError('Failed to load Google Maps');
//         window.googleMapsLoading = false;
//       };
      
//       document.head.appendChild(script);
//       setScriptLoaded(true);
//     }
//   }, [apiKey, scriptLoaded]);

//   // Simple loading component
//   if (!isLoaded && !loadError) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-surface)] z-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-[var(--border-subtle)] border-t-[#E10600] rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-[#555555]">Loading Google Maps...</p>
//         </div>
//       </div>
//     );
//   }

//   if (loadError) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-surface)] z-50">
//         <div className="text-center p-8">
//           <div className="text-[#E10600] text-4xl mb-4">⚠️</div>
//           <h2 className="text-xl font-bold text-[#111111] mb-2">Map Service Unavailable</h2>
//           <p className="text-[#555555] mb-4">Google Maps failed to load. You can still continue without the map.</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-6 py-2 bg-[#E10600] text-white rounded-lg hover:bg-[#C10500]"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
//       {children}
//     </GoogleMapsContext.Provider>
//   );
// };