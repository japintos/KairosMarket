/**
 * Página de checkout - CheckoutPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaMapMarkerAlt, FaCreditCard, FaShieldAlt, FaTruck, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, total, subtotal } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [orderSummary, setOrderSummary] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  // Calcular totales
  const shippingCost = subtotal >= 5000 ? 0 : 500;
  const finalTotal = total + shippingCost;

  // Cargar datos del usuario si está logueado
  useEffect(() => {
    if (user) {
      setValue('nombre', user.nombre || '');
      setValue('apellido', user.apellido || '');
      setValue('email', user.email || '');
      setValue('telefono', user.telefono || '');
      setValue('direccion', user.direccion || '');
      setValue('ciudad', user.ciudad || '');
      setValue('provincia', user.provincia || '');
      setValue('codigo_postal', user.codigo_postal || '');
    }
  }, [user, setValue]);

  // Validar que hay productos en el carrito
  useEffect(() => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      navigate('/carrito');
    }
  }, [items, navigate]);

  // Generar resumen de la orden
  const generateOrderSummary = (formData) => {
    return {
      numero_pedido: `KAI-${Date.now()}`,
      cliente: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        provincia: formData.provincia,
        codigo_postal: formData.codigo_postal
      },
      productos: items,
      subtotal,
      costo_envio: shippingCost,
      total: finalTotal,
      forma_pago: paymentMethod,
      observaciones: formData.observaciones || ''
    };
  };

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const orderData = generateOrderSummary(formData);
      setOrderSummary(orderData);
      
      if (paymentMethod === 'mercadopago') {
        // Crear preferencia de pago con MercadoPago
        const paymentResponse = await api.post('/payments/create-preference', {
                     items: items.map(item => ({
             ...item,
             cantidad: item.quantity || item.cantidad || 1
           })),
          orderData
        });

        if (paymentResponse.data.success && paymentResponse.data.data.init_point) {
          // Redirigir a MercadoPago
          window.location.href = paymentResponse.data.data.init_point;
        } else {
          throw new Error('Error al generar el link de pago');
        }
      } else {
        // Para otros métodos de pago, crear orden directamente
        const orderResponse = await api.post('/orders', orderData);
        
        if (orderResponse.data.success) {
          setCurrentStep(3);
          toast.success('Orden creada exitosamente');
        } else {
          throw new Error('Error al crear la orden');
        }
      }
      
    } catch (error) {
      console.error('Error en checkout:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  // Navegar entre pasos
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Kairos Natural Market</title>
        <meta name="description" content="Completa tu compra de productos naturales" />
      </Helmet>

      <div className="checkout-page">
        <div className="container">
          {/* Header */}
          <div className="checkout-header">
            <h1>Finalizar Compra</h1>
            <p>Completa los datos para procesar tu pedido</p>
          </div>

          {/* Stepper */}
          <div className="checkout-stepper">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Datos Personales</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Método de Pago</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Confirmación</div>
            </div>
          </div>

          <div className="checkout-content">
            {/* Formulario */}
            <div className="checkout-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Paso 1: Datos Personales */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="form-step"
                  >
                    <div className="step-header">
                      <FaUser />
                      <h2>Datos Personales</h2>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre *</label>
                        <input
                          type="text"
                          id="nombre"
                          {...register('nombre', { required: 'El nombre es requerido' })}
                          className={errors.nombre ? 'error' : ''}
                        />
                        {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="apellido">Apellido *</label>
                        <input
                          type="text"
                          id="apellido"
                          {...register('apellido', { required: 'El apellido es requerido' })}
                          className={errors.apellido ? 'error' : ''}
                        />
                        {errors.apellido && <span className="error-message">{errors.apellido.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          {...register('email', { 
                            required: 'El email es requerido',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido'
                            }
                          })}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="telefono">Teléfono *</label>
                        <input
                          type="tel"
                          id="telefono"
                          {...register('telefono', { required: 'El teléfono es requerido' })}
                          className={errors.telefono ? 'error' : ''}
                        />
                        {errors.telefono && <span className="error-message">{errors.telefono.message}</span>}
                      </div>
                    </div>

                    <div className="step-header">
                      <FaMapMarkerAlt />
                      <h2>Dirección de Envío</h2>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="direccion">Dirección *</label>
                      <input
                        type="text"
                        id="direccion"
                        {...register('direccion', { required: 'La dirección es requerida' })}
                        className={errors.direccion ? 'error' : ''}
                        placeholder="Calle, número, piso, departamento"
                      />
                      {errors.direccion && <span className="error-message">{errors.direccion.message}</span>}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="ciudad">Ciudad *</label>
                        <input
                          type="text"
                          id="ciudad"
                          {...register('ciudad', { required: 'La ciudad es requerida' })}
                          className={errors.ciudad ? 'error' : ''}
                        />
                        {errors.ciudad && <span className="error-message">{errors.ciudad.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="provincia">Provincia *</label>
                        <input
                          type="text"
                          id="provincia"
                          {...register('provincia', { required: 'La provincia es requerida' })}
                          className={errors.provincia ? 'error' : ''}
                        />
                        {errors.provincia && <span className="error-message">{errors.provincia.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="codigo_postal">Código Postal</label>
                        <input
                          type="text"
                          id="codigo_postal"
                          {...register('codigo_postal')}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="observaciones">Observaciones</label>
                      <textarea
                        id="observaciones"
                        {...register('observaciones')}
                        placeholder="Instrucciones especiales para la entrega..."
                        rows="3"
                      />
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/carrito')}
                      >
                        Volver al Carrito
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={nextStep}
                      >
                        Continuar
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 2: Método de Pago */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="form-step"
                  >
                    <div className="step-header">
                      <FaCreditCard />
                      <h2>Método de Pago</h2>
                    </div>

                    <div className="payment-methods">
                      <div className="payment-method">
                        <input
                          type="radio"
                          id="mercadopago"
                          name="paymentMethod"
                          value="mercadopago"
                          checked={paymentMethod === 'mercadopago'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="mercadopago">
                          <div className="payment-info">
                            <div className="payment-icon">
                              <img src="/img/mercadopago-logo.png" alt="MercadoPago" />
                            </div>
                            <div className="payment-details">
                              <h3>MercadoPago</h3>
                              <p>Paga con tarjeta, efectivo o transferencia</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="payment-method">
                        <input
                          type="radio"
                          id="efectivo"
                          name="paymentMethod"
                          value="efectivo"
                          checked={paymentMethod === 'efectivo'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="efectivo">
                          <div className="payment-info">
                            <div className="payment-icon">
                              <FaCreditCard />
                            </div>
                            <div className="payment-details">
                              <h3>Efectivo</h3>
                              <p>Paga en efectivo al recibir tu pedido</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="security-info">
                      <FaShieldAlt />
                      <div>
                        <h3>Pago Seguro</h3>
                        <p>Tus datos están protegidos con encriptación SSL de 256 bits</p>
                      </div>
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={prevStep}
                      >
                        Anterior
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Procesando...' : 'Finalizar Compra'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Confirmación */}
                {currentStep === 3 && orderSummary && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="form-step"
                  >
                    <div className="step-header">
                      <FaShieldAlt />
                      <h2>¡Orden Confirmada!</h2>
                    </div>

                    <div className="confirmation-message">
                      <div className="success-icon">✓</div>
                      <h3>Gracias por tu compra</h3>
                      <p>Tu orden ha sido procesada exitosamente</p>
                      <div className="order-number">
                        Número de orden: <strong>{orderSummary.numero_pedido}</strong>
                      </div>
                    </div>

                    <div className="order-details">
                      <h4>Detalles de la orden:</h4>
                      <div className="detail-row">
                        <span>Cliente:</span>
                        <span>{orderSummary.cliente.nombre} {orderSummary.cliente.apellido}</span>
                      </div>
                      <div className="detail-row">
                        <span>Email:</span>
                        <span>{orderSummary.cliente.email}</span>
                      </div>
                      <div className="detail-row">
                        <span>Teléfono:</span>
                        <span>{orderSummary.cliente.telefono}</span>
                      </div>
                      <div className="detail-row">
                        <span>Dirección:</span>
                        <span>{orderSummary.cliente.direccion}, {orderSummary.cliente.ciudad}</span>
                      </div>
                      <div className="detail-row">
                        <span>Total:</span>
                        <span>${orderSummary.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="next-steps">
                      <h4>Próximos pasos:</h4>
                      <ul>
                        <li>Recibirás un email de confirmación</li>
                        <li>Nos pondremos en contacto para coordinar la entrega</li>
                        <li>Puedes hacer seguimiento de tu pedido desde tu cuenta</li>
                      </ul>
                    </div>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          clearCart();
                          navigate('/');
                        }}
                      >
                        Volver al Inicio
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Resumen de la orden */}
            <div className="order-summary">
              <div className="summary-header">
                <h2>Resumen de la Orden</h2>
              </div>

              <div className="summary-content">
                {/* Productos */}
                <div className="summary-products">
                  {items.map((item) => (
                    <div key={item.id} className="summary-product">
                      <div className="product-image">
                        <img src={item.imagen || '/img/placeholder-product.jpg'} alt={item.nombre} />
                      </div>
                      <div className="product-info">
                        <h4>{item.nombre}</h4>
                                                 <p>Cantidad: {item.quantity || item.cantidad || 1}</p>
                        {item.formato && <p>Formato: {item.formato}</p>}
                      </div>
                      <div className="product-price">
                                                 ${((parseFloat(item.precio) || 0) * (item.quantity || item.cantidad || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="summary-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Envío</span>
                    <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="total-row total">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="summary-features">
                  <div className="feature">
                    <FaTruck />
                    <span>Envío a domicilio</span>
                  </div>
                  <div className="feature">
                    <FaLeaf />
                    <span>Productos 100% naturales</span>
                  </div>
                  <div className="feature">
                    <FaShieldAlt />
                    <span>Garantía de calidad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
