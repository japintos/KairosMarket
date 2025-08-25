/**
 * Componente ProductGrid para mostrar productos en grilla
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './ProductGrid.css';

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  error = null,
  columns = 4,
  layout = 'grid',
  showQuickView = true,
  emptyMessage = 'No se encontraron productos',
  className = ''
}) => {
  // Determinar el número de columnas según el layout
  const getGridColumns = () => {
    if (layout === 'list') return 1;
    if (layout === 'compact') return 2;
    return columns;
  };

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="product-grid-error">
        <div className="alert alert-danger">
          <h3>Error al cargar productos</h3>
          <p>{error.message || 'Error desconocido al cargar productos'}</p>
        </div>
      </div>
    );
  }

  // Renderizar loading
  if (loading) {
    return (
      <div className="product-grid-loading">
        <LoadingSpinner size="large" text="Cargando productos..." />
      </div>
    );
  }

  // Renderizar mensaje de productos vacíos
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No se encontraron productos</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      <div 
        className={`product-grid-container product-grid-${layout}`}
        style={{ 
          '--grid-columns': getGridColumns(),
          '--grid-columns-tablet': Math.min(getGridColumns(), 3),
          '--grid-columns-mobile': Math.min(getGridColumns(), 2)
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickView={showQuickView}
            className={layout === 'list' ? 'horizontal' : layout === 'compact' ? 'compact' : ''}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
