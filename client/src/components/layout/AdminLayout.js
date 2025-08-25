import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaUsers, 
  FaShoppingCart, 
  FaEnvelope, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCashRegister,
  FaClipboardList
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <FaHome />,
      label: 'Dashboard',
      description: 'Panel principal'
    },
    {
      path: '/admin/products',
      icon: <FaBox />,
      label: 'Productos',
      description: 'Gestionar productos'
    },
    {
      path: '/admin/categories',
      icon: <FaClipboardList />,
      label: 'Categorías',
      description: 'Gestionar categorías'
    },
    {
      path: '/admin/orders',
      icon: <FaShoppingCart />,
      label: 'Pedidos',
      description: 'Gestionar pedidos'
    },
    {
      path: '/admin/customers',
      icon: <FaUsers />,
      label: 'Clientes',
      description: 'Gestionar clientes'
    },
    {
      path: '/admin/contacts',
      icon: <FaEnvelope />,
      label: 'Mensajes',
      description: 'Mensajes de contacto'
    },
    {
      path: '/admin/cash',
      icon: <FaCashRegister />,
      label: 'Caja',
      description: 'Movimientos de caja'
    },
    {
      path: '/admin/reports',
      icon: <FaChartBar />,
      label: 'Reportes',
      description: 'Reportes y estadísticas'
    },
    {
      path: '/admin/settings',
      icon: <FaCog />,
      label: 'Configuración',
      description: 'Configuración del sistema'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Sesión cerrada correctamente');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const currentPage = menuItems.find(item => isActive(item.path))?.label || 'Panel';

  return (
    <div className="admin-layout" role="application" aria-label="Panel Administrativo Kairos">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Cerrar menú lateral"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="sidebar-header">
          <div className="logo">
            <img src="/img/logo1.jpg" alt="Kairos Natural Market" />
            <span>Kairos Admin</span>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
            aria-expanded={sidebarOpen}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Menú de navegación">
          <ul className="nav-menu" role="menubar">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item" role="none">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  role="menuitem"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  aria-label={`${item.label} - ${item.description}`}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            aria-label="Cerrar sesión de administrador"
          >
            <FaSignOutAlt aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="admin-main" role="main">
        {/* Top Bar */}
        <header className="admin-header" role="banner">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú lateral"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <FaBars />
            </button>
            <nav className="breadcrumb" aria-label="Navegación de migas de pan">
              <span>{currentPage}</span>
            </nav>
          </div>

          <div className="header-right">
            <div className="admin-info" role="status" aria-label="Información del administrador">
              <span className="admin-name">Administrador</span>
              <span className="admin-role">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content" role="region" aria-label="Contenido de la página">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
