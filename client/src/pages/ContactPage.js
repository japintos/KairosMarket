/**
 * Página de contacto - ContactPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaLeaf, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './ContactPage.css';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    setLoading(true);
    
    try {
      // Simular envío de mensaje (mientras no tengamos base de datos)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En producción, esto sería una llamada real a la API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });

      // if (!response.ok) {
      //   throw new Error('Error al enviar el mensaje');
      // }

      setSubmitted(true);
      reset();
      toast.success('Mensaje enviado exitosamente. Te responderemos pronto.');
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  // Información de contacto
  const contactInfo = {
    direccion: 'Av. Principal 123, Ciudad Autónoma de Buenos Aires',
    telefono: '+54 9 11 1234-5678',
    email: 'info@kairosnatural.com',
    horarios: 'Lunes a Viernes: 9:00 - 18:00\nSábados: 9:00 - 13:00'
  };

  return (
    <>
      <Helmet>
        <title>Contacto - Kairos Natural Market</title>
        <meta name="description" content="Contáctanos para consultas sobre productos naturales, pedidos y más" />
      </Helmet>

      <div className="contact-page">
        <div className="container">
          {/* Header */}
          <div className="contact-header">
            <h1>Contáctanos</h1>
            <p>Estamos aquí para ayudarte con cualquier consulta sobre nuestros productos naturales</p>
          </div>

          <div className="contact-content">
            {/* Información de contacto */}
            <div className="contact-info">
              <div className="info-header">
                <h2>Información de Contacto</h2>
                <p>Encuéntranos y comunícate con nosotros</p>
              </div>

              <div className="info-items">
                <motion.div
                  className="info-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="info-content">
                    <h3>Dirección</h3>
                    <p>{contactInfo.direccion}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="info-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="info-icon">
                    <FaPhone />
                  </div>
                  <div className="info-content">
                    <h3>Teléfono</h3>
                    <p>{contactInfo.telefono}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="info-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-content">
                    <h3>Email</h3>
                    <p>{contactInfo.email}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="info-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="info-icon">
                    <FaClock />
                  </div>
                  <div className="info-content">
                    <h3>Horarios de Atención</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{contactInfo.horarios}</p>
                  </div>
                </motion.div>
              </div>

              {/* Características de la empresa */}
              <div className="company-features">
                <h3>¿Por qué elegirnos?</h3>
                <div className="features-grid">
                  <div className="feature">
                    <FaLeaf />
                    <span>Productos 100% Naturales</span>
                  </div>
                  <div className="feature">
                    <FaShieldAlt />
                    <span>Garantía de Calidad</span>
                  </div>
                  <div className="feature">
                    <FaTruck />
                    <span>Envío a Domicilio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="contact-form-container">
              {submitted ? (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="success-icon">✓</div>
                  <h2>¡Mensaje Enviado!</h2>
                  <p>Gracias por contactarnos. Te responderemos en breve.</p>
                  <button
                    className="btn-primary"
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar Otro Mensaje
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  className="contact-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="form-header">
                    <h2>Envíanos un Mensaje</h2>
                    <p>Completa el formulario y te responderemos lo antes posible</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)}>
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
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        {...register('telefono')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="asunto">Asunto *</label>
                      <input
                        type="text"
                        id="asunto"
                        {...register('asunto', { required: 'El asunto es requerido' })}
                        className={errors.asunto ? 'error' : ''}
                      />
                      {errors.asunto && <span className="error-message">{errors.asunto.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="mensaje">Mensaje *</label>
                      <textarea
                        id="mensaje"
                        rows="6"
                        {...register('mensaje', { 
                          required: 'El mensaje es requerido',
                          minLength: {
                            value: 10,
                            message: 'El mensaje debe tener al menos 10 caracteres'
                          }
                        })}
                        className={errors.mensaje ? 'error' : ''}
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                      {errors.mensaje && <span className="error-message">{errors.mensaje.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className="btn-primary submit-btn"
                      disabled={loading}
                    >
                      {loading ? <LoadingSpinner /> : 'Enviar Mensaje'}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="contact-map">
            <div className="map-header">
              <h2>Ubicación</h2>
              <p>Encuéntranos en el corazón de la ciudad</p>
            </div>
            
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889546!2d-58.38157008477025!3d-34.60373888045935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf425a81a3%3A0x8f2c8e3b3b3b3b3b!2sObelisco!5e0!3m2!1ses!2sar!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Kairos Natural Market"
              />
            </div>
          </div>

          {/* FAQ */}
          <div className="contact-faq">
            <div className="faq-header">
              <h2>Preguntas Frecuentes</h2>
              <p>Resolvemos las dudas más comunes</p>
            </div>

            <div className="faq-content">
              <div className="faq-item">
                <h3>¿Cuáles son los métodos de pago aceptados?</h3>
                <p>Aceptamos MercadoPago, efectivo y transferencia bancaria. Todos los pagos son seguros y procesados de manera confidencial.</p>
              </div>

              <div className="faq-item">
                <h3>¿Cuánto tiempo tarda el envío?</h3>
                <p>El tiempo de envío varía según tu ubicación. En general, los pedidos se procesan en 24-48 horas y el envío tarda 2-5 días hábiles.</p>
              </div>

              <div className="faq-item">
                <h3>¿Los productos son orgánicos?</h3>
                <p>Sí, todos nuestros productos son 100% naturales y orgánicos, certificados y seleccionados cuidadosamente para garantizar la mejor calidad.</p>
              </div>

              <div className="faq-item">
                <h3>¿Puedo hacer cambios o cancelar mi pedido?</h3>
                <p>Puedes hacer cambios o cancelar tu pedido hasta 24 horas después de realizarlo. Después de ese tiempo, el pedido ya estará en proceso de preparación.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
