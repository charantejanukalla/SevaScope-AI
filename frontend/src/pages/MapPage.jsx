import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from '../components/HeatmapLayer';

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports`);
        setReports(res.data);
      } catch (error) {
        console.error('Failed to fetch map data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Intelligence Heatmap</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '15px', height: '15px', background: '#EF4444', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.875rem' }}>High Urgency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '15px', height: '15px', background: '#10B981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.875rem' }}>Low Urgency</span>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: '70vh' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-light)' }}>
            Loading Intelligence Map Engine...
          </div>
        ) : (
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ width: '100%', height: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer data={reports} />
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default React.memo(MapPage);
