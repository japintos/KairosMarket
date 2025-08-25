/**
 * Componente Footer principal
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaTruck, FaShieldAlt, FaLeaf } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Enlaces de navegación
  const navigationLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/contacto', label: 'Contacto' },
    { path: '/perfil', label: 'Mi Cuenta' },
    { path: '/favoritos', label: 'Favoritos' },
    { path: '/historial', label: 'Historial de Pedidos' }
  ];

  // Enlaces de información
  const infoLinks = [
    { path: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { path: '/politica-privacidad', label: 'Política de Privacidad' },
    { path: '/terminos-condiciones', label: 'Términos y Condiciones' },
    { path: '/envios-devoluciones', label: 'Envíos y Devoluciones' },
    { path: '/preguntas-frecuentes', label: 'Preguntas Frecuentes' },
    { path: '/garantia', label: 'Garantía de Calidad' }
  ];

  // Categorías principales
  const categories = [
    { path: '/catalogo?categoria=hierbas-medicinales', label: 'Hierbas Medicinales' },
    { path: '/catalogo?categoria=especias', label: 'Especias' },
    { path: '/catalogo?categoria=frutos-secos', label: 'Frutos Secos' },
    { path: '/catalogo?categoria=infusiones', label: 'Infusiones' },
    { path: '/catalogo?categoria=aceites-esenciales', label: 'Aceites Esenciales' },
    { path: '/catalogo?categoria=suplementos', label: 'Suplementos Naturales' }
  ];

  // Información de contacto
  const contactInfo = {
    phone: '+54 9 11 1234-5678',
    email: 'info@kairosnatural.com',
    address: 'Av. Principal 123, Ciudad Autónoma de Buenos Aires',
    whatsapp: '+54 9 11 1234-5678',
    schedule: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 14:00'
  };

  // Redes sociales
  const socialLinks = [
    { 
      name: 'Facebook', 
      url: 'https://facebook.com/kairosnatural', 
      icon: FaFacebook,
      color: '#1877F2'
    },
    { 
      name: 'Instagram', 
      url: 'https://instagram.com/kairosnatural', 
      icon: FaInstagram,
      color: '#E4405F'
    },
    { 
      name: 'WhatsApp', 
      url: `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`, 
      icon: FaWhatsapp,
      color: '#25D366'
    }
  ];

  // Beneficios destacados
  const benefits = [
    {
      icon: FaLeaf,
      title: '100% Natural',
      description: 'Productos orgánicos y naturales certificados'
    },
    {
      icon: FaTruck,
      title: 'Envío Gratis',
      description: 'En compras superiores a $10.000'
    },
    {
      icon: FaShieldAlt,
      title: 'Garantía',
      description: '30 días de garantía en todos los productos'
    },
    {
      icon: FaClock,
      title: 'Entrega Rápida',
      description: 'Envíos en 24-48 horas hábiles'
    }
  ];

  return (
    <footer className="footer">
      {/* Sección de beneficios */}
      <div className="footer-benefits">
        <div className="container">
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-icon">
                  <benefit.icon />
                </div>
                <div className="benefit-content">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal del footer */}
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Información de la empresa */}
            <div className="footer-section footer-brand">
              <div className="footer-logo">
                <img src="/img/logo1.jpg" alt="Kairos Natural Market" />
                <h3>Kairos Natural Market</h3>
              </div>
              <p className="footer-description">
                Tu tienda de confianza para productos naturales fraccionados. 
                Calidad, frescura y bienestar en cada producto. Más de 10 años 
                brindando salud y bienestar a nuestros clientes.
              </p>
              <div className="social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--social-color': social.color }}
                    aria-label={`Síguenos en ${social.name}`}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Navegación rápida */}
            <div className="footer-section">
              <h4>Navegación</h4>
              <ul className="footer-links">
                {navigationLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categorías */}
            <div className="footer-section">
              <h4>Categorías</h4>
              <ul className="footer-links">
                {categories.map((category) => (
                  <li key={category.path}>
                    <Link to={category.path}>{category.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Información */}
            <div className="footer-section">
              <h4>Información</h4>
              <ul className="footer-links">
                {infoLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div className="footer-section footer-contact">
              <h4>Contacto</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{contactInfo.address}</span>
                </div>
                <div className="contact-item">
                  <FaWhatsapp className="contact-icon" />
                  <a 
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactInfo.whatsapp}
                  </a>
                </div>
                <div className="contact-item">
                  <FaClock className="contact-icon" />
                  <span>{contactInfo.schedule}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer inferior */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Kairos Natural Market. Todos los derechos reservados.
            </p>
            <p className="developer">
              Desarrollado por{' '}
              <a 
                href="https://webxpert.com.ar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="developer-link"
              >
                WebXpert - Julio Alberto Pintos
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
