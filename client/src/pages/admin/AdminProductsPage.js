/**
 * Página de gestión de productos - AdminProductsPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaSave,
  FaTimes,
  FaBox
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminProductsPage.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Cargar productos y categorías
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
      
      // Datos de ejemplo para desarrollo
      setProducts([
        {
          id: 1,
          nombre: 'Manzanilla',
          descripcion: 'Hierba medicinal con propiedades relajantes',
          precio: 250.00,
          stock: 15,
          stock_minimo: 5,
          categoria_nombre: 'Hierbas medicinales',
          activo: true,
          destacado: true,
          imagen: '/img/producto1.jpg'
        },
        {
          id: 2,
          nombre: 'Menta',
          descripcion: 'Hierba aromática para infusiones',
          precio: 200.00,
          stock: 8,
          stock_minimo: 5,
          categoria_nombre: 'Hierbas para infusiones',
          activo: true,
          destacado: false,
          imagen: '/img/producto2.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoria_nombre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Abrir modal para crear/editar producto
  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setValue('nombre', product.nombre);
      setValue('descripcion', product.descripcion);
      setValue('precio', product.precio);
      setValue('stock', product.stock);
      setValue('stock_minimo', product.stock_minimo);
      setValue('categoria_id', product.categoria_id);
      setValue('activo', product.activo);
      setValue('destacado', product.destacado);
    } else {
      reset();
    }
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    reset();
  };

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar producto');
      }

      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
      closeModal();
      loadProducts();
      
    } catch (error) {
      console.error('Error guardando producto:', error);
      toast.error('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      toast.success('Producto eliminado');
      loadProducts();
      
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  // Toggle estado activo
  const toggleActive = async (productId, currentActive) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ activo: !currentActive })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      toast.success('Estado actualizado');
      loadProducts();
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  if (loading && products.length === 0) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Gestión de Productos - Panel Administrativo</title>
        <meta name="description" content="Administra los productos de Kairos Natural Market" />
      </Helmet>

      <div className="admin-products-page" role="main" aria-label="Gestión de productos">
        {/* Header */}
        <header className="page-header" role="banner">
          <div className="header-content">
            <h1>Gestión de Productos</h1>
            <p>Administra el catálogo de productos naturales</p>
          </div>
          
          <button 
            className="add-product-btn"
            onClick={() => openModal()}
            aria-label="Agregar nuevo producto"
          >
            <FaPlus aria-hidden="true" />
            Nuevo Producto
          </button>
        </header>

        {/* Filtros y búsqueda */}
        <section className="filters-section" role="search" aria-label="Filtros de productos">
          <div className="filters-row">
            <div className="search-box">
              <FaSearch aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar productos"
              />
            </div>

            <div className="filter-group">
              <FaFilter aria-hidden="true" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.nombre}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Tabla de productos */}
        <section className="products-section" role="region" aria-label="Lista de productos">
          <div className="products-table">
            <div className="table-header" role="row">
              <div role="columnheader" aria-label="Imagen del producto">Imagen</div>
              <div role="columnheader" aria-label="Información del producto">Producto</div>
              <div role="columnheader" aria-label="Precio">Precio</div>
              <div role="columnheader" aria-label="Stock disponible">Stock</div>
              <div role="columnheader" aria-label="Estado del producto">Estado</div>
              <div role="columnheader" aria-label="Acciones disponibles">Acciones</div>
            </div>
            
            <div className="table-body" role="rowgroup">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="table-row"
                    role="row"
                    aria-label={`Producto: ${product.nombre}`}
                  >
                    <div className="product-image" role="cell">
                      <img 
                        src={product.imagen || '/img/placeholder-product.jpg'} 
                        alt={`Imagen de ${product.nombre}`}
                        onError={(e) => {
                          e.target.src = '/img/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="product-info" role="cell">
                      <div className="product-name">{product.nombre}</div>
                      <div className="product-category">{product.categoria_nombre}</div>
                      <div className="product-description line-clamp-2">{product.descripcion}</div>
                    </div>
                    
                    <div className="product-price" role="cell">
                      ${product.precio.toFixed(2)}
                    </div>
                    
                    <div className="product-stock" role="cell">
                      <div className="stock-status">
                        <span 
                          className={`stock-indicator ${product.stock > product.stock_minimo ? 'high' : product.stock > 0 ? 'medium' : 'low'}`}
                          aria-label={`Stock: ${product.stock} unidades`}
                        ></span>
                        {product.stock}
                      </div>
                    </div>
                    
                    <div className="product-status" role="cell">
                      <div className="status-badges">
                        {product.activo && (
                          <span className="status-badge active" aria-label="Producto activo">Activo</span>
                        )}
                        {product.destacado && (
                          <span className="status-badge featured" aria-label="Producto destacado">Destacado</span>
                        )}
                        {!product.activo && (
                          <span className="status-badge inactive" aria-label="Producto inactivo">Inactivo</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="action-buttons" role="cell">
                      <button
                        className="action-btn view"
                        onClick={() => openModal(product)}
                        aria-label={`Ver detalles de ${product.nombre}`}
                        title="Ver detalles"
                      >
                        <FaEye aria-hidden="true" />
                      </button>
                      
                      <button
                        className="action-btn edit"
                        onClick={() => openModal(product)}
                        aria-label={`Editar ${product.nombre}`}
                        title="Editar producto"
                      >
                        <FaEdit aria-hidden="true" />
                      </button>
                      
                      <button
                        className="action-btn delete"
                        onClick={() => deleteProduct(product.id)}
                        aria-label={`Eliminar ${product.nombre}`}
                        title="Eliminar producto"
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="empty-state" role="status" aria-label="No hay productos">
              <FaBox aria-hidden="true" />
              <h3>No se encontraron productos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </section>

        {/* Modal de producto */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              role="button"
              tabIndex={-1}
              aria-label="Cerrar modal"
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <div className="modal-header">
                  <h2 id="modal-title">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button
                    className="close-btn"
                    onClick={closeModal}
                    aria-label="Cerrar modal"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="product-form" role="form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del Producto *</label>
                      <input
                        type="text"
                        id="nombre"
                        {...register('nombre', { required: 'El nombre es requerido' })}
                        aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                        aria-invalid={errors.nombre ? 'true' : 'false'}
                      />
                      {errors.nombre && (
                        <div id="nombre-error" className="error-message" role="alert">
                          {errors.nombre.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="categoria_id">Categoría *</label>
                      <select
                        id="categoria_id"
                        {...register('categoria_id', { required: 'La categoría es requerida' })}
                        aria-describedby={errors.categoria_id ? 'categoria-error' : undefined}
                        aria-invalid={errors.categoria_id ? 'true' : 'false'}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.categoria_id && (
                        <div id="categoria-error" className="error-message" role="alert">
                          {errors.categoria_id.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="precio">Precio *</label>
                      <input
                        type="number"
                        id="precio"
                        step="0.01"
                        min="0"
                        {...register('precio', { 
                          required: 'El precio es requerido',
                          min: { value: 0, message: 'El precio debe ser mayor a 0' }
                        })}
                        aria-describedby={errors.precio ? 'precio-error' : undefined}
                        aria-invalid={errors.precio ? 'true' : 'false'}
                      />
                      {errors.precio && (
                        <div id="precio-error" className="error-message" role="alert">
                          {errors.precio.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="stock">Stock *</label>
                      <input
                        type="number"
                        id="stock"
                        min="0"
                        {...register('stock', { 
                          required: 'El stock es requerido',
                          min: { value: 0, message: 'El stock debe ser mayor o igual a 0' }
                        })}
                        aria-describedby={errors.stock ? 'stock-error' : undefined}
                        aria-invalid={errors.stock ? 'true' : 'false'}
                      />
                      {errors.stock && (
                        <div id="stock-error" className="error-message" role="alert">
                          {errors.stock.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="stock_minimo">Stock Mínimo *</label>
                      <input
                        type="number"
                        id="stock_minimo"
                        min="0"
                        {...register('stock_minimo', { 
                          required: 'El stock mínimo es requerido',
                          min: { value: 0, message: 'El stock mínimo debe ser mayor o igual a 0' }
                        })}
                        aria-describedby={errors.stock_minimo ? 'stock-minimo-error' : undefined}
                        aria-invalid={errors.stock_minimo ? 'true' : 'false'}
                      />
                      {errors.stock_minimo && (
                        <div id="stock-minimo-error" className="error-message" role="alert">
                          {errors.stock_minimo.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        rows="4"
                        {...register('descripcion')}
                        aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
                        aria-invalid={errors.descripcion ? 'true' : 'false'}
                      />
                      {errors.descripcion && (
                        <div id="descripcion-error" className="error-message" role="alert">
                          {errors.descripcion.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="imagen">URL de la Imagen</label>
                      <input
                        type="url"
                        id="imagen"
                        {...register('imagen')}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        aria-describedby={errors.imagen ? 'imagen-error' : undefined}
                        aria-invalid={errors.imagen ? 'true' : 'false'}
                      />
                      {errors.imagen && (
                        <div id="imagen-error" className="error-message" role="alert">
                          {errors.imagen.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <div className="form-checkboxes">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            {...register('activo')}
                            aria-describedby="activo-help"
                          />
                          <span>Producto activo</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            {...register('destacado')}
                            aria-describedby="destacado-help"
                          />
                          <span>Producto destacado</span>
                        </label>
                      </div>
                      <div id="activo-help" className="sr-only">
                        Marca esta casilla si el producto debe estar disponible para la venta
                      </div>
                      <div id="destacado-help" className="sr-only">
                        Marca esta casilla si el producto debe aparecer como destacado en el catálogo
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeModal}
                      aria-label="Cancelar cambios"
                    >
                      <FaTimes aria-hidden="true" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      aria-label={editingProduct ? 'Actualizar producto' : 'Crear producto'}
                    >
                      {loading ? (
                        <div className="loading-spinner" aria-hidden="true"></div>
                      ) : (
                        <FaSave aria-hidden="true" />
                      )}
                      {editingProduct ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminProductsPage;
