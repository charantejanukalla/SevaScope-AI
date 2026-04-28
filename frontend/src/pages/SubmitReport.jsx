import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, MapPin, Upload, FileJson, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubmitReport = () => {
  // Manual State
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  
  // File Upload State
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLng(position.coords.longitude.toFixed(6));
        },
        () => {
          setError('Unable to retrieve your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reports`, {
        description,
        locationName: locationName || undefined,
        location: (lat && lng) ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        } : undefined
      });
      toast.success('Report submitted successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setManualLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setFileLoading(true);
    const toastId = toast.loading('Uploading and parsing data via AI...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ingest/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Success! Processed ${response.data.recordsProcessed} record(s).`, { id: toastId });
      setFile(null);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process file ingestion', { id: toastId });
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Submit Field Intelligence</h1>
      

      <div className="grid grid-2">
        {/* Bulk Data Upload */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} /> Data Brain Ingestion
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Upload bulk datasets (CSV) or unstructured field intelligence (PDF). AI will automatically structure the data.
          </p>

          <form onSubmit={handleFileUpload}>
            <div style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', backgroundColor: '#F9FAFB' }}>
              <input 
                type="file" 
                accept=".csv, .pdf" 
                id="file-upload" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {file ? (
                  <><FileJson size={32} color="var(--primary)" /> <strong>{file.name}</strong></>
                ) : (
                  <><Upload size={32} color="var(--text-light)" /> <span>Click to select PDF or CSV</span></>
                )}
              </label>
            </div>

            <button type="submit" className="btn btn-secondary" disabled={fileLoading || !file} style={{ width: '100%' }}>
              {fileLoading ? 'AI is Processing Data...' : 'Ingest File Data'}
            </button>
          </form>
        </div>

        {/* Manual Input Form */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Manual Entry
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Provide manual qualitative feedback. AI will categorize and assess severity automatically.
          </p>

          <form onSubmit={handleManualSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Report Description</label>
              <textarea 
                className="input-field" 
                rows={4} 
                placeholder="E.g., Many people are gathered near the river asking for clean drinking water..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Location Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="E.g., Hyderabad, Telangana" 
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Coordinates (Optional if Location Name provided)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  step="any"
                  className="input-field" 
                  placeholder="Lat" 
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  style={{ marginBottom: 0, padding: '0.5rem' }}
                />
                <input 
                  type="number" 
                  step="any"
                  className="input-field" 
                  placeholder="Lng" 
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  style={{ marginBottom: 0, padding: '0.5rem' }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleGetLocation} style={{ padding: '0.5rem', minWidth: '40px' }} title="Get Location">
                  <MapPin size={18} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn" disabled={manualLoading} style={{ width: '100%' }}>
              {manualLoading ? 'AI is Processing...' : <><Send size={18} /> Submit Manually</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;
