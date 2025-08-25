/**
 * Hook personalizado para manejar categorías
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/api';
import toast from 'react-hot-toast';

// Hook para obtener categorías
export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para obtener categorías activas
export const useActiveCategories = () => {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoryService.getActiveCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para obtener una categoría específica
export const useCategory = (id) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener productos de una categoría
export const useCategoryProducts = (id, params = {}) => {
  return useQuery({
    queryKey: ['category', id, 'products', params],
    queryFn: () => categoryService.getCategoryProducts(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (categoryData) => categoryService.createCategory(categoryData),
    {
      onSuccess: () => {
        toast.success('Categoría creada correctamente');
        queryClient.invalidateQueries(['categories']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear la categoría');
      },
    }
  );
};

// Hook para actualizar categoría
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, categoryData }) => categoryService.updateCategory(id, categoryData),
    {
      onSuccess: (data, variables) => {
        toast.success('Categoría actualizada correctamente');
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', variables.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar la categoría');
      },
    }
  );
};

// Hook para eliminar categoría
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => categoryService.deleteCategory(id),
    {
      onSuccess: () => {
        toast.success('Categoría eliminada correctamente');
        queryClient.invalidateQueries(['categories']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar la categoría');
      },
    }
  );
};

// Hook para actualizar estado de categoría
export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, status }) => categoryService.updateCategoryStatus(id, status),
    {
      onSuccess: (data, variables) => {
        const statusText = variables.status ? 'activada' : 'desactivada';
        toast.success(`Categoría ${statusText} correctamente`);
        queryClient.invalidateQueries(['categories']);
        queryClient.invalidateQueries(['category', variables.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar el estado de la categoría');
      },
    }
  );
};

// Hook para reordenar categorías
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (orderData) => categoryService.reorderCategories(orderData),
    {
      onSuccess: () => {
        toast.success('Orden de categorías actualizado correctamente');
        queryClient.invalidateQueries(['categories']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al reordenar las categorías');
      },
    }
  );
};

// Hook para obtener estadísticas de categorías
export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['categories', 'stats'],
    queryFn: () => categoryService.getCategoryStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para subir imagen de categoría
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ categoryId, formData }) => categoryService.uploadImage(categoryId, formData),
    {
      onSuccess: (data, variables) => {
        toast.success('Imagen de categoría subida correctamente');
        queryClient.invalidateQueries(['category', variables.categoryId]);
        queryClient.invalidateQueries(['categories']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al subir la imagen de la categoría');
      },
    }
  );
};
