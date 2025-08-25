/**
 * Página de login del panel administrativo - AdminLoginPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (formData) => {
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login con:', { email: formData.email, password: formData.password ? '***' : 'NO PASSWORD' });
      
      const result = await login(formData.email, formData.password);
      console.log('📋 Resultado del login:', result);
      
      if (result.success) {
        console.log('✅ Login exitoso, verificando rol...');
        console.log('👤 Usuario:', result.user);
        
        // ✅ CORREGIDO: Verificar si el usuario es admin usando el resultado del login
        if (result.user && result.user.rol === 'admin') {
          console.log('🎯 Usuario es admin, redirigiendo...');
          navigate('/admin/dashboard');
        } else {
          console.log('❌ Usuario no es admin, redirigiendo al frontend...');
          // Si no es admin, redirigir al frontend
          toast.error('No tiene permisos de administrador');
          navigate('/');
        }
      } else {
        console.log('❌ Login falló:', result.error);
      }
      
    } catch (error) {
      console.error('💥 Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Verifique las credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Panel Administrativo</title>
      </Helmet>

      <div className="admin-login-page">
        <div className="login-container">
          <motion.div
            className="login-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="login-header">
              <div className="logo">
                <img src="/img/logo1.jpg" alt="Kairos Natural Market" />
                <h1>Kairos Natural Market</h1>
              </div>
              <h2>Panel Administrativo</h2>
              <p>Inicia sesión para acceder al panel de administración</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="admin@kairosnatural.com"
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    })}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="login-footer">
              <div className="demo-credentials">
                <h4>Credenciales de Demo:</h4>
                <p><strong>Email:</strong> admin@kairosnatural.com</p>
                <p><strong>Contraseña:</strong> admin123</p>
              </div>
              
              <div className="back-to-site">
                <a href="/" className="back-link">
                  ← Volver al sitio web
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="login-background">
          <div className="background-pattern"></div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
