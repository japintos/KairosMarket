import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaCashRegister, 
  FaDollarSign, 
  FaChartLine, 
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaPrint,
  FaPlus,
  FaMinus,
  FaEye,
  FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminCashPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminCashPage = () => {
  const [cashData, setCashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');

  const periods = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' }
  ];

  // Cargar datos de caja
  useEffect(() => {
    fetchCashData();
  }, [selectedPeriod]);

  const fetchCashData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cash?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCashData(data);
      } else {
        toast.error('Error al cargar los datos de caja');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Registrar transacción
  const registerTransaction = async (e) => {
    e.preventDefault();
    
    if (!transactionAmount || !transactionDescription) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('/api/admin/cash/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          tipo: transactionType,
          monto: parseFloat(transactionAmount),
          descripcion: transactionDescription,
          fecha: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('Transacción registrada correctamente');
        setShowTransactionModal(false);
        setTransactionAmount('');
        setTransactionDescription('');
        fetchCashData();
      } else {
        toast.error('Error al registrar la transacción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Configuración de gráficos
  const getSalesChartData = () => {
    if (!cashData?.ventas_por_dia) return { labels: [], datasets: [] };
    
    return {
      labels: cashData.ventas_por_dia.map(item => item.fecha),
      datasets: [
        {
          label: 'Ventas',
          data: cashData.ventas_por_dia.map(item => item.total),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getPaymentMethodsData = () => {
    if (!cashData?.metodos_pago) return { labels: [], datasets: [] };
    
    return {
      labels: cashData.metodos_pago.map(item => item.metodo),
      datasets: [
        {
          data: cashData.metodos_pago.map(item => item.total),
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#ff9800',
            '#9c27b0',
            '#f44336'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  const getCashFlowData = () => {
    if (!cashData?.flujo_caja) return { labels: [], datasets: [] };
    
    return {
      labels: cashData.flujo_caja.map(item => item.fecha),
      datasets: [
        {
          label: 'Ingresos',
          data: cashData.flujo_caja.map(item => item.ingresos),
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
          borderWidth: 1
        },
        {
          label: 'Egresos',
          data: cashData.flujo_caja.map(item => item.egresos),
          backgroundColor: '#f44336',
          borderColor: '#f44336',
          borderWidth: 1
        }
      ]
    };
  };

  if (loading && !cashData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Control de Caja - Panel Administrativo</title>
      </Helmet>

      <div className="admin-cash-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Control de Caja</h1>
            <p>Gestiona y monitorea el flujo de efectivo de tu tienda</p>
          </div>
          <div className="header-actions">
            <div className="period-selector">
              <FaCalendarAlt />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            <motion.button
              className="btn-primary"
              onClick={() => setShowTransactionModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus /> Nueva Transacción
            </motion.button>
          </div>
        </div>

        <div className="page-content">
          {/* KPIs */}
          <div className="kpis-section">
            <div className="kpi-card">
              <div className="kpi-icon income">
                <FaDollarSign />
              </div>
              <div className="kpi-content">
                <h3>Ingresos Totales</h3>
                <span className="kpi-value">{formatPrice(cashData?.ingresos_totales || 0)}</span>
                <span className="kpi-change positive">
                  +{cashData?.porcentaje_ingresos || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon expense">
                <FaMinus />
              </div>
              <div className="kpi-content">
                <h3>Egresos Totales</h3>
                <span className="kpi-value">{formatPrice(cashData?.egresos_totales || 0)}</span>
                <span className="kpi-change negative">
                  +{cashData?.porcentaje_egresos || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon balance">
                <FaCashRegister />
              </div>
              <div className="kpi-content">
                <h3>Balance Neto</h3>
                <span className="kpi-value">{formatPrice(cashData?.balance_neto || 0)}</span>
                <span className={`kpi-change ${(cashData?.balance_neto || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(cashData?.balance_neto || 0) >= 0 ? '+' : ''}{cashData?.porcentaje_balance || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon transactions">
                <FaChartLine />
              </div>
              <div className="kpi-content">
                <h3>Transacciones</h3>
                <span className="kpi-value">{cashData?.total_transacciones || 0}</span>
                <span className="kpi-change positive">
                  +{cashData?.porcentaje_transacciones || 0}% vs período anterior
                </span>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Ventas por Día</h3>
                <div className="chart-actions">
                  <button className="btn-icon" title="Descargar">
                    <FaDownload />
                  </button>
                  <button className="btn-icon" title="Imprimir">
                    <FaPrint />
                  </button>
                </div>
              </div>
              <div className="chart-content">
                <Line 
                  data={getSalesChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatPrice(value);
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Métodos de Pago</h3>
              </div>
              <div className="chart-content">
                <Doughnut 
                  data={getPaymentMethodsData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="chart-container full-width">
              <div className="chart-header">
                <h3>Flujo de Caja</h3>
              </div>
              <div className="chart-content">
                <Bar 
                  data={getCashFlowData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatPrice(value);
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transacciones Recientes */}
          <div className="transactions-section">
            <div className="section-header">
              <h3>Transacciones Recientes</h3>
              <button className="btn-secondary">
                <FaEye /> Ver Todas
              </button>
            </div>
            
            <div className="transactions-table">
              <div className="table-header">
                <div className="table-cell">Fecha</div>
                <div className="table-cell">Descripción</div>
                <div className="table-cell">Tipo</div>
                <div className="table-cell">Monto</div>
              </div>

              <div className="table-body">
                {cashData?.transacciones_recientes?.map((transaction) => (
                  <div key={transaction.id} className="table-row">
                    <div className="table-cell">
                      {formatDate(transaction.fecha)}
                    </div>
                    <div className="table-cell">
                      {transaction.descripcion}
                    </div>
                    <div className="table-cell">
                      <span className={`transaction-type ${transaction.tipo}`}>
                        {transaction.tipo === 'income' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className={`transaction-amount ${transaction.tipo}`}>
                        {transaction.tipo === 'income' ? '+' : '-'}{formatPrice(transaction.monto)}
                      </span>
                    </div>
                  </div>
                ))}

                {(!cashData?.transacciones_recientes || cashData.transacciones_recientes.length === 0) && (
                  <div className="empty-state">
                    <FaCashRegister />
                    <h3>No hay transacciones</h3>
                    <p>Registra tu primera transacción para comenzar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Nueva Transacción */}
        <AnimatePresence>
          {showTransactionModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransactionModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Nueva Transacción</h2>
                  <button 
                    className="btn-icon" 
                    onClick={() => setShowTransactionModal(false)}
                    aria-label="Cerrar modal"
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <form onSubmit={registerTransaction} className="modal-form">
                  <div className="form-group">
                    <label>Tipo de Transacción *</label>
                    <div className="transaction-type-buttons">
                      <button
                        type="button"
                        className={`type-btn ${transactionType === 'income' ? 'active' : ''}`}
                        onClick={() => setTransactionType('income')}
                      >
                        <FaPlus /> Ingreso
                      </button>
                      <button
                        type="button"
                        className={`type-btn ${transactionType === 'expense' ? 'active' : ''}`}
                        onClick={() => setTransactionType('expense')}
                      >
                        <FaMinus /> Egreso
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Monto *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción *</label>
                    <textarea
                      value={transactionDescription}
                      onChange={(e) => setTransactionDescription(e.target.value)}
                      placeholder="Describe la transacción..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowTransactionModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      <FaPlus /> Registrar Transacción
                    </button>
                  </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminCashPage;
