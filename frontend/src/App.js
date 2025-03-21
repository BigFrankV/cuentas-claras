import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ResidentDashboard from './components/resident/ResidentDashboard';
import ResidentMultas from './components/resident/ResidentMultas';
import ResidentGastoComun from './components/resident/ResidentGastoComun';
import ResidentProfile from './components/resident/ResidentProfile';
import ResidentAyuda from './components/resident/ResidentAyuda';
import ResidentResumen from './components/resident/ResidentResumen';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={esES}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas - Residente */}
            <Route 
              path="/resident" 
              element={
                <ProtectedRoute>
                  <ResidentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident/gastocomun" 
              element={
                <ProtectedRoute>
                  <ResidentGastoComun />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident/profile" 
              element={
                <ProtectedRoute>
                  <ResidentProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident/multas" 
              element={
                <ProtectedRoute>
                  <ResidentMultas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident/ayuda" 
              element={
                <ProtectedRoute>
                  <ResidentAyuda />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resident/resumen" 
              element={
                <ProtectedRoute>
                  <ResidentResumen />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas protegidas - Administrador */}

            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
