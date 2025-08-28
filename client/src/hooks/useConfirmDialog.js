/**
 * Hook para manejo de diálogos de confirmación
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import { useState, useCallback } from 'react';

export const useConfirmDialog = () => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });

  const showConfirmDialog = useCallback(({
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel
  }) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          onCancel?.();
          resolve(false);
        }
      });
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirmAction = useCallback(async (action, message, type = 'warning') => {
    const confirmed = await showConfirmDialog({
      title: 'Confirmar Acción',
      message,
      type,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      await action();
    }

    return confirmed;
  }, [showConfirmDialog]);

  return {
    confirmDialog,
    showConfirmDialog,
    closeConfirmDialog,
    confirmAction
  };
};
