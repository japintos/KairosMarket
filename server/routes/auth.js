/**
 * Rutas de autenticación para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { generateToken, authMiddleware, adminMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateEmail } = require('../middleware/errorHandler');

const router = express.Router();

// Esquemas de validación
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  })
});

const registerSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  }),
  rol: Joi.string().valid('admin', 'vendedor').default('vendedor').messages({
    'any.only': 'El rol debe ser admin o vendedor'
  })
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'La contraseña actual es requerida'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
    'any.required': 'La nueva contraseña es requerida'
  })
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { email, password } = value;

  console.log('🔍 DEBUG LOGIN - Datos recibidos:', { 
    email, 
    password: password ? '***' : 'NO PASSWORD',
    passwordLength: password ? password.length : 0,
    passwordChars: password ? password.split('').map(c => c.charCodeAt(0)) : []
  });

  // Buscar usuario por email
  const [user] = await executeQuery(
    'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
    [email]
  );

  console.log('🔍 DEBUG LOGIN - Usuario encontrado:', user ? {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    passwordLength: user.password ? user.password.length : 0
  } : 'NO ENCONTRADO');

  if (!user) {
    console.log('❌ DEBUG LOGIN - Usuario no encontrado');
    throw createError('Credenciales inválidas', 401);
  }

  if (!user.activo) {
    console.log('❌ DEBUG LOGIN - Usuario inactivo');
    throw createError('Usuario inactivo', 401);
  }

  console.log('✅ DEBUG LOGIN - Usuario activo, verificando contraseña...');
  console.log('🔐 DEBUG LOGIN - Hash almacenado en DB:', user.password);

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('🔐 DEBUG LOGIN - Resultado de verificación:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('❌ DEBUG LOGIN - Contraseña incorrecta');
    throw createError('Credenciales inválidas', 401);
  }

  // Actualizar último login
  await executeQuery(
    'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
    [user.id]
  );

  // Generar token JWT
  const token = generateToken(user.id, user.email, user.rol);

  // Respuesta exitosa
  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  });
}));

// POST /api/auth/register - Registrar nuevo usuario (solo admin)
router.post('/register', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { nombre, email, password, rol } = value;

  // Verificar si el email ya existe
  const [existingUser] = await executeQuery(
    'SELECT id FROM usuarios WHERE email = ?',
    [email]
  );

  if (existingUser) {
    throw createError('El email ya está registrado', 400);
  }

  // Encriptar contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insertar nuevo usuario
  const [result] = await executeQuery(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hashedPassword, rol]
  );

  // Obtener usuario creado
  const [newUser] = await executeQuery(
    'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: newUser
    }
  });
}));

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const [user] = await executeQuery(
    'SELECT id, nombre, email, rol, ultimo_login, created_at FROM usuarios WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const { nombre, email } = req.body;

  // Validar email si se proporciona
  if (email && email !== req.user.email) {
    validateEmail(email);
    
    // Verificar si el email ya existe
    const [existingUser] = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUser) {
      throw createError('El email ya está en uso', 400);
    }
  }

  // Actualizar perfil
  const updateFields = [];
  const updateValues = [];

  if (nombre) {
    updateFields.push('nombre = ?');
    updateValues.push(nombre);
  }

  if (email) {
    updateFields.push('email = ?');
    updateValues.push(email);
  }

  if (updateFields.length === 0) {
    throw createError('No se proporcionaron datos para actualizar', 400);
  }

  updateValues.push(req.user.id);

  await executeQuery(
    `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Obtener usuario actualizado
  const [updatedUser] = await executeQuery(
    'SELECT id, nombre, email, rol, ultimo_login, created_at FROM usuarios WHERE id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    data: {
      user: updatedUser
    }
  });
}));

// PUT /api/auth/password - Cambiar contraseña
router.put('/password', authMiddleware, asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = updatePasswordSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { currentPassword, newPassword } = value;

  // Obtener contraseña actual
  const [user] = await executeQuery(
    'SELECT password FROM usuarios WHERE id = ?',
    [req.user.id]
  );

  // Verificar contraseña actual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('La contraseña actual es incorrecta', 400);
  }

  // Encriptar nueva contraseña
  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Actualizar contraseña
  await executeQuery(
    'UPDATE usuarios SET password = ? WHERE id = ?',
    [hashedNewPassword, req.user.id]
  );

  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente'
  });
}));

// GET /api/auth/users - Listar usuarios (solo admin)
router.get('/users', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', rol = '' } = req.query;
  
  const offset = (page - 1) * limit;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (search) {
    whereClause += ' AND (nombre LIKE ? OR email LIKE ?)';
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (rol) {
    whereClause += ' AND rol = ?';
    queryParams.push(rol);
  }

  // Obtener total de usuarios
  const [countResult] = await executeQuery(
    `SELECT COUNT(*) as total FROM usuarios ${whereClause}`,
    queryParams
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener usuarios
  const users = await executeQuery(
    `SELECT id, nombre, email, rol, activo, ultimo_login, created_at 
     FROM usuarios ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    }
  });
}));

// PUT /api/auth/users/:id/status - Cambiar estado de usuario (solo admin)
router.put('/users/:id/status', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    throw createError('El campo activo debe ser un booleano', 400);
  }

  // Verificar que el usuario existe
  const [user] = await executeQuery(
    'SELECT id, nombre FROM usuarios WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  // No permitir desactivar el propio usuario
  if (userId === req.user.id) {
    throw createError('No puede desactivar su propia cuenta', 400);
  }

  // Actualizar estado
  await executeQuery(
    'UPDATE usuarios SET activo = ? WHERE id = ?',
    [activo, userId]
  );

  res.json({
    success: true,
    message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
    data: {
      userId,
      activo
    }
  });
}));

// DELETE /api/auth/users/:id - Eliminar usuario (solo admin)
router.delete('/users/:id', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);

  // Verificar que el usuario existe
  const [user] = await executeQuery(
    'SELECT id, nombre FROM usuarios WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  // No permitir eliminar el propio usuario
  if (userId === req.user.id) {
    throw createError('No puede eliminar su propia cuenta', 400);
  }

  // Eliminar usuario
  await executeQuery('DELETE FROM usuarios WHERE id = ?', [userId]);

  res.json({
    success: true,
    message: 'Usuario eliminado exitosamente',
    data: {
      userId
    }
  });
}));

// POST /api/auth/logout - Cerrar sesión (opcional, para invalidar tokens)
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  // En una implementación más avanzada, aquí se podría invalidar el token
  // Por ahora, solo devolvemos una respuesta exitosa
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
}));

module.exports = router;
