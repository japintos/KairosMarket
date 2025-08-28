/**
 * Hook para manejo de foco en modales - Accesibilidad
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import { useEffect, useRef } from 'react';

export const useModalFocus = (isOpen) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento que tenía el foco antes de abrir el modal
      previousFocusRef.current = document.activeElement;
      
      // Enfocar el modal
      modalRef.current?.focus();
      
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
      
      // Agregar listener para tecla Escape
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          // Cerrar modal (esto debe ser manejado por el componente padre)
          e.preventDefault();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restaurar el foco al elemento anterior
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return modalRef;
};
