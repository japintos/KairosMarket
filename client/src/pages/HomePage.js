/**
 * Página de inicio - HomePage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowRight, FaLeaf, FaHeart, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useActiveCategories } from '../hooks/useCategories';
import ProductGrid from '../components/products/ProductGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
  const { data: featuredProducts, isLoading: productsLoading, error: productsError } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useActiveCategories();

  // Datos de características principales
  const features = [
    {
      icon: FaLeaf,
      title: '100% Natural',
      description: 'Productos orgánicos y naturales sin conservantes artificiales'
    },
    {
      icon: FaHeart,
      title: 'Calidad Premium',
      description: 'Seleccionamos los mejores ingredientes para tu bienestar'
    },
    {
      icon: FaTruck,
      title: 'Envío Rápido',
      description: 'Entrega a domicilio en 24-48 horas en toda la ciudad'
    },
    {
      icon: FaShieldAlt,
      title: 'Garantía de Calidad',
      description: 'Satisfacción garantizada o devolvemos tu dinero'
    }
  ];

  // Datos de testimonios
  const testimonials = [
    {
      name: 'María González',
      text: 'Excelente calidad en todos los productos. El envío fue súper rápido y todo llegó perfecto.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      text: 'Los productos naturales de Kairos han mejorado mi salud significativamente. Muy recomendado.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      text: 'La atención al cliente es excepcional y los precios son muy competitivos. Volveré a comprar.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>Kairos Natural Market - Productos Naturales Fraccionados</title>
        <meta name="description" content="Descubre nuestra amplia selección de productos naturales fraccionados. Hierbas medicinales, especias, frutos secos y más. Envío a domicilio." />
      </Helmet>

      <div className="homepage" id="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-overlay"></div>
          </div>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Productos Naturales
                <span className="hero-title-accent">Fraccionados</span>
              </h1>
              <p className="hero-description">
                Descubre nuestra amplia selección de hierbas medicinales, especias, 
                frutos secos y productos naturales de la más alta calidad. 
                Tu bienestar es nuestra prioridad.
              </p>
              <div className="hero-actions">
                <Link to="/catalogo" className="btn btn-primary btn-large">
                  Ver Catálogo
                  <FaArrowRight />
                </Link>
                <Link to="/contacto" className="btn btn-outline btn-large">
                  Contactar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categorías Principales */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2>Nuestras Categorías</h2>
              <p>Explora nuestra amplia gama de productos naturales organizados por categorías</p>
            </div>
            
            {categoriesLoading ? (
              <div className="categories-loading">
                <LoadingSpinner text="Cargando categorías..." />
              </div>
            ) : (
              <div className="categories-grid">
                {categories?.slice(0, 6).map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/catalogo?categoria=${category.id}`}
                    className="category-card"
                  >
                    <div className="category-image">
                      <img 
                        src={category.imagen_url || '/img/placeholder-category.jpg'} 
                        alt={category.nombre}
                        loading="lazy"
                      />
                      <div className="category-overlay">
                        <FaArrowRight />
                      </div>
                    </div>
                    <div className="category-info">
                      <h3>{category.nombre}</h3>
                      <p>{category.descripcion}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Productos Destacados</h2>
              <p>Los productos más populares y mejor valorados por nuestros clientes</p>
            </div>
            
            {productsLoading ? (
              <div className="featured-loading">
                <LoadingSpinner text="Cargando productos destacados..." />
              </div>
            ) : productsError ? (
              <div className="featured-error">
                <div className="alert alert-danger">
                  <h3>Error al cargar productos</h3>
                  <p>{productsError.message || 'Error desconocido al cargar productos'}</p>
                </div>
              </div>
                         ) : (
               <ProductGrid 
                 products={Array.isArray(featuredProducts) ? featuredProducts.slice(0, 8) : []}
                 columns={4}
                 layout="grid"
                 emptyMessage="No hay productos destacados disponibles"
               />
             )}
            
            <div className="featured-actions">
              <Link to="/catalogo" className="btn btn-primary">
                Ver Todos los Productos
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Características Principales */}
        <section className="features-section">
          <div className="container">
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <feature.icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <h2>Lo que dicen nuestros clientes</h2>
              <p>Experiencias reales de clientes satisfechos</p>
            </div>
            
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-content">
                    <p>"{testimonial.text}"</p>
                  </div>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaHeart key={i} className="star filled" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>¿Listo para comenzar tu viaje hacia el bienestar natural?</h2>
              <p>
                Únete a miles de clientes que ya confían en Kairos Natural Market 
                para sus productos naturales de calidad.
              </p>
              <div className="cta-actions">
                <Link to="/catalogo" className="btn btn-primary btn-large">
                  Comenzar a Comprar
                </Link>
                <Link to="/contacto" className="btn btn-outline btn-large">
                  Hablar con un Experto
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
