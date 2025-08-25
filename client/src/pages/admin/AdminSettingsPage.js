import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaCog, 
  FaSave, 
  FaStore, 
  FaCreditCard, 
  FaTruck,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaShieldAlt,
  FaPalette,
  FaBell,
  FaTimesCircle,
  FaCheck
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const tabs = [
    { id: 'general', label: 'General', icon: FaStore },
    { id: 'payment', label: 'Pagos', icon: FaCreditCard },
    { id: 'shipping', label: 'Envíos', icon: FaTruck },
    { id: 'contact', label: 'Contacto', icon: FaEnvelope },
    { id: 'appearance', label: 'Apariencia', icon: FaPalette },
    { id: 'notifications', label: 'Notificaciones', icon: FaBell },
    { id: 'security', label: 'Seguridad', icon: FaShieldAlt }
  ];

  // Cargar configuración
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Establecer valores en el formulario
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
      } else {
        toast.error('Error al cargar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración
  const saveSettings = async (data) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Configuración guardada correctamente');
        setSettings(data);
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Probar configuración de email
  const testEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Email de prueba enviado correctamente');
      } else {
        toast.error('Error al enviar email de prueba');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Probar configuración de MercadoPago
  const testMercadoPagoConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-mercadopago', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Configuración de MercadoPago verificada correctamente');
      } else {
        toast.error('Error en la configuración de MercadoPago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Configuración - Panel Administrativo</title>
      </Helmet>

      <div className="admin-settings-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Configuración</h1>
            <p>Gestiona la configuración de tu tienda</p>
          </div>
          <motion.button
            className="btn-primary"
            onClick={handleSubmit(saveSettings)}
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <FaSave /> Guardar Cambios
              </>
            )}
          </motion.button>
        </div>

        <div className="page-content">
          <div className="settings-container">
            {/* Tabs de navegación */}
            <div className="settings-tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComponent />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Contenido de las pestañas */}
            <div className="settings-content">
              {activeTab === 'general' && (
                <div className="settings-section">
                  <h2>Configuración General</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nombre de la Tienda *</label>
                      <input
                        type="text"
                        {...register('nombre_tienda', { 
                          required: 'El nombre de la tienda es requerido' 
                        })}
                        placeholder="Kairos Natural Market"
                      />
                      {errors.nombre_tienda && (
                        <span className="error">{errors.nombre_tienda.message}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Descripción de la Tienda</label>
                      <textarea
                        {...register('descripcion_tienda')}
                        placeholder="Descripción de tu tienda..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Moneda *</label>
                      <select
                        {...register('moneda', { 
                          required: 'La moneda es requerida' 
                        })}
                      >
                        <option value="ARS">Peso Argentino (ARS)</option>
                        <option value="USD">Dólar Estadounidense (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                      {errors.moneda && (
                        <span className="error">{errors.moneda.message}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Zona Horaria *</label>
                      <select
                        {...register('zona_horaria', { 
                          required: 'La zona horaria es requerida' 
                        })}
                      >
                        <option value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</option>
                        <option value="America/New_York">Nueva York (GMT-5)</option>
                        <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      </select>
                      {errors.zona_horaria && (
                        <span className="error">{errors.zona_horaria.message}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>URL del Sitio Web</label>
                      <input
                        type="url"
                        {...register('url_sitio')}
                        placeholder="https://kairosnatural.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email de Contacto *</label>
                      <input
                        type="email"
                        {...register('email_contacto', { 
                          required: 'El email de contacto es requerido',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        placeholder="contacto@kairosnatural.com"
                      />
                      {errors.email_contacto && (
                        <span className="error">{errors.email_contacto.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="settings-section">
                  <h2>Configuración de Pagos</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>MercadoPago Access Token</label>
                      <input
                        type="password"
                        {...register('mercadopago_access_token')}
                        placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={testMercadoPagoConfig}
                      >
                        <FaCheck /> Probar Configuración
                      </button>
                    </div>

                    <div className="form-group">
                      <label>MercadoPago Public Key</label>
                      <input
                        type="text"
                        {...register('mercadopago_public_key')}
                        placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>

                    <div className="form-group">
                      <label>Modo de MercadoPago</label>
                      <select {...register('mercadopago_mode')}>
                        <option value="sandbox">Sandbox (Pruebas)</option>
                        <option value="production">Producción</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Habilitar Pago en Efectivo</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_efectivo')}
                        />
                        <span>Permitir pagos en efectivo</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Habilitar Transferencia Bancaria</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_transferencia')}
                        />
                        <span>Permitir transferencias bancarias</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="settings-section">
                  <h2>Configuración de Envíos</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Costo de Envío Estándar</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('costo_envio_estandar')}
                        placeholder="500"
                      />
                    </div>

                    <div className="form-group">
                      <label>Umbral de Envío Gratis</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('umbral_envio_gratis')}
                        placeholder="5000"
                      />
                    </div>

                    <div className="form-group">
                      <label>Tiempo de Entrega (días)</label>
                      <input
                        type="number"
                        {...register('tiempo_entrega_dias')}
                        placeholder="3-5"
                      />
                    </div>

                    <div className="form-group">
                      <label>Habilitar Retiro en Local</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_retiro_local')}
                        />
                        <span>Permitir retiro en el local</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Dirección del Local</label>
                      <textarea
                        {...register('direccion_local')}
                        placeholder="Dirección completa del local..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Horarios de Atención</label>
                      <textarea
                        {...register('horarios_atencion')}
                        placeholder="Lunes a Viernes: 9:00 - 18:00..."
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="settings-section">
                  <h2>Información de Contacto</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Teléfono Principal</label>
                      <input
                        type="tel"
                        {...register('telefono_principal')}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>

                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input
                        type="tel"
                        {...register('whatsapp')}
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email de Ventas</label>
                      <input
                        type="email"
                        {...register('email_ventas')}
                        placeholder="ventas@kairosnatural.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email de Soporte</label>
                      <input
                        type="email"
                        {...register('email_soporte')}
                        placeholder="soporte@kairosnatural.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Dirección Completa</label>
                      <textarea
                        {...register('direccion_completa')}
                        placeholder="Dirección completa de la empresa..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Redes Sociales - Facebook</label>
                      <input
                        type="url"
                        {...register('facebook_url')}
                        placeholder="https://facebook.com/kairosnatural"
                      />
                    </div>

                    <div className="form-group">
                      <label>Redes Sociales - Instagram</label>
                      <input
                        type="url"
                        {...register('instagram_url')}
                        placeholder="https://instagram.com/kairosnatural"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h2>Apariencia del Sitio</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Color Principal</label>
                      <input
                        type="color"
                        {...register('color_principal')}
                        defaultValue="#4caf50"
                      />
                    </div>

                    <div className="form-group">
                      <label>Color Secundario</label>
                      <input
                        type="color"
                        {...register('color_secundario')}
                        defaultValue="#2196f3"
                      />
                    </div>

                    <div className="form-group">
                      <label>Logo de la Tienda</label>
                      <input
                        type="url"
                        {...register('logo_url')}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>

                    <div className="form-group">
                      <label>Favicon</label>
                      <input
                        type="url"
                        {...register('favicon_url')}
                        placeholder="https://ejemplo.com/favicon.ico"
                      />
                    </div>

                    <div className="form-group">
                      <label>Imagen de Banner Principal</label>
                      <input
                        type="url"
                        {...register('banner_principal_url')}
                        placeholder="https://ejemplo.com/banner.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label>Texto del Banner</label>
                      <textarea
                        {...register('texto_banner')}
                        placeholder="Texto que aparecerá en el banner principal..."
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2>Configuración de Notificaciones</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Email SMTP Host</label>
                      <input
                        type="text"
                        {...register('smtp_host')}
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email SMTP Puerto</label>
                      <input
                        type="number"
                        {...register('smtp_puerto')}
                        placeholder="587"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email SMTP Usuario</label>
                      <input
                        type="email"
                        {...register('smtp_usuario')}
                        placeholder="tu-email@gmail.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email SMTP Contraseña</label>
                      <input
                        type="password"
                        {...register('smtp_password')}
                        placeholder="Tu contraseña de aplicación"
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={testEmailConfig}
                      >
                        <FaCheck /> Probar Email
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Notificar Nuevos Pedidos</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('notificar_nuevos_pedidos')}
                        />
                        <span>Enviar email cuando llegue un nuevo pedido</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notificar Cambios de Estado</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('notificar_cambios_estado')}
                        />
                        <span>Enviar email cuando cambie el estado de un pedido</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notificar Stock Bajo</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('notificar_stock_bajo')}
                        />
                        <span>Enviar email cuando un producto tenga stock bajo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2>Configuración de Seguridad</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Habilitar HTTPS</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_https')}
                        />
                        <span>Forzar conexiones HTTPS</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Habilitar Autenticación de Dos Factores</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_2fa')}
                        />
                        <span>Requerir autenticación de dos factores para administradores</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tiempo de Sesión (minutos)</label>
                      <input
                        type="number"
                        {...register('tiempo_sesion')}
                        placeholder="60"
                      />
                    </div>

                    <div className="form-group">
                      <label>Intentos Máximos de Login</label>
                      <input
                        type="number"
                        {...register('max_intentos_login')}
                        placeholder="5"
                      />
                    </div>

                    <div className="form-group">
                      <label>Habilitar Captcha</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_captcha')}
                        />
                        <span>Mostrar captcha en formularios de contacto</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Habilitar Logs de Seguridad</label>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          {...register('habilitar_logs_seguridad')}
                        />
                        <span>Registrar eventos de seguridad</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettingsPage;
