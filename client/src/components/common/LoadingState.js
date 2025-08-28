/**
 * Componente de estado de carga mejorado
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaDownload, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import './LoadingState.css';

const LoadingState = ({ 
  message = 'Cargando...', 
  progress = null, 
  type = 'loading',
  size = 'medium',
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <FaSpinner className="loading-icon spin" />;
      case 'uploading':
        return <FaDownload className="loading-icon" />;
      case 'success':
        return <FaCheckCircle className="loading-icon success" />;
      case 'error':
        return <FaExclamationTriangle className="loading-icon error" />;
      default:
        return <FaSpinner className="loading-icon spin" />;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loading-small';
      case 'large':
        return 'loading-large';
      default:
        return 'loading-medium';
    }
  };

  return (
    <motion.div 
      className={`loading-container ${getSizeClass()}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        {showIcon && (
          <div className="loading-icon-container">
            {type === 'loading' ? (
              <LoadingSpinner size={size} />
            ) : (
              getIcon()
            )}
          </div>
        )}
        
        <div className="loading-text">
          <p className="loading-message">{message}</p>
          
          {progress !== null && (
            <div className="loading-progress-container">
              <div className="loading-progress-bar">
                <motion.div 
                  className="loading-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="loading-progress-text">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingState;
