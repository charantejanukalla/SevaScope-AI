import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Convert to format: [lat, lng, intensity]
    // Supporting both structured {location: {lat, lng}} and flat {latitude, longitude}
    const points = data.map(report => {
      const lat = report.location?.lat || report.latitude;
      const lng = report.location?.lng || report.longitude;
      const intensity = report.severity || 1;
      return [lat, lng, intensity];
    }).filter(p => p[0] !== undefined && p[1] !== undefined);

    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 10,
      max: 5,
      gradient: {
        0.2: '#10B981', // Secondary (Green)
        0.5: '#F59E0B', // Accent (Amber)
        0.8: '#1E3A8A', // Primary (Deep Blue)
        1.0: '#EF4444'  // Critical (Red)
      }
    }).addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, map]);

  return null;
};

export default HeatmapLayer;
