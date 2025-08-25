/**
 * Página del carrito de compras - CartPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaLeaf } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    loading 
  } = useCart();

  const [updatingItem, setUpdatingItem] = useState(null);

  // Calcular totales
  const subtotal = items.reduce((total, item) => {
    const precio = parseFloat(item.precio) || 0;
    const cantidad = item.quantity || item.cantidad || 1;
    return total + (precio * cantidad);
  }, 0);

  const shippingCost = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shippingCost;

  // Actualizar cantidad
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
      toast.success('Cantidad actualizada');
    } catch (error) {
      toast.error('Error al actualizar cantidad');
    } finally {
      setUpdatingItem(null);
    }
  };

  // Eliminar item
  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  // Vaciar carrito
  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      try {
        await clearCart();
        toast.success('Carrito vaciado');
      } catch (error) {
        toast.error('Error al vaciar carrito');
      }
    }
  };

  // Continuar comprando
  const handleContinueShopping = () => {
    navigate('/catalogo');
  };

  // Ir al checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Carrito de Compras - Kairos Natural Market</title>
        <meta name="description" content="Revisa tu carrito de compras y procede al checkout" />
      </Helmet>

      <div className="cart-page">
        <div className="container">
          {/* Header */}
          <div className="cart-header">
            <h1>Carrito de Compras</h1>
            <p>{items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito</p>
          </div>

          {items.length === 0 ? (
            /* Carrito vacío */
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <FaShoppingCart />
              </div>
              <h2>Tu carrito está vacío</h2>
              <p>Agrega algunos productos para comenzar tu compra</p>
              <button 
                className="btn-primary"
                onClick={handleContinueShopping}
              >
                <FaArrowLeft />
                Continuar Comprando
              </button>
            </div>
          ) : (
            /* Contenido del carrito */
            <div className="cart-content">
              {/* Lista de productos */}
              <div className="cart-items">
                <div className="cart-items-header">
                  <h2>Productos</h2>
                  <button 
                    className="clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    <FaTrash />
                    Vaciar Carrito
                  </button>
                </div>

                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Imagen del producto */}
                      <div className="item-image">
                        <img src={item.imagen} alt={item.nombre} />
                      </div>

                      {/* Información del producto */}
                      <div className="item-info">
                        <h3>{item.nombre}</h3>
                        <p className="item-category">{item.categoria_nombre}</p>
                        {item.formato && (
                          <p className="item-format">Formato: {item.formato}</p>
                        )}
                        <p className="item-price">${(parseFloat(item.precio) || 0).toFixed(2)}</p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="item-quantity">
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || item.cantidad || 1) - 1)}
                            disabled={updatingItem === item.id || (item.quantity || item.cantidad || 1) <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity || item.cantidad || 1}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || item.cantidad || 1) + 1)}
                            disabled={updatingItem === item.id || (item.quantity || item.cantidad || 1) >= 99}
                          >
                            +
                          </button>
                        </div>
                        {updatingItem === item.id && (
                          <div className="updating-indicator">Actualizando...</div>
                        )}
                      </div>

                      {/* Subtotal del item */}
                      <div className="item-subtotal">
                        <span className="subtotal-amount">
                          ${((parseFloat(item.precio) || 0) * (item.quantity || item.cantidad || 1)).toFixed(2)}
                        </span>
                      </div>

                      {/* Botón eliminar */}
                      <div className="item-actions">
                        <button
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Eliminar del carrito"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Resumen de compra */}
              <div className="cart-summary">
                <div className="summary-header">
                  <h2>Resumen de Compra</h2>
                </div>

                <div className="summary-content">
                  {/* Subtotal */}
                  <div className="summary-row">
                    <span>Subtotal ({items.length} producto{items.length !== 1 ? 's' : ''})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {/* Envío */}
                  <div className="summary-row shipping">
                    <div className="shipping-info">
                      <FaTruck />
                      <span>
                        {shippingCost === 0 ? 'Envío gratis' : 'Costo de envío'}
                      </span>
                    </div>
                    <span className={shippingCost === 0 ? 'free' : ''}>
                      {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Línea divisoria */}
                  <div className="summary-divider"></div>

                  {/* Total */}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {/* Información de envío gratis */}
                  {shippingCost > 0 && (
                    <div className="free-shipping-info">
                      <FaTruck />
                      <span>
                        Agrega ${(5000 - subtotal).toFixed(2)} más para envío gratis
                      </span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="summary-actions">
                    <button
                      className="btn-secondary continue-shopping"
                      onClick={handleContinueShopping}
                    >
                      <FaArrowLeft />
                      Continuar Comprando
                    </button>
                    
                    <button
                      className="btn-primary checkout-btn"
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                    >
                      Proceder al Pago
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div className="summary-features">
                    <div className="feature">
                      <FaShieldAlt />
                      <span>Pago seguro con MercadoPago</span>
                    </div>
                    <div className="feature">
                      <FaTruck />
                      <span>Envío a todo el país</span>
                    </div>
                    <div className="feature">
                      <FaLeaf />
                      <span>Productos 100% naturales</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
