/**
 * Utilidades para el carrito de compras
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

// Normalizar item del carrito para asegurar consistencia
export const normalizeCartItem = (item) => {
  return {
    ...item,
    precio: parseFloat(item.precio) || 0,
    quantity: item.quantity || item.cantidad || 1,
    cantidad: item.quantity || item.cantidad || 1
  };
};

// Calcular precio total de un item
export const calculateItemTotal = (item) => {
  const precio = parseFloat(item.precio) || 0;
  const cantidad = item.quantity || item.cantidad || 1;
  return precio * cantidad;
};

// Calcular subtotal del carrito
export const calculateCartSubtotal = (items) => {
  return items.reduce((total, item) => {
    return total + calculateItemTotal(item);
  }, 0);
};

// Calcular total de items en el carrito
export const calculateCartItemCount = (items) => {
  return items.reduce((total, item) => {
    return total + (item.quantity || item.cantidad || 1);
  }, 0);
};

// Validar item del carrito
export const validateCartItem = (item) => {
  if (!item.id) return false;
  if (!item.nombre) return false;
  if (isNaN(parseFloat(item.precio))) return false;
  if (isNaN(parseInt(item.quantity || item.cantidad || 1))) return false;
  return true;
};

// Limpiar carrito corrupto
export const clearCorruptedCart = () => {
  localStorage.removeItem('kairos_cart');
  console.log('🧹 Carrito corrupto limpiado');
};

// Verificar y reparar carrito
export const repairCart = (cartData) => {
  if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {
    console.log('🔧 Carrito corrupto detectado, limpiando...');
    clearCorruptedCart();
    return {
      items: [],
      total: 0,
      subtotal: 0,
      itemCount: 0
    };
  }

  // Normalizar todos los items
  const normalizedItems = cartData.items
    .filter(validateCartItem)
    .map(normalizeCartItem);

  // Recalcular totales
  const subtotal = calculateCartSubtotal(normalizedItems);
  const itemCount = calculateCartItemCount(normalizedItems);
  const total = subtotal;

  const repairedCart = {
    items: normalizedItems,
    total,
    subtotal,
    itemCount
  };

  // Guardar carrito reparado
  localStorage.setItem('kairos_cart', JSON.stringify(repairedCart));
  
  console.log('🔧 Carrito reparado:', repairedCart);
  return repairedCart;
};
