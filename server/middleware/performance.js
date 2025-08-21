/**
 * Middleware de Performance para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const path = req.path;
    const statusCode = res.statusCode;
    
    // Log de performance
    console.log(`⏱️ ${method} ${path} - ${statusCode} - ${duration}ms`);
    
    // Alertar consultas lentas
    if (duration > 1000) {
      console.warn(`⚠️ CONSULTA LENTA DETECTADA: ${method} ${path} - ${duration}ms`);
    }
    
    // Alertar consultas muy lentas
    if (duration > 3000) {
      console.error(`🚨 CONSULTA MUY LENTA: ${method} ${path} - ${duration}ms`);
    }
    
    // Log de performance para análisis
    if (duration > 500) {
      console.log(`📊 Performance: ${method} ${path} - ${duration}ms - ${new Date().toISOString()}`);
    }
  });
  
  next();
};

// Middleware específico para rutas de productos
const productPerformanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const path = req.path;
    
    // Log específico para productos
    console.log(`🛍️ Productos: ${method} ${path} - ${duration}ms`);
    
    // Alertar si la consulta de productos es lenta
    if (duration > 800) {
      console.warn(`⚠️ Consulta de productos lenta: ${method} ${path} - ${duration}ms`);
    }
  });
  
  next();
};

// Middleware para monitorear el pool de conexiones
const poolMonitoringMiddleware = (req, res, next) => {
  const pool = require('../database/config').pool;
  
  // Log del estado del pool cada 100 requests
  if (Math.random() < 0.01) { // 1% de probabilidad
    console.log(`🔗 Pool Status: ${pool.pool.config.connectionLimit} total, ${pool.pool._allConnections.length} activas`);
  }
  
  next();
};

module.exports = {
  performanceMiddleware,
  productPerformanceMiddleware,
  poolMonitoringMiddleware
};
