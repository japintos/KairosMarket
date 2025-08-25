/**
 * Componente para proteger rutas que requieren permisos de administrador
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRoute = ({ children, redirectTo = '/admin/login' }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner fullScreen text="Verificando permisos..." />;
  }

  // Si no está autenticado, redirigir al login de admin
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si no es administrador, mostrar error de acceso denegado
  if (!isAdmin) {
    return (
      <div className="container">
        <div className="page-header">
          <div className="container">
            <h1>Acceso Denegado</h1>
            <p>No tiene permisos para acceder a esta sección</p>
          </div>
        </div>
        <div className="section">
          <div className="container">
            <div className="alert alert-danger">
              <h3>Error 403 - Acceso Denegado</h3>
              <p>
                Lo sentimos, pero no tiene los permisos necesarios para acceder a esta sección del panel administrativo.
              </p>
              <p>
                Si cree que esto es un error, contacte al administrador del sistema.
              </p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => window.history.back()}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es administrador, mostrar el contenido protegido
  return children;
};

export default AdminRoute;
