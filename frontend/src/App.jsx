import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import MapPage from './pages/MapPage';
import NeedMap from './pages/NeedMap';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { AuthProvider, AuthContext } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function AppRoutes() {
  return (
    <div className="app-container">
      <Navbar />
      <Toaster position="top-right" />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="NGO">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/submit" element={
            <ProtectedRoute allowedRole="NGO">
              <SubmitReport />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          } />
          
          <Route path="/needmap" element={
            <ProtectedRoute>
              <NeedMap />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
