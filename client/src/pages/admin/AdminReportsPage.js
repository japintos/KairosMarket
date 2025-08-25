import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaDownload, 
  FaPrint,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaTimesCircle,
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminReportsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminReportsPage = () => {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [showReportModal, setShowReportModal] = useState(false);

  const periods = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const reportTypes = [
    { value: 'sales', label: 'Ventas', icon: FaChartLine },
    { value: 'products', label: 'Productos', icon: FaBox },
    { value: 'customers', label: 'Clientes', icon: FaUsers },
    { value: 'revenue', label: 'Ingresos', icon: FaDollarSign },
    { value: 'performance', label: 'Rendimiento', icon: FaStar }
  ];

  // Cargar datos de reportes
  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, selectedReport]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}&type=${selectedReport}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        toast.error('Error al cargar los reportes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Generar reporte
  const generateReport = async (format = 'pdf') => {
    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: selectedReport,
          period: selectedPeriod,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${selectedReport}_${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Reporte descargado correctamente');
      } else {
        toast.error('Error al generar el reporte');
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Configuración de gráficos
  const getSalesChartData = () => {
    if (!reportsData?.ventas_por_periodo) return { labels: [], datasets: [] };
    
    return {
      labels: reportsData.ventas_por_periodo.map(item => item.fecha),
      datasets: [
        {
          label: 'Ventas',
          data: reportsData.ventas_por_periodo.map(item => item.total),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getProductPerformanceData = () => {
    if (!reportsData?.productos_mas_vendidos) return { labels: [], datasets: [] };
    
    return {
      labels: reportsData.productos_mas_vendidos.map(item => item.nombre),
      datasets: [
        {
          label: 'Unidades Vendidas',
          data: reportsData.productos_mas_vendidos.map(item => item.cantidad),
          backgroundColor: '#2196f3',
          borderColor: '#2196f3',
          borderWidth: 1
        }
      ]
    };
  };

  const getCustomerSegmentationData = () => {
    if (!reportsData?.segmentacion_clientes) return { labels: [], datasets: [] };
    
    return {
      labels: reportsData.segmentacion_clientes.map(item => item.segmento),
      datasets: [
        {
          data: reportsData.segmentacion_clientes.map(item => item.porcentaje),
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

  const getRevenueBreakdownData = () => {
    if (!reportsData?.desglose_ingresos) return { labels: [], datasets: [] };
    
    return {
      labels: reportsData.desglose_ingresos.map(item => item.categoria),
      datasets: [
        {
          label: 'Ingresos',
          data: reportsData.desglose_ingresos.map(item => item.total),
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
          borderWidth: 1
        }
      ]
    };
  };

  const getPerformanceMetricsData = () => {
    if (!reportsData?.metricas_rendimiento) return { labels: [], datasets: [] };
    
    const metrics = reportsData.metricas_rendimiento;
    return {
      labels: ['Ventas', 'Clientes', 'Productos', 'Satisfacción', 'Retención'],
      datasets: [
        {
          label: 'Rendimiento Actual',
          data: [
            metrics.ventas_score || 0,
            metrics.clientes_score || 0,
            metrics.productos_score || 0,
            metrics.satisfaccion_score || 0,
            metrics.retencion_score || 0
          ],
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4caf50',
          borderWidth: 2,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4caf50'
        }
      ]
    };
  };

  if (loading && !reportsData) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Reportes y Estadísticas - Panel Administrativo</title>
      </Helmet>

      <div className="admin-reports-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Reportes y Estadísticas</h1>
            <p>Analiza el rendimiento de tu tienda con reportes detallados</p>
          </div>
          <div className="header-actions">
            <div className="report-controls">
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
                onClick={() => generateReport('pdf')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload /> Descargar Reporte
              </motion.button>
            </div>
          </div>
        </div>

        <div className="page-content">
          {/* Selector de tipo de reporte */}
          <div className="report-type-selector">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <motion.button
                  key={report.value}
                  className={`report-type-btn ${selectedReport === report.value ? 'active' : ''}`}
                  onClick={() => setSelectedReport(report.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent />
                  <span>{report.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* KPIs del reporte */}
          <div className="report-kpis">
            <div className="kpi-card">
              <div className="kpi-icon">
                <FaDollarSign />
              </div>
              <div className="kpi-content">
                <h3>Ingresos Totales</h3>
                <span className="kpi-value">{formatPrice(reportsData?.ingresos_totales || 0)}</span>
                <span className="kpi-change positive">
                  +{reportsData?.crecimiento_ingresos || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <FaShoppingCart />
              </div>
              <div className="kpi-content">
                <h3>Pedidos</h3>
                <span className="kpi-value">{reportsData?.total_pedidos || 0}</span>
                <span className="kpi-change positive">
                  +{reportsData?.crecimiento_pedidos || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <FaUsers />
              </div>
              <div className="kpi-content">
                <h3>Clientes Nuevos</h3>
                <span className="kpi-value">{reportsData?.clientes_nuevos || 0}</span>
                <span className="kpi-change positive">
                  +{reportsData?.crecimiento_clientes || 0}% vs período anterior
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <FaStar />
              </div>
              <div className="kpi-content">
                <h3>Satisfacción</h3>
                <span className="kpi-value">{reportsData?.satisfaccion_promedio || 0}/5</span>
                <span className="kpi-change positive">
                  +{reportsData?.crecimiento_satisfaccion || 0}% vs período anterior
                </span>
              </div>
            </div>
          </div>

          {/* Gráficos específicos según el tipo de reporte */}
          <div className="report-charts">
            {selectedReport === 'sales' && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Evolución de Ventas</h3>
                  <div className="chart-actions">
                    <button className="btn-icon" onClick={() => generateReport('pdf')}>
                      <FaDownload />
                    </button>
                    <button className="btn-icon" onClick={() => generateReport('excel')}>
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
            )}

            {selectedReport === 'products' && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Productos Más Vendidos</h3>
                </div>
                <div className="chart-content">
                  <Bar 
                    data={getProductPerformanceData()}
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
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {selectedReport === 'customers' && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Segmentación de Clientes</h3>
                </div>
                <div className="chart-content">
                  <Doughnut 
                    data={getCustomerSegmentationData()}
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
            )}

            {selectedReport === 'revenue' && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Desglose de Ingresos por Categoría</h3>
                </div>
                <div className="chart-content">
                  <Bar 
                    data={getRevenueBreakdownData()}
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
            )}

            {selectedReport === 'performance' && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Métricas de Rendimiento</h3>
                </div>
                <div className="chart-content">
                  <Radar 
                    data={getPerformanceMetricsData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            stepSize: 20
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tabla de datos detallados */}
          <div className="report-details">
            <div className="section-header">
              <h3>Datos Detallados</h3>
              <button 
                className="btn-secondary"
                onClick={() => setShowReportModal(true)}
              >
                <FaEye /> Ver Detalles Completos
              </button>
            </div>
            
            <div className="details-table">
              <div className="table-header">
                <div className="table-cell">Métrica</div>
                <div className="table-cell">Valor Actual</div>
                <div className="table-cell">Valor Anterior</div>
                <div className="table-cell">Crecimiento</div>
              </div>

              <div className="table-body">
                {reportsData?.metricas_detalladas?.map((metrica) => (
                  <div key={metrica.nombre} className="table-row">
                    <div className="table-cell">
                      <strong>{metrica.nombre}</strong>
                    </div>
                    <div className="table-cell">
                      {metrica.tipo === 'currency' ? formatPrice(metrica.valor_actual) : metrica.valor_actual}
                    </div>
                    <div className="table-cell">
                      {metrica.tipo === 'currency' ? formatPrice(metrica.valor_anterior) : metrica.valor_anterior}
                    </div>
                    <div className="table-cell">
                      <span className={`growth ${metrica.crecimiento >= 0 ? 'positive' : 'negative'}`}>
                        {metrica.crecimiento >= 0 ? '+' : ''}{metrica.crecimiento}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de detalles completos */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
            >
              <motion.div
                className="modal-content report-details-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Reporte Detallado - {reportTypes.find(r => r.value === selectedReport)?.label}</h2>
                  <button className="btn-icon" onClick={() => setShowReportModal(false)}>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="report-summary">
                    <h3>Resumen Ejecutivo</h3>
                    <p>{reportsData?.resumen_ejecutivo || 'No hay resumen disponible para este período.'}</p>
                  </div>

                  <div className="report-insights">
                    <h3>Insights Principales</h3>
                    <ul>
                      {reportsData?.insights?.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      )) || <li>No hay insights disponibles para este período.</li>}
                    </ul>
                  </div>

                  <div className="report-recommendations">
                    <h3>Recomendaciones</h3>
                    <ul>
                      {reportsData?.recomendaciones?.map((recomendacion, index) => (
                        <li key={index}>{recomendacion}</li>
                      )) || <li>No hay recomendaciones disponibles para este período.</li>}
                    </ul>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => generateReport('pdf')}
                  >
                    <FaDownload /> Descargar PDF
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => generateReport('excel')}
                  >
                    <FaDownload /> Descargar Excel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowReportModal(false)}
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

export default AdminReportsPage;
