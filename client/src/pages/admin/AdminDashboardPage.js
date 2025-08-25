/**
 * Dashboard del panel administrativo - AdminDashboardPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaDollarSign,
  FaChartLine,
  FaArrowUp
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0
    },
    topProducts: [],
    recentOrders: [],
    recentMessages: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Usar datos de ejemplo si hay error
      setDashboardData({
        stats: {
          totalSales: 15420,
          totalOrders: 47,
          totalCustomers: 23,
          averageOrderValue: 328
        },
        topProducts: [
          { producto_nombre: 'Chanel N°5', cantidad_vendida: 12, total_vendido: 2400 },
          { producto_nombre: 'Dior Sauvage', cantidad_vendida: 8, total_vendido: 1600 },
          { producto_nombre: 'Versace Eros', cantidad_vendida: 6, total_vendido: 900 },
          { producto_nombre: 'Paco Rabanne 1 Million', cantidad_vendida: 5, total_vendido: 750 }
        ],
        recentOrders: [],
        recentMessages: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: '#ffc107',
      en_preparacion: '#17a2b8',
      enviado: '#28a745',
      entregado: '#6c757d',
      cancelado: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendiente: 'Pendiente',
      en_preparacion: 'En Preparación',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard - Panel Administrativo</title>
      </Helmet>

      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Bienvenido al panel de administración de Kairos Natural Market</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon sales">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>Ventas Totales</h3>
              <p className="stat-number">{formatCurrency(dashboardData.stats.totalSales)}</p>
              <span className="stat-change positive">
                <FaArrowUp /> +15% este mes
              </span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon orders">
              <FaShoppingCart />
            </div>
            <div className="stat-content">
              <h3>Órdenes</h3>
              <p className="stat-number">{dashboardData.stats.totalOrders}</p>
              <span className="stat-change positive">
                <FaArrowUp /> +8% este mes
              </span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon customers">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Clientes</h3>
              <p className="stat-number">{dashboardData.stats.totalCustomers}</p>
              <span className="stat-change positive">
                <FaArrowUp /> +12% este mes
              </span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon average">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>Promedio por Orden</h3>
              <p className="stat-number">{formatCurrency(dashboardData.stats.averageOrderValue)}</p>
              <span className="stat-change positive">
                <FaArrowUp /> +5% este mes
              </span>
            </div>
          </motion.div>
        </div>

        {/* Top Products Table */}
        <motion.div
          className="top-products-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <h2>Productos Más Vendidos</h2>
            <Link to="/admin/productos" className="view-all-link">
              Ver todos los productos
            </Link>
          </div>
          
          <div className="table-container">
            <table className="top-products-table">
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>VENTAS</th>
                  <th>INGRESOS</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topProducts.map((product, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="table-row"
                  >
                    <td className="product-name">{product.producto_nombre}</td>
                    <td className="sales-count">{product.cantidad_vendida}</td>
                    <td className="revenue">{formatCurrency(product.total_vendido)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="activity-grid">
            {/* Recent Orders */}
            <motion.div
              className="activity-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="activity-header">
                <h3>Pedidos Recientes</h3>
                <Link to="/admin/pedidos" className="view-all">Ver todos</Link>
              </div>
              <div className="activity-list">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="activity-item">
                      <div className="activity-content">
                        <h4>{order.cliente_nombre}</h4>
                        <p>{formatCurrency(order.total)}</p>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.estado) }}
                        >
                          {getStatusLabel(order.estado)}
                        </span>
                      </div>
                      <div className="activity-time">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No hay pedidos recientes</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Messages */}
            <motion.div
              className="activity-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="activity-header">
                <h3>Mensajes Recientes</h3>
                <Link to="/admin/contactos" className="view-all">Ver todos</Link>
              </div>
              <div className="activity-list">
                {dashboardData.recentMessages.length > 0 ? (
                  dashboardData.recentMessages.map((message) => (
                    <div key={message.id} className="activity-item">
                      <div className="activity-content">
                        <h4>{message.nombre}</h4>
                        <p>{message.asunto}</p>
                      </div>
                      <div className="activity-time">
                        {new Date(message.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No hay mensajes recientes</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3>Acciones Rápidas</h3>
          <div className="actions-grid">
            <Link to="/admin/productos" className="action-card">
              <FaBox />
              <span>Gestionar Productos</span>
            </Link>
            <Link to="/admin/pedidos" className="action-card">
              <FaShoppingCart />
              <span>Ver Pedidos</span>
            </Link>
            <Link to="/admin/contactos" className="action-card">
              <FaEnvelope />
              <span>Mensajes</span>
            </Link>
            <Link to="/admin/caja" className="action-card">
              <FaDollarSign />
              <span>Control de Caja</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
