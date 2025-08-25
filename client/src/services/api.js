/**
 * Servicio de API para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Crear instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log de responses en desarrollo
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });

    return response;
  },
  (error) => {
    // Log de errores
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Manejar diferentes tipos de errores
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          
          // ✅ CORREGIDO: Redirigir según el contexto
          const currentPath = window.location.pathname;
          if (currentPath.includes('/admin')) {
            // Si estamos en admin, redirigir a login de admin
            if (!currentPath.includes('/admin/login')) {
              window.location.href = '/admin/login';
            }
          } else {
            // Si estamos en frontend, redirigir a login normal
            if (!currentPath.includes('/login')) {
              window.location.href = '/login';
            }
          }
          
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          break;

        case 403:
          toast.error('No tiene permisos para realizar esta acción');
          break;

        case 404:
          toast.error('Recurso no encontrado');
          break;

        case 422:
          // Errores de validación
          const validationErrors = data.errors || data.details;
          if (validationErrors && Array.isArray(validationErrors)) {
            validationErrors.forEach(err => {
              toast.error(err.message || 'Error de validación');
            });
          } else {
            toast.error(data.message || 'Error de validación');
          }
          break;

        case 429:
          toast.error('Demasiadas solicitudes. Por favor, intente nuevamente más tarde.');
          break;

        case 500:
          toast.error('Error interno del servidor. Por favor, intente nuevamente.');
          break;

        default:
          toast.error(data.message || 'Error en la solicitud');
      }
    } else if (error.request) {
      // Error de red
      toast.error('Error de conexión. Verifique su conexión a internet.');
    } else {
      // Error en la configuración
      toast.error('Error en la configuración de la solicitud');
    }

    return Promise.reject(error);
  }
);

// Funciones helper para diferentes tipos de requests
export const apiService = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Download file
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    });
  }
};

// Servicios específicos por módulo
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  getUsers: (params) => api.get('/auth/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/auth/users/${userId}/status`, { activo: status }),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`)
};

export const productService = {
  getProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data?.data?.products || [];
  },
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data?.data?.product;
  },
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data?.data?.products || [];
  },
  getLowStockProducts: async () => {
    const response = await api.get('/products/low-stock');
    return response.data?.data?.products || [];
  },
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stockData) => api.put(`/products/${id}/stock`, stockData),
  searchProducts: (searchData) => api.post('/products/search/advanced', searchData),
  uploadImage: (productId, formData) => api.upload(`/products/${productId}/image`, formData)
};

export const categoryService = {
  getCategories: async (params) => {
    const response = await api.get('/categories', { params });
    return response.data?.data?.categories || [];
  },
  getActiveCategories: async () => {
    const response = await api.get('/categories/active');
    return response.data?.data?.categories || [];
  },
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data?.data?.category;
  },
  getCategoryProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  updateCategoryStatus: (id, status) => api.put(`/categories/${id}/status`, { activo: status }),
  reorderCategories: (orderData) => api.put('/categories/reorder', orderData),
  getCategoryStats: () => api.get('/categories/stats/overview'),
  uploadImage: (categoryId, formData) => api.upload(`/categories/${categoryId}/image`, formData)
};

export const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  getCustomerOrders: (customerId, params) => api.get(`/orders/customer/${customerId}`, { params }),
  getOrderStats: () => api.get('/orders/stats/overview')
};

export const customerService = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (customerData) => api.post('/customers', customerData),
  updateCustomer: (id, customerData) => api.put(`/customers/${id}`, customerData),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  getCustomerOrders: (id, params) => api.get(`/customers/${id}/orders`, { params }),
  getCustomerFavorites: (id) => api.get(`/customers/${id}/favorites`),
  addToFavorites: (customerId, productId) => api.post(`/customers/${customerId}/favorites/${productId}`),
  removeFromFavorites: (customerId, productId) => api.delete(`/customers/${customerId}/favorites/${productId}`),
  getCustomerStats: () => api.get('/customers/stats/overview')
};

export const paymentService = {
  createPreference: (preferenceData) => api.post('/payments/create-preference', preferenceData),
  getPreference: (id) => api.get(`/payments/preference/${id}`),
  getPayment: (id) => api.get(`/payments/payment/${id}`),
  processWebhook: (webhookData) => api.post('/payments/webhook', webhookData),
  getOrderPayments: (orderId) => api.get(`/payments/orders/${orderId}`),
  processRefund: (paymentId, refundData) => api.post(`/payments/refund/${paymentId}`, refundData),
  getPaymentStats: () => api.get('/payments/stats/overview'),
  getPaymentConfig: () => api.get('/payments/config')
};

export const contactService = {
  submitContact: (contactData) => api.post('/contact', contactData),
  getContacts: (params) => api.get('/contact', { params }),
  getUnreadContacts: () => api.get('/contact/unread'),
  getContact: (id) => api.get(`/contact/${id}`),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  respondToContact: (id, responseData) => api.put(`/contact/${id}/response`, responseData),
  deleteContact: (id) => api.delete(`/contact/${id}`),
  bulkMarkAsRead: (ids) => api.put('/contact/bulk-read', { ids }),
  bulkDelete: (ids) => api.put('/contact/bulk-delete', { ids }),
  getContactStats: () => api.get('/contact/stats/overview')
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getCashMovements: (params) => api.get('/admin/cash', { params }),
  registerCashMovement: (movementData) => api.post('/admin/cash', movementData),
  getCashSummary: (params) => api.get('/admin/cash/summary', { params }),
  getSalesReport: (params) => api.get('/admin/reports/sales', { params }),
  getInventoryReport: (params) => api.get('/admin/reports/inventory', { params }),
  getCustomerReport: (params) => api.get('/admin/reports/customers', { params }),
  exportReport: (type, params) => api.download(`/admin/reports/${type}/export`, { params })
};

export const couponService = {
  validateCoupon: (code) => api.get(`/coupons/validate/${code}`),
  getCoupons: (params) => api.get('/coupons', { params }),
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`)
};

// Exportar la instancia de axios por defecto
export default api;
