import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaPrint, FaTruck, FaCheckCircle } from 'react-icons/fa';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();

  // Datos de ejemplo
  const order = {
    id: orderId || 'ORD-001',
    date: '2024-01-15',
    status: 'completed',
    total: 1250.00,
    subtotal: 1150.00,
    shipping: 100.00,
    items: [
      {
        id: 1,
        name: 'Aceite de Coco Orgánico',
        price: 450.00,
        quantity: 2,
        total: 900.00
      },
      {
        id: 2,
        name: 'Miel Pura de Abeja',
        price: 250.00,
        quantity: 1,
        total: 250.00
      }
    ],
    shippingAddress: {
      name: 'Juan Pérez',
      address: 'Av. San Martín 1234',
      city: 'Buenos Aires',
      postalCode: '1001',
      phone: '+54 11 1234-5678'
    },
    paymentMethod: 'MercadoPago',
    trackingNumber: 'TRK-123456789'
  };

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

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <div className="header-content">
          <Link to="/orders" className="back-link">
            <FaArrowLeft />
            Volver al historial
          </Link>
          <h1>Pedido #{order.id}</h1>
          <p>Detalles del pedido realizado el {new Date(order.date).toLocaleDateString()}</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-secondary">
            <FaDownload />
            Descargar
          </button>
          <button className="btn-secondary">
            <FaPrint />
            Imprimir
          </button>
        </div>
      </div>

      <div className="order-content">
        <div className="order-main">
          <div className="order-status-card">
            <div className={`status-badge ${getStatusColor(order.status)}`}>
              <FaCheckCircle />
              {getStatusText(order.status)}
            </div>
            {order.trackingNumber && (
              <div className="tracking-info">
                <FaTruck />
                <span>Número de seguimiento: {order.trackingNumber}</span>
              </div>
            )}
          </div>

          <div className="order-items-section">
            <h2>Productos</h2>
            <div className="items-list">
              {order.items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="item-quantity">
                    Cantidad: {item.quantity}
                  </div>
                  <div className="item-total">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-sidebar">
          <div className="order-summary">
            <h3>Resumen del pedido</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envío:</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Dirección de envío</h3>
            <div className="address-details">
              <p><strong>{order.shippingAddress.name}</strong></p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="payment-info">
            <h3>Método de pago</h3>
            <p>{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
