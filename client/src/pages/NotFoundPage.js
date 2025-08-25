/**
 * Página 404 - NotFoundPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaSearch, FaArrowLeft, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Página no encontrada - Kairos Natural Market</title>
        <meta name="description" content="La página que buscas no existe" />
      </Helmet>

      <div className="not-found-page">
        <div className="container">
          <motion.div
            className="not-found-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Ilustración */}
            <div className="not-found-illustration">
              <div className="illustration-container">
                <FaLeaf className="leaf-icon" />
                <div className="error-number">404</div>
                <div className="floating-elements">
                  <div className="floating-element element-1">🌿</div>
                  <div className="floating-element element-2">🍃</div>
                  <div className="floating-element element-3">🌱</div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="not-found-text">
              <h1>¡Oops! Página no encontrada</h1>
              <p>
                Parece que la página que buscas se ha perdido en el bosque de productos naturales. 
                No te preocupes, te ayudamos a encontrar el camino de vuelta.
              </p>
            </div>

            {/* Acciones */}
            <div className="not-found-actions">
              <Link to="/" className="btn-primary">
                <FaHome />
                Volver al Inicio
              </Link>
              
              <Link to="/catalogo" className="btn-secondary">
                <FaSearch />
                Explorar Productos
              </Link>
              
              <button 
                className="btn-back"
                onClick={() => window.history.back()}
              >
                <FaArrowLeft />
                Página Anterior
              </button>
            </div>

            {/* Sugerencias */}
            <div className="not-found-suggestions">
              <h3>¿Qué tal si exploras estas secciones?</h3>
              <div className="suggestions-grid">
                <Link to="/catalogo" className="suggestion-item">
                  <div className="suggestion-icon">🌿</div>
                  <div className="suggestion-content">
                    <h4>Catálogo</h4>
                    <p>Descubre nuestros productos naturales</p>
                  </div>
                </Link>
                
                <Link to="/contacto" className="suggestion-item">
                  <div className="suggestion-icon">📞</div>
                  <div className="suggestion-content">
                    <h4>Contacto</h4>
                    <p>¿Necesitas ayuda? Contáctanos</p>
                  </div>
                </Link>
                
                <Link to="/" className="suggestion-item">
                  <div className="suggestion-icon">🏠</div>
                  <div className="suggestion-content">
                    <h4>Inicio</h4>
                    <p>Conoce más sobre Kairos Natural</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decoraciones de fondo */}
        <div className="background-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
