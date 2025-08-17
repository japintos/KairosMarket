/**
 * Servidor principal para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Debug: Verificar variables de entorno
console.log('🔧 Variables de entorno cargadas:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   PORT:', process.env.PORT);

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contact');

// Importar middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración para rate-limit (soluciona el error de X-Forwarded-For)
app.set('trust proxy', 1);

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos.'
  }
});

// Middleware de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://sdk.mercadopago.com"],
      connectSrc: ["'self'", "https://api.mercadopago.com"]
    }
  }
}));

app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsing de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Kairos Natural Market API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    developer: 'Julio Alberto Pintos - WebXpert'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Kairos Natural Market API',
    version: '1.0.0',
    developer: 'Julio Alberto Pintos - WebXpert',
    year: '2025',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      customers: '/api/customers',
      admin: '/api/admin',
      payments: '/api/payments',
      contact: '/api/contact'
    }
  });
});

// Middleware para manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableEndpoints: [
      '/api/auth',
      '/api/products',
      '/api/categories',
      '/api/orders',
      '/api/customers',
      '/api/admin',
      '/api/payments',
      '/api/contact'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🌿 Kairos Natural Market API iniciada');
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👨‍💻 Desarrollador: Julio Alberto Pintos - WebXpert`);
  console.log(`📅 Año: 2025`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📋 Documentación: http://localhost:${PORT}/api/health`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

module.exports = app;
