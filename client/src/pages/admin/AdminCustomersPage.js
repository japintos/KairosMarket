import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaUser, 
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShoppingCart,
  FaDollarSign,
  FaStar,
  FaChartLine,
  FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminCustomersPage.css';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const statusFilters = [
    { value: '', label: 'Todos los clientes' },
    { value: 'active', label: 'Clientes activos' },
    { value: 'inactive', label: 'Clientes inactivos' },
    { value: 'new', label: 'Clientes nuevos' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'orders', label: 'Más pedidos' },
    { value: 'spent', label: 'Mayor gasto' },
    { value: 'name', label: 'Nombre A-Z' }
  ];

  // Cargar clientes
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error('Error al cargar los clientes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar clientes
  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.telefono.includes(searchTerm);
      
      const matchesStatus = !statusFilter || getCustomerStatus(customer) === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.fecha_registro) - new Date(a.fecha_registro);
        case 'oldest':
          return new Date(a.fecha_registro) - new Date(b.fecha_registro);
        case 'orders':
          return (b.total_pedidos || 0) - (a.total_pedidos || 0);
        case 'spent':
          return (b.total_gastado || 0) - (a.total_gastado || 0);
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        default:
          return 0;
      }
    });

  // Obtener estado del cliente
  const getCustomerStatus = (customer) => {
    const lastOrderDate = customer.ultimo_pedido ? new Date(customer.ultimo_pedido) : null;
    const now = new Date();
    const daysSinceLastOrder = lastOrderDate ? (now - lastOrderDate) / (1000 * 60 * 60 * 24) : null;
    
    if (!lastOrderDate) return 'new';
    if (daysSinceLastOrder <= 30) return 'active';
    return 'inactive';
  };

  // Ver detalles del cliente
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#f44336';
      case 'new': return '#2196f3';
      default: return '#666';
    }
  };

  // Obtener label del estado
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'new': return 'Nuevo';
      default: return 'Desconocido';
    }
  };

  // Calcular estadísticas del cliente
  const getCustomerStats = (customer) => {
    const status = getCustomerStatus(customer);
    const avgOrderValue = customer.total_pedidos > 0 
      ? customer.total_gastado / customer.total_pedidos 
      : 0;
    
    return {
      status,
      avgOrderValue,
      daysSinceRegistration: Math.floor(
        (new Date() - new Date(customer.fecha_registro)) / (1000 * 60 * 60 * 24)
      )
    };
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Gestión de Clientes - Panel Administrativo</title>
      </Helmet>

      <div className="admin-customers-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Clientes</h1>
            <p>Administra y analiza la información de tus clientes</p>
          </div>
        </div>

        <div className="page-content">
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono..."
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
                  {statusFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <FaChartLine />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="customers-grid">
            <AnimatePresence>
              {filteredAndSortedCustomers.map((customer) => {
                const stats = getCustomerStats(customer);
                return (
                  <motion.div
                    key={customer.id}
                    className="customer-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="customer-header">
                      <div className="customer-avatar">
                        <FaUser />
                      </div>
                      <div className="customer-info">
                        <h3>{customer.nombre}</h3>
                        <p className="customer-email">{customer.email}</p>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(stats.status) }}
                        >
                          {getStatusLabel(stats.status)}
                        </span>
                      </div>
                    </div>

                    <div className="customer-details">
                      <div className="detail-item">
                        <FaPhone />
                        <span>{customer.telefono || 'No especificado'}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{customer.direccion || 'No especificada'}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt />
                        <span>Registrado: {formatDate(customer.fecha_registro)}</span>
                      </div>
                    </div>

                    <div className="customer-stats">
                      <div className="stat-item">
                        <FaShoppingCart />
                        <div>
                          <span className="stat-value">{customer.total_pedidos || 0}</span>
                          <span className="stat-label">Pedidos</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaDollarSign />
                        <div>
                          <span className="stat-value">{formatPrice(customer.total_gastado || 0)}</span>
                          <span className="stat-label">Total gastado</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaStar />
                        <div>
                          <span className="stat-value">{formatPrice(stats.avgOrderValue)}</span>
                          <span className="stat-label">Promedio por pedido</span>
                        </div>
                      </div>
                    </div>

                    <div className="customer-actions">
                      <button
                        className="btn-primary"
                        onClick={() => viewCustomerDetails(customer)}
                      >
                        <FaEye /> Ver Detalles
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredAndSortedCustomers.length === 0 && (
              <div className="empty-state">
                <FaUser />
                <h3>No hay clientes</h3>
                <p>
                  {searchTerm || statusFilter
                    ? 'No se encontraron clientes con los filtros aplicados'
                    : 'Aún no hay clientes registrados en tu tienda'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalles del cliente */}
        <AnimatePresence>
          {showModal && selectedCustomer && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="modal-content customer-details-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Cliente: {selectedCustomer.nombre}</h2>
                  <button className="btn-icon" onClick={closeModal}>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="customer-profile">
                    <div className="profile-avatar">
                      <FaUser />
                    </div>
                    <div className="profile-info">
                      <h3>{selectedCustomer.nombre}</h3>
                      <p>{selectedCustomer.email}</p>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(getCustomerStats(selectedCustomer).status) }}
                      >
                        {getStatusLabel(getCustomerStats(selectedCustomer).status)}
                      </span>
                    </div>
                  </div>

                  <div className="customer-contact">
                    <h3>Información de Contacto</h3>
                    <div className="contact-grid">
                      <div className="contact-item">
                        <FaPhone />
                        <div>
                          <label>Teléfono</label>
                          <span>{selectedCustomer.telefono || 'No especificado'}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <FaMapMarkerAlt />
                        <div>
                          <label>Dirección</label>
                          <span>{selectedCustomer.direccion || 'No especificada'}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <FaCalendarAlt />
                        <div>
                          <label>Fecha de registro</label>
                          <span>{formatDate(selectedCustomer.fecha_registro)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="customer-analytics">
                    <h3>Análisis del Cliente</h3>
                    <div className="analytics-grid">
                      <div className="analytics-item">
                        <div className="analytics-icon">
                          <FaShoppingCart />
                        </div>
                        <div className="analytics-content">
                          <span className="analytics-value">{selectedCustomer.total_pedidos || 0}</span>
                          <span className="analytics-label">Total de pedidos</span>
                        </div>
                      </div>
                      <div className="analytics-item">
                        <div className="analytics-icon">
                          <FaDollarSign />
                        </div>
                        <div className="analytics-content">
                          <span className="analytics-value">{formatPrice(selectedCustomer.total_gastado || 0)}</span>
                          <span className="analytics-label">Total gastado</span>
                        </div>
                      </div>
                      <div className="analytics-item">
                        <div className="analytics-icon">
                          <FaStar />
                        </div>
                        <div className="analytics-content">
                          <span className="analytics-value">
                            {formatPrice(getCustomerStats(selectedCustomer).avgOrderValue)}
                          </span>
                          <span className="analytics-label">Promedio por pedido</span>
                        </div>
                      </div>
                      <div className="analytics-item">
                        <div className="analytics-icon">
                          <FaChartLine />
                        </div>
                        <div className="analytics-content">
                          <span className="analytics-value">
                            {getCustomerStats(selectedCustomer).daysSinceRegistration}
                          </span>
                          <span className="analytics-label">Días como cliente</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.ultimo_pedido && (
                    <div className="last-order">
                      <h3>Último Pedido</h3>
                      <div className="last-order-info">
                        <p><strong>Fecha:</strong> {formatDate(selectedCustomer.ultimo_pedido)}</p>
                        <p><strong>Estado:</strong> {selectedCustomer.estado_ultimo_pedido || 'N/A'}</p>
                        <p><strong>Total:</strong> {formatPrice(selectedCustomer.total_ultimo_pedido || 0)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
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

export default AdminCustomersPage;
