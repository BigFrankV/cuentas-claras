import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import './App.css';

// Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Componentes de autenticación
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componentes de administración y residentes
import AdminDashboard from './components/admin/AdminDashboard';
import ResidentDashboard from './components/resident/ResidentDashboard';

// Importa los componentes adicionales para residentes
import ResidentMultas from './components/resident/ResidentMultas';

function App() {
  return (
    <ConfigProvider locale={esES}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/resident" 
              element={
                <ProtectedRoute>
                  <ResidentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Nuevas rutas para residentes */}
            <Route
              path="/resident/multas"
              element={
                <ProtectedRoute>
                  <ResidentMultas />
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
