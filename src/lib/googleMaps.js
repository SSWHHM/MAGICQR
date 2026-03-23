let loadPromise = null;

export function getGoogleLibrary(libraryName) {
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      console.log('Maps key loaded:', !!apiKey);
      
      if (!apiKey) {
        reject(new Error('VITE_GOOGLE_MAPS_API_KEY is missing from .env'));
        return;
      }

      // If already loaded, resolve immediately
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }

      // Define callback before injecting script
      window.__googleMapsCallback = () => {
        resolve(window.google.maps);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=__googleMapsCallback&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Google Maps script failed to load'));
      document.head.appendChild(script);
    });
  }
  
  return loadPromise.then(async () => {
    return await google.maps.importLibrary(libraryName);
  });
}
