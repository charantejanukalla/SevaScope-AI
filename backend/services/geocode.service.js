const axios = require('axios');

// Simple delay function to handle rate limiting for multiple records
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const getCoordinatesFromLocation = async (locationName) => {
  try {
    // Rate limit handling: add a small delay before calling Nominatim API
    // Nominatim asks for max 1 request per second
    await delay(1000);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
    
    // Add a user agent to comply with Nominatim's usage policy
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SevaScopeAI/1.0 (contact@sevascope.ai)'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding failed for "${locationName}":`, error.message);
    return null;
  }
};

module.exports = { getCoordinatesFromLocation };
