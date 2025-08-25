/**
 * Contexto de autenticación para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

// Estado inicial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
    case AUTH_ACTIONS.REGISTER_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      try {
        // Configurar token en las cabeceras de la API
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verificar token con el servidor
        const response = await api.get('/auth/profile');
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.data.user, // ✅ CORREGIDO: Acceder a data.data.user
            token: token
          }
        });
      } catch (error) {
        console.error('Error al verificar token:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    verifyToken();
  }, []);

  // Función de login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data; // ✅ CORREGIDO: Acceder a data.data

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar token en las cabeceras de la API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      toast.success(`¡Bienvenido, ${user.nombre}!`);
      
      // Limpiar cache de queries
      queryClient.clear();

      return { success: true, user }; // ✅ CORREGIDO: Retornar user para verificación de rol
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función de registro
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data; // ✅ CORREGIDO: Acceder a data.data

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar token en las cabeceras de la API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token }
      });

      toast.success('¡Registro exitoso! Bienvenido a Kairos Natural Market');
      
      // Limpiar cache de queries
      queryClient.clear();

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_ERROR,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    // Limpiar cache de queries
    queryClient.clear();
    
    toast.success('Sesión cerrada correctamente');
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: response.data.user
      });

      toast.success('Perfil actualizado correctamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/password', passwordData);
      toast.success('Contraseña cambiada correctamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = !!state.user && !!state.token;

  // Verificar si el usuario es administrador
  const isAdmin = state.user?.rol === 'admin';

  // Verificar si el usuario es vendedor
  const isSeller = state.user?.rol === 'vendedor' || state.user?.rol === 'admin';

  const value = {
    // Estado
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    
    // Funciones
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    // Utilidades
    isAuthenticated,
    isAdmin,
    isSeller
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
