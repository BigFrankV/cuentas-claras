import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Nuevo estado para manejar errores

  // Verificar token y cargar información del usuario al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          setLoading(true);
          setError(null); // Limpiar errores anteriores
          
          const response = await axios.get('http://localhost:8000/api/usuarios/perfil/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data);
        } catch (error) {
          // Manejo de errores mejorado
          if (error.response) {
            // El servidor respondió con un código de error
            switch (error.response.status) {
              case 401:
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                logout();
                break;
              case 403:
                setError('No tienes permiso para acceder a esta información.');
                break;
              case 500:
                setError('Error en el servidor. Por favor, intenta más tarde.');
                break;
              default:
                setError(`Error al obtener datos del usuario: ${error.response.data.detail || 'Error desconocido'}`);
            }
          } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta
            setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
          } else {
            // Error al configurar la solicitud
            setError(`Error de configuración: ${error.message}`);
          }
          console.error('Error detallado:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Función para iniciar sesión con mejor manejo de errores
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:8000/api/token/', credentials);
      
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setToken(access);
      
      return { success: true, data: response.data };
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        // Mensajes específicos según el error
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Valores del contexto
  const contextValue = {
    token,
    setToken,
    user,
    setUser,
    loading,
    setLoading,
    error, // Exponemos el error en el contexto
    setError, // Permitimos limpiar errores desde componentes
    login, // Nueva función de login
    logout,
    isAuthenticated: !!token,
    isAdmin: user && user.rol === 'admin'
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;