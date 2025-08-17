/**
 * Middleware de autenticación JWT para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const jwt = require('jsonwebtoken');
const { executeQuery } = require('../database/config');

// Middleware para verificar token JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe proporcionar un token de autenticación válido'
      });
    }

    // Extraer token (remover "Bearer ")
    const token = authHeader.substring(7);

    // Verificar y decodificar token
    const jwtSecret = process.env.JWT_SECRET || 'kairos_natural_market_jwt_secret_2025_super_seguro';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verificar que el usuario existe y está activo
    const [user] = await executeQuery(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ? AND activo = 1', // ✅ CORREGIDO: TRUE -> 1 para MySQL
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe o está inactivo'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, inicie sesión nuevamente'
      });
    }

    console.error('❌ Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Middleware para verificar rol de administrador
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debe iniciar sesión para acceder a este recurso'
    });
  }

  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tiene permisos de administrador para acceder a este recurso'
    });
  }

  next();
};

// Middleware para verificar rol de vendedor o admin
const sellerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debe iniciar sesión para acceder a este recurso'
    });
  }

  if (req.user.rol !== 'admin' && req.user.rol !== 'vendedor') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tiene permisos para acceder a este recurso'
    });
  }

  next();
};

// Función para generar token JWT
const generateToken = (userId, email, rol) => {
  const jwtSecret = process.env.JWT_SECRET || 'kairos_natural_market_jwt_secret_2025_super_seguro';
  return jwt.sign(
    { 
      userId, 
      email, 
      rol,
      iat: Math.floor(Date.now() / 1000)
    },
    jwtSecret,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

// Función para verificar token sin middleware (para uso interno)
const verifyToken = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'kairos_natural_market_jwt_secret_2025_super_seguro';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  sellerMiddleware,
  generateToken,
  verifyToken
};
