import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTruck, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaDollarSign,
  FaPrint
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminOrdersPage.css';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const orderStatuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente', color: '#ff9800' },
    { value: 'confirmado', label: 'Confirmado', color: '#2196f3' },
    { value: 'preparando', label: 'Preparando', color: '#9c27b0' },
    { value: 'enviado', label: 'Enviado', color: '#3f51b5' },
    { value: 'entregado', label: 'Entregado', color: '#4caf50' },
    { value: 'cancelado', label: 'Cancelado', color: '#f44336' }
  ];

  const dateFilters = [
    { value: '', label: 'Todas las fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ];

  // Cargar pedidos
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Error al cargar los pedidos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.estado === statusFilter;
    
    const matchesDate = !dateFilter || filterByDate(order.fecha_creacion, dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filterByDate = (orderDate, filter) => {
    const order = new Date(orderDate);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return order.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return order >= weekAgo;
      case 'month':
        return order.getMonth() === now.getMonth() && order.getFullYear() === now.getFullYear();
      case 'year':
        return order.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  // Ver detalles del pedido
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (response.ok) {
        toast.success('Estado del pedido actualizado correctamente');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, estado: newStatus });
        }
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#666';
  };

  // Obtener label del estado
  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Imprimir pedido
  const printOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Pedido ${order.numero_pedido}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kairos Natural Market</h1>
            <h2>Pedido ${order.numero_pedido}</h2>
          </div>
          <div class="order-info">
            <p><strong>Fecha:</strong> ${formatDate(order.fecha_creacion)}</p>
            <p><strong>Estado:</strong> ${getStatusLabel(order.estado)}</p>
            <p><strong>Método de pago:</strong> ${order.metodo_pago}</p>
          </div>
          <div class="customer-info">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.cliente.nombre}</p>
            <p><strong>Email:</strong> ${order.cliente.email}</p>
            <p><strong>Teléfono:</strong> ${order.cliente.telefono}</p>
            <p><strong>Dirección:</strong> ${order.direccion_entrega}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.producto.nombre}</td>
                  <td>${item.cantidad}</td>
                  <td>${formatPrice(item.precio)}</td>
                  <td>${formatPrice(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Gestión de Pedidos - Panel Administrativo</title>
      </Helmet>

      <div className="admin-orders-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Pedidos</h1>
            <p>Administra y da seguimiento a todos los pedidos de tu tienda</p>
          </div>
        </div>

        <div className="page-content">
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido, cliente..."
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
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <FaCalendarAlt />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  {dateFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <div className="table-cell">Pedido</div>
              <div className="table-cell">Cliente</div>
              <div className="table-cell">Fecha</div>
              <div className="table-cell">Total</div>
              <div className="table-cell">Estado</div>
              <div className="table-cell">Acciones</div>
            </div>

            <div className="table-body">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="table-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="table-cell">
                      <strong>#{order.numero_pedido}</strong>
                    </div>
                    <div className="table-cell">
                      <div className="customer-info">
                        <div className="customer-name">{order.cliente.nombre}</div>
                        <div className="customer-email">{order.cliente.email}</div>
                      </div>
                    </div>
                    <div className="table-cell">
                      {formatDate(order.fecha_creacion)}
                    </div>
                    <div className="table-cell">
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                    <div className="table-cell">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.estado) }}
                      >
                        {getStatusLabel(order.estado)}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => viewOrderDetails(order)}
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => printOrder(order)}
                          title="Imprimir"
                        >
                          <FaPrint />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredOrders.length === 0 && (
                <div className="empty-state">
                  <FaClock />
                  <h3>No hay pedidos</h3>
                  <p>
                    {searchTerm || statusFilter || dateFilter
                      ? 'No se encontraron pedidos con los filtros aplicados'
                      : 'Aún no hay pedidos en tu tienda'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de detalles del pedido */}
        <AnimatePresence>
          {showModal && selectedOrder && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="modal-content order-details-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Pedido #{selectedOrder.numero_pedido}</h2>
                  <button className="btn-icon" onClick={closeModal}>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="order-summary">
                    <div className="summary-item">
                      <FaCalendarAlt />
                      <div>
                        <label>Fecha de creación</label>
                        <span>{formatDate(selectedOrder.fecha_creacion)}</span>
                      </div>
                    </div>
                    
                    <div className="summary-item">
                      <FaDollarSign />
                      <div>
                        <label>Total</label>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                    
                    <div className="summary-item">
                      <FaTruck />
                      <div>
                        <label>Método de pago</label>
                        <span>{selectedOrder.metodo_pago}</span>
                      </div>
                    </div>
                  </div>

                  <div className="customer-details">
                    <h3>Información del Cliente</h3>
                    <div className="customer-grid">
                      <div className="customer-item">
                        <FaUser />
                        <span>{selectedOrder.cliente.nombre}</span>
                      </div>
                      <div className="customer-item">
                        <FaPhone />
                        <span>{selectedOrder.cliente.telefono}</span>
                      </div>
                      <div className="customer-item">
                        <FaMapMarkerAlt />
                        <span>{selectedOrder.direccion_entrega}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    <h3>Productos del Pedido</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <h4>{item.producto.nombre}</h4>
                            <p>{item.producto.descripcion}</p>
                          </div>
                          <div className="item-details">
                            <span className="quantity">x{item.cantidad}</span>
                            <span className="price">{formatPrice(item.precio)}</span>
                            <span className="subtotal">{formatPrice(item.precio * item.cantidad)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="status-update">
                    <h3>Actualizar Estado</h3>
                    <div className="status-buttons">
                      {orderStatuses.filter(s => s.value).map(status => (
                        <button
                          key={status.value}
                          className={`status-btn ${selectedOrder.estado === status.value ? 'active' : ''}`}
                          onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                          style={{ 
                            backgroundColor: selectedOrder.estado === status.value ? status.color : 'transparent',
                            borderColor: status.color,
                            color: selectedOrder.estado === status.value ? 'white' : status.color
                          }}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => printOrder(selectedOrder)}
                  >
                    <FaPrint /> Imprimir Pedido
                  </button>
                  <button
                    className="btn-primary"
                    onClick={closeModal}
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminOrdersPage;
