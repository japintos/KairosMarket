/**
 * Contexto del carrito de compras para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { repairCart, normalizeCartItem, calculateItemTotal } from '../utils/cartUtils';

// Estado inicial
const getInitialState = () => {
  const savedCart = localStorage.getItem('kairos_cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      return repairCart(parsedCart);
    } catch (error) {
      console.error('Error al parsear carrito:', error);
      localStorage.removeItem('kairos_cart');
    }
  }
  return {
    items: [],
    total: 0,
    subtotal: 0,
    itemCount: 0
  };
};

// Tipos de acciones
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON'
};

// Reducer
const cartReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        // Actualizar cantidad si el producto ya existe
        const currentQuantity = existingItem.quantity || existingItem.cantidad || 1;
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: currentQuantity + quantity }
              : item
          )
        };
      } else {
        // Agregar nuevo producto
        const normalizedProduct = normalizeCartItem({ ...product, quantity });
        newState = {
          ...state,
          items: [...state.items, normalizedProduct]
        };
      }
      break;
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== productId)
      };
      break;
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        newState = {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      } else {
        // Actualizar cantidad
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, quantity, cantidad: quantity } // Mantener ambas propiedades por compatibilidad
              : item
          )
        };
      }
      break;
    }

    case CART_ACTIONS.CLEAR_CART:
      newState = {
        items: [],
        total: 0,
        subtotal: 0,
        itemCount: 0,
        coupon: null,
        discount: 0
      };
      break;

    case CART_ACTIONS.LOAD_CART:
      newState = action.payload;
      break;

    case CART_ACTIONS.APPLY_COUPON:
      newState = {
        ...state,
        coupon: action.payload.coupon,
        discount: action.payload.discount
      };
      break;

    case CART_ACTIONS.REMOVE_COUPON:
      newState = {
        ...state,
        coupon: null,
        discount: 0
      };
      break;

    default:
      return state;
  }

  // Calcular totales usando utilidades
  const itemCount = newState.items.reduce((total, item) => total + (item.quantity || item.cantidad || 1), 0);
  const subtotal = newState.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  const discount = newState.discount || 0;
  const total = Math.max(0, subtotal - discount);

  return {
    ...newState,
    itemCount,
    subtotal,
    total
  };
};

// Crear contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Persistir carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('kairos_cart', JSON.stringify(state));
  }, [state]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('kairos_cart');
    if (savedCart) {
      dispatch({
        type: CART_ACTIONS.LOAD_CART,
        payload: JSON.parse(savedCart)
      });
    }
  }, []);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    // Verificar stock disponible
    if (product.stock < quantity) {
      toast.error(`Solo hay ${product.stock} unidades disponibles de ${product.nombre}`);
      return false;
    }

    // Verificar si ya está en el carrito y no exceder stock
    const existingItem = state.items.find(item => item.id === product.id);
    if (existingItem && (existingItem.quantity + quantity) > product.stock) {
      toast.error(`No puedes agregar más de ${product.stock} unidades de ${product.nombre}`);
      return false;
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });

    toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.nombre} agregada${quantity === 1 ? '' : 's'} al carrito`);
    return true;
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    const item = state.items.find(item => item.id === productId);
    if (item) {
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { productId }
      });
      toast.success(`${item.nombre} removido del carrito`);
    }
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    const item = state.items.find(item => item.id === productId);
    
    if (!item) return false;

    // Verificar stock disponible
    if (quantity > item.stock) {
      toast.error(`Solo hay ${item.stock} unidades disponibles de ${item.nombre}`);
      return false;
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });

    if (quantity === 0) {
      toast.success(`${item.nombre} removido del carrito`);
    } else {
      toast.success(`Cantidad de ${item.nombre} actualizada a ${quantity}`);
    }

    return true;
  };

  // Limpiar carrito
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Carrito vaciado correctamente');
  };

  // Aplicar cupón de descuento
  const applyCoupon = async (couponCode) => {
    try {
      // Aquí se haría la llamada a la API para validar el cupón
      // Por ahora simulamos la respuesta
      const response = await fetch(`/api/coupons/validate/${couponCode}`);
      const data = await response.json();

      if (data.valid) {
        const discount = (state.subtotal * data.discountPercentage) / 100;
        
        dispatch({
          type: CART_ACTIONS.APPLY_COUPON,
          payload: {
            coupon: data.coupon,
            discount: Math.min(discount, data.maxDiscount || discount)
          }
        });

        toast.success(`Cupón aplicado: ${data.discountPercentage}% de descuento`);
        return true;
      } else {
        toast.error(data.message || 'Cupón inválido');
        return false;
      }
    } catch (error) {
      toast.error('Error al aplicar el cupón');
      return false;
    }
  };

  // Remover cupón
  const removeCoupon = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_COUPON });
    toast.success('Cupón removido');
  };

  // Calcular costo de envío
  const calculateShipping = (address) => {
    // Lógica simplificada para calcular envío
    // En producción, esto se calcularía con la API de MercadoPago o similar
    const baseShipping = 500; // $5.00 base
    const weightShipping = state.items.reduce((total, item) => {
      return total + (item.peso || 0.1) * (item.quantity || 1);
    }, 0) * 100; // $1.00 por 100g

    return Math.round(baseShipping + weightShipping);
  };

  // Obtener total con envío
  const getTotalWithShipping = (shippingCost = 0) => {
    return state.total + shippingCost;
  };

  // Verificar si el carrito está vacío
  const isEmpty = state.items.length === 0;

  // Obtener productos con stock bajo
  const getLowStockItems = () => {
    return state.items.filter(item => (item.quantity || 1) > item.stock);
  };

  // Verificar si hay productos con stock insuficiente
  const hasLowStockItems = getLowStockItems().length > 0;

  const value = {
    // Estado
    items: state.items,
    total: state.total,
    subtotal: state.subtotal,
    itemCount: state.itemCount,
    coupon: state.coupon,
    discount: state.discount,
    loading: false, // Para compatibilidad con App.js
    
    // Funciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    calculateShipping,
    getTotalWithShipping,
    
    // Utilidades
    isEmpty,
    hasLowStockItems,
    getLowStockItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
