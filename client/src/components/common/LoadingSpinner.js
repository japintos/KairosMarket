/**
 * Componente de spinner de carga
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Cargando...',
  fullScreen = false,
  className = ''
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  const spinnerContent = (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
