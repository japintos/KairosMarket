/**
 * Componente de diálogo de confirmación para acciones críticas
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  type = 'warning', 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  onConfirm, 
  onCancel,
  onClose 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FaExclamationTriangle className="confirm-icon danger" />;
      case 'success':
        return <FaCheckCircle className="confirm-icon success" />;
      case 'info':
        return <FaInfoCircle className="confirm-icon info" />;
      default:
        return <FaExclamationTriangle className="confirm-icon warning" />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="confirm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar diálogo de confirmación"
      >
        <motion.div
          className={`confirm-dialog ${type}`}
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          <div className="confirm-header">
            <div className="confirm-icon-container">
              {getIcon()}
            </div>
            <h2 id="confirm-title" className="confirm-title">
              {title}
            </h2>
            <button
              className="confirm-close"
              onClick={onClose}
              aria-label="Cerrar diálogo"
            >
              <FaTimes />
            </button>
          </div>

          <div className="confirm-body">
            <p id="confirm-message" className="confirm-message">
              {message}
            </p>
          </div>

          <div className="confirm-actions">
            <button
              className="confirm-btn cancel-btn"
              onClick={handleCancel}
              aria-label="Cancelar acción"
            >
              {cancelText}
            </button>
            <button
              className={`confirm-btn confirm-btn-${type}`}
              onClick={handleConfirm}
              aria-label="Confirmar acción"
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
