import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaEye,
  FaEyeSlash,
  FaSave,
  FaTimes,
  FaImage
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminCategoriesPage.css';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Cargar categorías
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorías
  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal
  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setValue('nombre', category.nombre);
      setValue('descripcion', category.descripcion);
      setValue('imagen', category.imagen);
      setValue('activo', category.activo);
    } else {
      reset();
      setValue('activo', true);
    }
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    reset();
  };

  // Guardar categoría
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success(
          editingCategory 
            ? 'Categoría actualizada correctamente'
            : 'Categoría creada correctamente'
        );
        closeModal();
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Categoría eliminada correctamente');
        fetchCategories();
      } else {
        toast.error('Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Cambiar estado activo/inactivo
  const toggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ activo: !currentStatus })
      });

      if (response.ok) {
        toast.success(
          currentStatus 
            ? 'Categoría desactivada correctamente'
            : 'Categoría activada correctamente'
        );
        fetchCategories();
      } else {
        toast.error('Error al cambiar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Gestión de Categorías - Panel Administrativo</title>
      </Helmet>

      <div className="admin-categories-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Categorías</h1>
            <p>Administra las categorías de productos de tu tienda</p>
          </div>
          <motion.button
            className="btn-primary"
            onClick={() => openModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Nueva Categoría
          </motion.button>
        </div>

        <div className="page-content">
          <div className="filters-section">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="categories-grid">
            <AnimatePresence>
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  className={`category-card ${!category.activo ? 'inactive' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="category-image">
                    {category.imagen ? (
                      <img src={category.imagen} alt={category.nombre} />
                    ) : (
                      <div className="no-image">
                        <FaImage />
                      </div>
                    )}
                    <div className="category-status">
                      {category.activo ? (
                        <span className="status active">Activa</span>
                      ) : (
                        <span className="status inactive">Inactiva</span>
                      )}
                    </div>
                  </div>

                  <div className="category-info">
                    <h3>{category.nombre}</h3>
                    <p>{category.descripcion}</p>
                    <div className="category-stats">
                      <span>{category.productos_count || 0} productos</span>
                    </div>
                  </div>

                  <div className="category-actions">
                    <button
                      className="btn-icon"
                      onClick={() => toggleActive(category.id, category.activo)}
                      title={category.activo ? 'Desactivar' : 'Activar'}
                    >
                      {category.activo ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => openModal(category)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => deleteCategory(category.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCategories.length === 0 && (
              <div className="empty-state">
                <FaImage />
                <h3>No hay categorías</h3>
                <p>
                  {searchTerm 
                    ? 'No se encontraron categorías con ese término de búsqueda'
                    : 'Crea tu primera categoría para organizar tus productos'
                  }
                </p>
                {!searchTerm && (
                  <button
                    className="btn-primary"
                    onClick={() => openModal()}
                  >
                    <FaPlus /> Crear Categoría
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear/editar categoría */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h2>
                  <button className="btn-icon" onClick={closeModal}>
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      {...register('nombre', { 
                        required: 'El nombre es requerido',
                        minLength: {
                          value: 2,
                          message: 'El nombre debe tener al menos 2 caracteres'
                        }
                      })}
                      placeholder="Ej: Hierbas Medicinales"
                    />
                    {errors.nombre && (
                      <span className="error">{errors.nombre.message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      {...register('descripcion')}
                      placeholder="Describe la categoría..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>URL de Imagen</label>
                    <input
                      type="url"
                      {...register('imagen')}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        {...register('activo')}
                      />
                      <span className="checkmark"></span>
                      Categoría activa
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <FaSave />
                          {editingCategory ? 'Actualizar' : 'Crear'}
                        </>
                      )}
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

export default AdminCategoriesPage;
