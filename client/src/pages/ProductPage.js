/**
 * Página de detalle de producto - ProductPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaShoppingCart, FaHeart, FaShare, FaStar, FaTruck, FaShieldAlt, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [selectedFormat, setSelectedFormat] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtener datos del producto
  const { data: product, isLoading, error } = useProduct(id);

  // Configurar formato por defecto
  useEffect(() => {
    if (product?.formato_disponible && Array.isArray(product.formato_disponible) && product.formato_disponible.length > 0) {
      setSelectedFormat(product.formato_disponible[0]);
    }
  }, [product]);

  // Calcular precio según formato
  const calculatePrice = () => {
    if (!product) return 0;
    
    if (product.precio_por_unidad) {
      return product.precio * quantity;
    }
    
    // Para productos fraccionados, el precio ya está por formato
    return product.precio * quantity;
  };

  // Agregar al carrito
  const handleAddToCart = async () => {
    if (!selectedFormat) {
      toast.error('Por favor selecciona un formato');
      return;
    }

    setLoading(true);
    try {
      await addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        imagen: product.imagen,
        formato: selectedFormat,
        quantity: quantity,
        precio_por_unidad: product.precio_por_unidad
      });
      
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  // Compra rápida
  const handleQuickBuy = async () => {
    await handleAddToCart();
    navigate('/carrito');
  };

  // Toggle favorito
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  // Compartir producto
  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.nombre,
        text: product?.descripcion,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error al cargar el producto: {error.message || 'Error desconocido'}</div>;
  if (!product) return <div className="error-message">Producto no encontrado</div>;



  const formatos = product.formato_disponible || [];
  const precio = calculatePrice();

  return (
    <>
      <Helmet>
        <title>{product.nombre} - Kairos Natural Market</title>
        <meta name="description" content={product.descripcion} />
        <meta property="og:title" content={product.nombre} />
        <meta property="og:description" content={product.descripcion} />
        <meta property="og:image" content={product.imagen} />
      </Helmet>

      <div className="product-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/catalogo">Catálogo</Link>
            <span>/</span>
            <span>{product.nombre}</span>
          </nav>

          <div className="product-content">
            {/* Galería de imágenes */}
            <div className="product-gallery">
              <div className="main-image">
                <motion.img
                  key={selectedImage}
                  src={product.imagen}
                  alt={product.nombre}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Thumbnails */}
              <div className="image-thumbnails">
                {[product.imagen].map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.nombre} ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Información del producto */}
            <div className="product-info">
              <div className="product-header">
                <h1>{product.nombre}</h1>
                <div className="product-actions">
                  <button 
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    title="Agregar a favoritos"
                  >
                    <FaHeart />
                  </button>
                  <button 
                    className="share-btn"
                    onClick={shareProduct}
                    title="Compartir"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>

              {/* Categoría */}
              <div className="product-category">
                <FaLeaf />
                <span>{product.categoria_nombre}</span>
              </div>

              {/* Precio */}
              <div className="product-price">
                <span className="price">${precio.toFixed(2)}</span>
                {product.precio_por_unidad && (
                  <span className="price-unit">por unidad</span>
                )}
              </div>

              {/* Descripción */}
              <div className="product-description">
                <p>{product.descripcion}</p>
              </div>

              {/* Selector de formato */}
              {formatos.length > 0 && (
                <div className="format-selector">
                  <h3>Formato disponible:</h3>
                  <div className="format-options">
                    {formatos.map((formato, index) => (
                      <button
                        key={index}
                        className={`format-option ${selectedFormat === formato ? 'active' : ''}`}
                        onClick={() => setSelectedFormat(formato)}
                      >
                        {formato}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de cantidad */}
              <div className="quantity-selector">
                <h3>Cantidad:</h3>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock */}
              <div className="product-stock">
                <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Sin stock'}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="product-actions-main">
                <button
                  className="btn-primary add-to-cart"
                  onClick={handleAddToCart}
                  disabled={loading || product.stock <= 0}
                >
                  <FaShoppingCart />
                  {loading ? 'Agregando...' : 'Agregar al carrito'}
                </button>
                
                <button
                  className="btn-secondary quick-buy"
                  onClick={handleQuickBuy}
                  disabled={loading || product.stock <= 0}
                >
                  Comprar ahora
                </button>
              </div>

              {/* Beneficios */}
              {product.beneficios && (
                <div className="product-benefits">
                  <h3>Beneficios:</h3>
                  <p>{product.beneficios}</p>
                </div>
              )}

              {/* Ingredientes */}
              {product.ingredientes && (
                <div className="product-ingredients">
                  <h3>Ingredientes:</h3>
                  <p>{product.ingredientes}</p>
                </div>
              )}

              {/* Información adicional */}
              <div className="product-features">
                <div className="feature">
                  <FaTruck />
                  <span>Envío gratis en compras superiores a $5000</span>
                </div>
                <div className="feature">
                  <FaShieldAlt />
                  <span>Garantía de calidad</span>
                </div>
                <div className="feature">
                  <FaLeaf />
                  <span>100% Natural</span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          <div className="related-products">
            <h2>Productos relacionados</h2>
            {/* Aquí irían productos de la misma categoría */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
