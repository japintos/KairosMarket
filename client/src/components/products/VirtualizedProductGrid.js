/**
 * Componente de grilla de productos virtualizada
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './VirtualizedProductGrid.css';

const VirtualizedProductGrid = ({ 
  products = [], 
  loading = false,
  columns = 4,
  itemWidth = 280,
  itemHeight = 400,
  className = ""
}) => {
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
    columns: columns
  });

  // Calcular dimensiones del grid
  useEffect(() => {
    const updateGridDimensions = () => {
      const containerWidth = window.innerWidth;
      let cols = columns;

      // Ajustar columnas según el tamaño de pantalla
      if (containerWidth < 640) cols = 1; // Mobile
      else if (containerWidth < 768) cols = 2; // Tablet
      else if (containerWidth < 1024) cols = 3; // Small desktop
      else if (containerWidth < 1280) cols = 4; // Desktop
      else cols = 5; // Large desktop

      const width = Math.floor(containerWidth / cols);
      const height = window.innerHeight - 200; // Ajustar según header y otros elementos

      setGridDimensions({
        width: containerWidth,
        height,
        columns: cols
      });
    };

    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [columns]);

  // Renderizar celda del grid
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * gridDimensions.columns + columnIndex;
    const product = products[index];

    if (!product) return null;

    return (
      <div style={style} className="grid-cell">
        <ProductCard product={product} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="virtualized-grid-loading">
        <LoadingSpinner />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="virtualized-grid-empty">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  const rows = Math.ceil(products.length / gridDimensions.columns);

  return (
    <div className={`virtualized-product-grid ${className}`}>
      <Grid
        columnCount={gridDimensions.columns}
        columnWidth={gridDimensions.width / gridDimensions.columns}
        height={gridDimensions.height}
        rowCount={rows}
        rowHeight={itemHeight}
        width={gridDimensions.width}
        itemData={products}
      >
        {Cell}
      </Grid>
    </div>
  );
};

export default VirtualizedProductGrid;
