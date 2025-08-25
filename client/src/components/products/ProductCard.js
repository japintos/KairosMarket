/**
 * Componente ProductCard para mostrar productos
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaEye, FaStar } from 'react-icons/fa';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import './ProductCard.css';

const ProductCard = ({ product, showQuickView = true }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Manejar agregar al carrito
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirigir al login o mostrar modal de registro
      return;
    }

    setIsLoading(true);
    const success = await addToCart(product, 1);
    setIsLoading(false);
  };

  // Manejar favoritos
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calcular descuento
  const calculateDiscount = () => {
    if (!product.precio_anterior || product.precio_anterior <= product.precio) {
      return 0;
    }
    return Math.round(((product.precio_anterior - product.precio) / product.precio_anterior) * 100);
  };

  const discount = calculateDiscount();

  return (
    <div className="product-card">
      {/* Imagen del producto */}
      <div className="product-image">
        <Link to={`/producto/${product.id}`}>
          <img 
            src={product.imagen_url || '/img/placeholder-product.jpg'} 
            alt={product.nombre}
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="product-badges">
          {discount > 0 && (
            <span className="badge badge-danger">-{discount}%</span>
          )}
          {product.destacado && (
            <span className="badge badge-primary">Destacado</span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="badge badge-warning">Últimas unidades</span>
          )}
          {product.stock === 0 && (
            <span className="badge badge-secondary">Sin stock</span>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="product-actions">
          {showQuickView && (
            <Link 
              to={`/producto/${product.id}`}
              className="action-btn quick-view-btn"
              title="Ver detalles"
            >
              <FaEye />
            </Link>
          )}
          
          <button
            className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <FaHeart />
          </button>
        </div>
      </div>

      {/* Información del producto */}
      <div className="product-info">
        {/* Categoría */}
        {product.categoria && (
          <div className="product-category">
            <Link to={`/catalogo?categoria=${product.categoria.id}`}>
              {product.categoria.nombre}
            </Link>
          </div>
        )}

        {/* Nombre del producto */}
        <h3 className="product-name">
          <Link to={`/producto/${product.id}`}>
            {product.nombre}
          </Link>
        </h3>

        {/* Descripción corta */}
        {product.descripcion_corta && (
          <p className="product-description">
            {product.descripcion_corta.length > 80 
              ? `${product.descripcion_corta.substring(0, 80)}...` 
              : product.descripcion_corta
            }
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar 
                  key={star}
                  className={star <= product.rating ? 'star filled' : 'star'}
                />
              ))}
            </div>
            <span className="rating-text">({product.rating}/5)</span>
          </div>
        )}

        {/* Precio */}
        <div className="product-price">
          {discount > 0 ? (
            <>
              <span className="current-price">{formatPrice(product.precio)}</span>
              <span className="old-price">{formatPrice(product.precio_anterior)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(product.precio)}</span>
          )}
        </div>

        {/* Formato */}
        {product.formato && (
          <div className="product-format">
            <span className="format-text">{product.formato}</span>
          </div>
        )}

        {/* Stock */}
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="stock-available">
              Stock: {product.stock} unidades
            </span>
          ) : (
            <span className="stock-unavailable">
              Sin stock
            </span>
          )}
        </div>

        {/* Botón de agregar al carrito */}
        <div className="product-actions-bottom">
          <button
            className={`btn btn-primary add-to-cart-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FaShoppingCart />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
