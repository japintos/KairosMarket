/**
 * Componente principal de la aplicación React
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Importar componentes de layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Importar páginas públicas
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import UserProfilePage from './pages/UserProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';

// Importar páginas de autenticación
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Importar páginas del panel administrativo
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCashPage from './pages/admin/AdminCashPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminContactsPage from './pages/admin/AdminContactsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Importar componentes de protección de rutas
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Importar contextos
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Importar hooks personalizados
// import { useAuth } from './hooks/useAuth';
// import { useCart } from './hooks/useCart';

// Importar estilos
import './styles/App.css';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Configurar toast
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'var(--color-neutral-900)',
    color: 'var(--color-text-inverse)',
    fontFamily: 'var(--font-family-primary)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3) var(--space-4)',
  },
  success: {
    iconTheme: {
      primary: 'var(--color-success)',
      secondary: 'var(--color-text-inverse)',
    },
  },
  error: {
    iconTheme: {
      primary: 'var(--color-error)',
      secondary: 'var(--color-text-inverse)',
    },
  },
};

function AppContent() {
  // Variables disponibles para uso futuro
  // const { user } = useAuth();
  // const { items } = useCart();

  return (
    <div className="app">
      {/* Skip links para accesibilidad */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <a href="#main-navigation" className="skip-link">
        Saltar a la navegación principal
      </a>
      
      <Helmet>
        <title>Kairos Natural Market - Productos Naturales Fraccionados</title>
        <meta name="description" content="Tienda online de productos naturales fraccionados. Hierbas medicinales, especias, frutos secos y más. Envío a domicilio." />
        <meta name="keywords" content="productos naturales, hierbas medicinales, especias, frutos secos, fraccionados, orgánicos" />
        <meta name="author" content="Kairos Natural Market" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Kairos Natural Market - Productos Naturales" />
        <meta property="og:description" content="Tienda online de productos naturales fraccionados" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:image" content={`${window.location.origin}/img/logo-kairos.png`} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kairos Natural Market" />
        <meta name="twitter:description" content="Productos naturales fraccionados" />
        <meta name="twitter:image" content={`${window.location.origin}/img/logo-kairos.png`} />
        
        {/* Favicon */}
        <link rel="icon" href="/img/favicon.ico" />
        <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />
        
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.mercadopago.com" />
      </Helmet>

      {/* Rutas públicas */}
      <Routes>
        {/* Página de inicio */}
        <Route path="/" element={
          <>
            <Header />
            <HomePage />
            <Footer />
          </>
        } />

        {/* Catálogo de productos */}
        <Route path="/catalogo" element={
          <>
            <Header />
            <CatalogPage />
            <Footer />
          </>
        } />

        {/* Página de producto individual */}
        <Route path="/producto/:id" element={
          <>
            <Header />
            <ProductPage />
            <Footer />
          </>
        } />

        {/* Carrito de compras */}
        <Route path="/carrito" element={
          <>
            <Header />
            <CartPage />
            <Footer />
          </>
        } />

        {/* Checkout */}
        <Route path="/checkout" element={
          <>
            <Header />
            <CheckoutPage />
            <Footer />
          </>
        } />

        {/* Contacto */}
        <Route path="/contacto" element={
          <>
            <Header />
            <ContactPage />
            <Footer />
          </>
        } />

        {/* Rutas de usuario (requieren autenticación) */}
        <Route path="/perfil" element={
          <ProtectedRoute>
            <>
              <Header />
              <UserProfilePage />
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/mis-pedidos" element={
          <ProtectedRoute>
            <>
              <Header />
              <OrderHistoryPage />
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/pedido/:id" element={
          <ProtectedRoute>
            <>
              <Header />
              <OrderDetailPage />
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/favoritos" element={
          <ProtectedRoute>
            <>
              <Header />
              <FavoritesPage />
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas del panel administrativo */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route path="/admin" element={
          <AdminRoute>
            <Navigate to="/admin/dashboard" replace />
          </AdminRoute>
        } />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } />

        <Route path="/admin/productos" element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        } />

        <Route path="/admin/categorias" element={
          <AdminRoute>
            <AdminCategoriesPage />
          </AdminRoute>
        } />

        <Route path="/admin/pedidos" element={
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        } />

        <Route path="/admin/clientes" element={
          <AdminRoute>
            <AdminCustomersPage />
          </AdminRoute>
        } />

        <Route path="/admin/caja" element={
          <AdminRoute>
            <AdminCashPage />
          </AdminRoute>
        } />

        <Route path="/admin/reportes" element={
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        } />

        <Route path="/admin/contactos" element={
          <AdminRoute>
            <AdminContactsPage />
          </AdminRoute>
        } />

        <Route path="/admin/configuracion" element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        } />

        {/* Página 404 */}
        <Route path="*" element={
          <>
            <Header />
            <NotFoundPage />
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster toastOptions={toastOptions} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
