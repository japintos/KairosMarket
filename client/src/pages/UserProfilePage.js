/**
 * Página de perfil de usuario - UserProfilePage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setValue('nombre', user.nombre || '');
      setValue('apellido', user.apellido || '');
      setValue('email', user.email || '');
      setValue('telefono', user.telefono || '');
      setValue('direccion', user.direccion || '');
      setValue('ciudad', user.ciudad || '');
      setValue('provincia', user.provincia || '');
      setValue('codigo_postal', user.codigo_postal || '');
    }
  }, [user, setValue]);

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setEditing(false);
      toast.success('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditing(false);
    reset();
  };

  if (!user) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Mi Perfil - Kairos Natural Market</title>
        <meta name="description" content="Gestiona tu perfil y datos personales" />
      </Helmet>

      <div className="user-profile-page">
        <div className="container">
          {/* Header */}
          <div className="profile-header">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información personal y preferencias</p>
          </div>

          <div className="profile-content">
            {/* Información del perfil */}
            <motion.div
              className="profile-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="info-header">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-details">
                  <h2>{user.nombre} {user.apellido}</h2>
                  <p>{user.email}</p>
                  <span className="member-since">
                    Miembro desde {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="edit-btn"
                  onClick={() => setEditing(true)}
                  disabled={editing}
                >
                  <FaEdit />
                  Editar
                </button>
              </div>
            </motion.div>

            {/* Formulario de edición */}
            <motion.div
              className="profile-form-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-section">
                  <h3>Información Personal</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre *</label>
                      <input
                        type="text"
                        id="nombre"
                        {...register('nombre', { required: 'El nombre es requerido' })}
                        className={errors.nombre ? 'error' : ''}
                        disabled={!editing}
                      />
                      {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="apellido">Apellido *</label>
                      <input
                        type="text"
                        id="apellido"
                        {...register('apellido', { required: 'El apellido es requerido' })}
                        className={errors.apellido ? 'error' : ''}
                        disabled={!editing}
                      />
                      {errors.apellido && <span className="error-message">{errors.apellido.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        className={errors.email ? 'error' : ''}
                        disabled={!editing}
                      />
                      {errors.email && <span className="error-message">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        {...register('telefono')}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dirección de Envío</h3>
                  
                  <div className="form-group">
                    <label htmlFor="direccion">Dirección</label>
                    <input
                      type="text"
                      id="direccion"
                      {...register('direccion')}
                      placeholder="Calle, número, piso, departamento"
                      disabled={!editing}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="ciudad">Ciudad</label>
                      <input
                        type="text"
                        id="ciudad"
                        {...register('ciudad')}
                        disabled={!editing}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="provincia">Provincia</label>
                      <input
                        type="text"
                        id="provincia"
                        {...register('provincia')}
                        disabled={!editing}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="codigo_postal">Código Postal</label>
                      <input
                        type="text"
                        id="codigo_postal"
                        {...register('codigo_postal')}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                {editing && (
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Estadísticas del usuario */}
            <motion.div
              className="user-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>Mis Estadísticas</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Pedidos Realizados</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Productos Favoritos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">$15,000</div>
                  <div className="stat-label">Total Gastado</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Meses como Cliente</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
