import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaDownload } from 'react-icons/fa';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 1250.00,
      status: 'completed',
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      total: 890.50,
      status: 'pending',
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      total: 2100.00,
      status: 'cancelled',
      items: 5
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="order-history-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Historial de Pedidos</h1>
          <p>Revisa todos tus pedidos anteriores</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar por número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="orders-content">
        {filteredOrders.length > 0 ? (
          <div className="orders-table">
            <div className="table-header">
              <div>Número</div>
              <div>Fecha</div>
              <div>Total</div>
              <div>Estado</div>
              <div>Items</div>
              <div>Acciones</div>
            </div>
            
            {filteredOrders.map((order) => (
              <div key={order.id} className="table-row">
                <div className="order-id">{order.id}</div>
                <div className="order-date">{new Date(order.date).toLocaleDateString()}</div>
                <div className="order-total">${order.total.toFixed(2)}</div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
                <div className="order-items">{order.items} productos</div>
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="btn-icon">
                    <FaEye />
                  </Link>
                  <button className="btn-icon">
                    <FaDownload />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaSearch />
            <h3>No se encontraron pedidos</h3>
            <p>No hay pedidos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
