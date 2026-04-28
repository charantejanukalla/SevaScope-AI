import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Filter, RefreshCw } from 'lucide-react';

// Custom Heatmap Layer Component for React-Leaflet
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 10,
      max: 5, // Since severity is max 5
      gradient: {
        0.2: '#10B981', // Secondary (Green) - Low urgency
        0.5: '#F59E0B', // Accent (Amber) - Medium urgency
        0.8: '#1E3A8A', // Primary (Deep Blue) - High urgency
        1.0: '#EF4444'  // Red - Critical
      }
    }).addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [points, map]);

  return null;
};

const NeedMap = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [filterCategory, setFilterCategory] = useState('all');
  const [minSeverity, setMinSeverity] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHeatmapData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/heatmap`);
      setReports(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    // Real-time polling every 10 seconds
    const intervalId = setInterval(fetchHeatmapData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredPoints = useMemo(() => {
    return reports
      .filter(r => filterCategory === 'all' || r.category === filterCategory)
      .filter(r => r.severity >= minSeverity)
      .map(r => [r.latitude, r.longitude, r.severity]);
  }, [reports, filterCategory, minSeverity]);

  const categories = ['health', 'food', 'water', 'shelter', 'other'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Operational NeedMap</h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Live Tracking (Updated: {lastUpdated.toLocaleTimeString()})
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Filter Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0, overflowY: 'auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1.1rem' }}>
            <Filter size={18} /> Filters
          </h3>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Resource Category</label>
            <select 
              className="input-field" 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Minimum Severity (1-5)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={minSeverity}
                onChange={e => setMinSeverity(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{minSeverity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: '500' }}>Active Reports</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {filteredPoints.length}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#E5E7EB' }}>
          {loading && reports.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-light)' }}>
              Initializing Geospatial Engine...
            </div>
          ) : (
            <MapContainer 
              center={[20.5937, 78.9629]} 
              zoom={5} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <HeatmapLayer points={filteredPoints} />
            </MapContainer>
          )}
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NeedMap;
