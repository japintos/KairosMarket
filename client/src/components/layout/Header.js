/**
 * Componente Header principal - Diseño Minimalista
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaHeart, FaCog } from 'react-icons/fa';
import SearchAutocomplete from '../search/SearchAutocomplete';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navegación principal
  const navItems = [
    { path: '/', label: 'INICIO' },
    { path: '/catalogo', label: 'CATALOGO' },
    { path: '/contacto', label: 'CONTACTO' }
  ];

  // Navegación de usuario
  const userNavItems = [
    { path: '/perfil', label: 'Mi Perfil', icon: FaUser },
    { path: '/mis-pedidos', label: 'Mis Pedidos' },
    { path: '/favoritos', label: 'Favoritos', icon: FaHeart }
  ];

  // Navegación de admin
  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Panel Admin', icon: FaCog }
  ];

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`} id="main-navigation">
      <div className="header-content">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/img/logo1.jpg" alt="Kairos Natural Market" />
          <span className="logo-text">Kairos Natural Market</span>
        </Link>

        {/* Búsqueda */}
        <SearchAutocomplete
          placeholder="Buscar productos..."
          className="header-search"
          onSearch={(query) => {
            // Aquí se puede implementar la búsqueda de sugerencias
            console.log('Búsqueda:', query);
          }}
          suggestions={[]} // Aquí se pueden pasar las sugerencias
        />

        {/* Navegación principal */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Carrito */}
        <Link to="/carrito" className="cart-button">
          <FaShoppingCart />
          {itemCount > 0 && (
            <span className="cart-badge">{itemCount}</span>
          )}
        </Link>

        {/* Menú de usuario */}
        {isAuthenticated ? (
          <div className="user-menu">
            <button className="user-button">
              <FaUser />
              <span className="user-name">{user?.nombre}</span>
            </button>
            <div className="user-dropdown">
              <ul className="user-nav-list">
                {/* Mostrar opciones de admin si el usuario es admin */}
                {user?.rol === 'admin' && (
                  <>
                    {adminNavItems.map((item) => (
                      <li key={item.path} className="user-nav-item admin-nav-item">
                        <Link to={item.path} className="user-nav-link admin-nav-link">
                          {item.icon && <item.icon />}
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li className="user-nav-divider"></li>
                  </>
                )}
                
                {userNavItems.map((item) => (
                  <li key={item.path} className="user-nav-item">
                    <Link to={item.path} className="user-nav-link">
                      {item.icon && <item.icon />}
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="user-nav-item">
                  <button onClick={handleLogout} className="user-nav-link logout-button">
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-link">
              Iniciar Sesión
            </Link>
          </div>
        )}

        {/* Botón de menú móvil */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menú móvil */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="container">
          <nav className="mobile-nav" id="mobile-menu" role="navigation" aria-label="Menú móvil">
            <ul className="mobile-nav-list">
              {navItems.map((item) => (
                <li key={item.path} className="mobile-nav-item">
                  <Link 
                    to={item.path} 
                    className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              
              {isAuthenticated && (
                <>
                  <li className="mobile-nav-divider"></li>
                  
                  {/* Mostrar opciones de admin si el usuario es admin */}
                  {user?.rol === 'admin' && (
                    <>
                      {adminNavItems.map((item) => (
                        <li key={item.path} className="mobile-nav-item admin-nav-item">
                          <Link to={item.path} className="mobile-nav-link admin-nav-link">
                            {item.icon && <item.icon />}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li className="mobile-nav-divider"></li>
                    </>
                  )}
                  
                  {userNavItems.map((item) => (
                    <li key={item.path} className="mobile-nav-item">
                      <Link to={item.path} className="mobile-nav-link">
                        {item.icon && <item.icon />}
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="mobile-nav-item">
                    <button onClick={handleLogout} className="mobile-nav-link logout-button">
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
