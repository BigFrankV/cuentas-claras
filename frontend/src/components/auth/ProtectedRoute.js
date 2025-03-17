import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si la ruta es solo para administradores y el usuario no es admin, redirigir al dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // Si pasa todas las verificaciones, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;
