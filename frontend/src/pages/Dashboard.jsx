import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { AlertCircle, FileText, TrendingUp, MapPin, Activity, HelpCircle } from 'lucide-react';

const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState({});

  const handleDispatch = async (areaInfo) => {
    const key = `${areaInfo.lat}-${areaInfo.lng}`;
    setDispatching(prev => ({ ...prev, [key]: true }));
    const toastId = toast.loading('Dispatching volunteers...');
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/volunteers/sync`, {
        lat: areaInfo.lat,
        lng: areaInfo.lng,
        avg_severity: areaInfo.avg_severity || 4,
        primaryNeed: areaInfo.primaryNeed || 'general aid',
        priorityLevel: areaInfo.priorityLevel || 'HIGH'
      });
      toast.success('Volunteers notified successfully', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Dispatch failed', { id: toastId });
    } finally {
      setDispatching(prev => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, insightsRes, recsRes, trendsRes, explRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/reports`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/insights/priority`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/insights/recommendations`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/insights/trends`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/insights/explanations`)
        ]);
        
        setReports(reportsRes.data);
        setInsights(insightsRes.data);
        setRecommendations(recsRes.data);
        setTrends(trendsRes.data);
        setExplanations(explRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryData = () => {
    const counts = { health: 0, food: 0, water: 0, shelter: 0, other: 0 };
    reports.forEach(r => {
      if (counts[r.category] !== undefined) counts[r.category]++;
      else counts.other++;
    });
    
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key]
    })).filter(item => item.value > 0);
  };

  if (loading) return <div className="container">Loading intelligence data...</div>;

  const categoryData = getCategoryData();

  return (
    <div>
      <h1 className="page-title">Resource Intelligence Dashboard</h1>
      
      <div className="grid grid-3">
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" /> Total Reports
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginTop: '1rem' }}>{reports.length}</h2>
        </div>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--secondary)" /> Critical Zones
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginTop: '1rem' }}>
            {insights.filter(i => i.priorityLevel === 'HIGH').length}
          </h2>
        </div>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="var(--accent)" /> Average Severity
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginTop: '1rem' }}>
            {(reports.reduce((acc, curr) => acc + curr.severity, 0) / (reports.length || 1)).toFixed(1)} / 5
          </h2>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>Decision Intelligence Engine</h2>
      <div className="grid grid-3">
        
        <div className="card" style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Trend Analysis
          </h3>
          {trends.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {trends.map((t, idx) => (
                <li key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>{t.area}</strong>
                    <span style={{ 
                      color: t.trend === 'increasing' ? '#EF4444' : t.trend === 'decreasing' ? '#10B981' : '#6B7280',
                      fontWeight: 'bold' 
                    }}>
                      {t.change}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    Category: {t.category} | Trend: {t.trend}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-light)' }}>Not enough data to calculate trends.</p>}
        </div>

        <div className="card" style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Recommendations
          </h3>
          {recommendations.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {recommendations.map((rec, idx) => (
                <li key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rec.action.includes('URGENT') ? '#EF4444' : 'var(--primary)', marginTop: '0.4rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{rec.action}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-light)' }}>No intelligence data available.</p>}
        </div>

        <div className="card" style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={20} /> Explanations
          </h3>
          {explanations.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {explanations.map((exp, idx) => (
                <li key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                    {exp.explanation}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-light)' }}>No priority explanations generated.</p>}
        </div>

      </div>

      <div className="card mt-4">
        <h3 className="card-title">Priority Heat Zones</h3>
        <div className="grid grid-3">
          {insights.map((insight, idx) => (
            <div key={idx} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Zone: {insight.lat}, {insight.lng}</strong>
                <span className={`badge ${insight.priorityLevel}`}>{insight.priorityLevel}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                Primary Need: <strong>{insight.primaryNeed.toUpperCase()}</strong>
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <span>Reports: {insight.details.total_reports}</span>
                <span>Avg Severity: {insight.avg_severity.toFixed(1)}</span>
              </div>
              {/* TODO: Not Ready Yet
              {insight.priorityLevel === 'HIGH' && (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
                  onClick={() => handleDispatch(insight)}
                  disabled={dispatching[`${insight.lat}-${insight.lng}`]}
                >
                  {dispatching[`${insight.lat}-${insight.lng}`] ? 'Deploying...' : 'Deploy Now'}
                </button>
              )}
              */}
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="card-title">Category Distribution</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
