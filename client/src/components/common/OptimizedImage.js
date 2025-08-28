/**
 * Componente de imagen optimizada
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  sizes = "300px",
  className = "",
  width = 300,
  height = 200,
  quality = 80,
  placeholder = "/img/placeholder-product.jpg",
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generar URLs optimizadas
  const generateOptimizedUrl = (format, w = width, h = height, q = quality) => {
    if (!src || src === placeholder) return placeholder;
    
    const baseUrl = src.includes('http') ? src : `${process.env.REACT_APP_API_URL || ''}${src}`;
    const params = new URLSearchParams({
      w: w.toString(),
      h: h.toString(),
      fit: 'crop',
      fm: format,
      q: q.toString()
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // URLs para diferentes formatos y tamaños
  const webpUrl = generateOptimizedUrl('webp');
  const jpgUrl = generateOptimizedUrl('jpg');
  const fallbackUrl = src || placeholder;

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    e.target.src = placeholder;
    if (onError) onError(e);
  };

  return (
    <div className={`optimized-image-container ${className} ${isLoaded ? 'loaded' : ''}`}>
      <picture>
        {/* WebP para navegadores modernos */}
        <source
          srcSet={webpUrl}
          type="image/webp"
          sizes={sizes}
        />
        
        {/* JPEG como fallback */}
        <source
          srcSet={jpgUrl}
          type="image/jpeg"
          sizes={sizes}
        />
        
        {/* Imagen base */}
        <img
          src={fallbackUrl}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          sizes={sizes}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${hasError ? 'error' : ''}`}
        />
      </picture>
      
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="image-error">
          <span>Error al cargar imagen</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
