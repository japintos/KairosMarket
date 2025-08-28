/**
 * Hook personalizado para manejar productos
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

// Hook para obtener productos
export const useProducts = (params = {}) => {
  const queryKey = ['products', JSON.stringify(params)];
  return useQuery({
    queryKey,
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime cambió a gcTime en v5)
    refetchOnWindowFocus: false,
  });
};

// Hook para obtener un producto específico
export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener productos destacados
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para obtener productos con stock bajo
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productService.getLowStockProducts(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (productData) => productService.createProduct(productData),
    {
      onSuccess: () => {
        toast.success('Producto creado correctamente');
        queryClient.invalidateQueries(['products']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear el producto');
      },
    }
  );
};

// Hook para actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, productData }) => productService.updateProduct(id, productData),
    {
      onSuccess: (data, variables) => {
        toast.success('Producto actualizado correctamente');
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['product', variables.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar el producto');
      },
    }
  );
};

// Hook para eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => productService.deleteProduct(id),
    {
      onSuccess: () => {
        toast.success('Producto eliminado correctamente');
        queryClient.invalidateQueries(['products']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al eliminar el producto');
      },
    }
  );
};

// Hook para actualizar stock
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, stockData }) => productService.updateStock(id, stockData),
    {
      onSuccess: (data, variables) => {
        toast.success('Stock actualizado correctamente');
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['product', variables.id]);
        queryClient.invalidateQueries(['products', 'low-stock']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al actualizar el stock');
      },
    }
  );
};

// Hook para búsqueda avanzada
export const useSearchProducts = () => {
  return useMutation(
    (searchData) => productService.searchProducts(searchData),
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error en la búsqueda');
      },
    }
  );
};

// Hook para subir imagen de producto
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ productId, formData }) => productService.uploadImage(productId, formData),
    {
      onSuccess: (data, variables) => {
        toast.success('Imagen subida correctamente');
        queryClient.invalidateQueries(['product', variables.productId]);
        queryClient.invalidateQueries(['products']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al subir la imagen');
      },
    }
  );
};
