/**
 * Middleware de manejo de errores para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

// Función para crear errores personalizados
const createError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

// Función para validar IDs
const validateId = (id) => {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw createError('ID inválido', 400);
  }
  return numId;
};

// Función para validar emails
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError('Email inválido', 400);
  }
  return email;
};

// Función para validar precios
const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    throw createError('Precio inválido', 400);
  }
  return numPrice;
};

// Función para validar cantidades
const validateQuantity = (quantity) => {
  const numQuantity = parseInt(quantity);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    throw createError('Cantidad inválida', 400);
  }
  return numQuantity;
};

// Wrapper para manejar funciones asíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware principal de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(err);
  }

  // Determinar el código de estado
  const statusCode = err.statusCode || 500;
  
  // Determinar el mensaje de error
  let message = err.message || 'Error interno del servidor';
  
  // En producción, no mostrar detalles de errores internos
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
  }

  // Construir respuesta de error
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Agregar detalles si están disponibles y no estamos en producción
  if (err.details && process.env.NODE_ENV !== 'production') {
    errorResponse.error.details = err.details;
  }

  // Agregar stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

// Middleware para manejar errores de validación de Joi
const joiErrorHandler = (err, req, res, next) => {
  if (err.isJoi) {
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Datos de entrada inválidos',
        statusCode: 400,
        details,
        timestamp: new Date().toISOString()
      }
    });
  }
  next(err);
};

// Middleware para manejar errores de MySQL
const mysqlErrorHandler = (err, req, res, next) => {
  if (err.code) {
    let message = 'Error de base de datos';
    let statusCode = 500;

    switch (err.code) {
      case 'ER_DUP_ENTRY':
        message = 'El registro ya existe';
        statusCode = 409;
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        message = 'Referencia inválida';
        statusCode = 400;
        break;
      case 'ER_ROW_IS_REFERENCED_2':
        message = 'No se puede eliminar el registro porque está siendo utilizado';
        statusCode = 400;
        break;
      case 'ER_DATA_TOO_LONG':
        message = 'Datos demasiado largos';
        statusCode = 400;
        break;
      case 'ER_BAD_FIELD_ERROR':
        message = 'Campo inválido';
        statusCode = 400;
        break;
      case 'ER_NO_SUCH_TABLE':
        message = 'Tabla no encontrada';
        statusCode = 500;
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        message = 'Acceso denegado a la base de datos';
        statusCode = 500;
        break;
      case 'ECONNREFUSED':
        message = 'No se pudo conectar a la base de datos';
        statusCode = 500;
        break;
      default:
        message = 'Error de base de datos';
        statusCode = 500;
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        code: err.code,
        timestamp: new Date().toISOString()
      }
    });
  }
  next(err);
};

// Middleware para manejar errores de archivos
const fileErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'El archivo es demasiado grande',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Archivo inesperado',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Demasiados archivos',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    });
  }

  next(err);
};

// Middleware para manejar errores de JWT
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expirado',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
    });
  }

  next(err);
};

// Middleware para manejar errores de rate limiting
const rateLimitErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes. Por favor, intente nuevamente más tarde.',
        statusCode: 429,
        timestamp: new Date().toISOString()
      }
    });
  }
  next(err);
};

// Función para loggear errores
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    statusCode: err.statusCode || 500
  };

  console.error('🚨 Error Log:', JSON.stringify(errorLog, null, 2));
};

// Middleware para capturar errores no manejados
const unhandledErrorHandler = (err, req, res, next) => {
  logError(err, req);
  
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: {
        message: process.env.NODE_ENV === 'production' 
          ? 'Error interno del servidor' 
          : err.message,
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = {
  createError,
  validateId,
  validateEmail,
  validatePrice,
  validateQuantity,
  asyncHandler,
  errorHandler,
  joiErrorHandler,
  mysqlErrorHandler,
  fileErrorHandler,
  jwtErrorHandler,
  rateLimitErrorHandler,
  unhandledErrorHandler,
  logError
};
