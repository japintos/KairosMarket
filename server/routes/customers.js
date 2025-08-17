/**
 * Rutas de clientes para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId, validateEmail, validatePhone } = require('../middleware/errorHandler');

const router = express.Router();

// Esquemas de validación
const customerSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  apellido: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 100 caracteres',
    'any.required': 'El apellido es requerido'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  telefono: Joi.string().max(20).required().messages({
    'string.max': 'El teléfono no puede exceder 20 caracteres',
    'any.required': 'El teléfono es requerido'
  }),
  direccion: Joi.string().max(500).optional().messages({
    'string.max': 'La dirección no puede exceder 500 caracteres'
  }),
  ciudad: Joi.string().max(100).optional().messages({
    'string.max': 'La ciudad no puede exceder 100 caracteres'
  }),
  provincia: Joi.string().max(100).optional().messages({
    'string.max': 'La provincia no puede exceder 100 caracteres'
  }),
  codigo_postal: Joi.string().max(10).optional().messages({
    'string.max': 'El código postal no puede exceder 10 caracteres'
  }),
  fecha_nacimiento: Joi.date().max('now').optional().messages({
    'date.max': 'La fecha de nacimiento no puede ser futura'
  })
});

const customerUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres'
  }),
  apellido: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 100 caracteres'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'El email debe tener un formato válido'
  }),
  telefono: Joi.string().max(20).optional().messages({
    'string.max': 'El teléfono no puede exceder 20 caracteres'
  }),
  direccion: Joi.string().max(500).optional().messages({
    'string.max': 'La dirección no puede exceder 500 caracteres'
  }),
  ciudad: Joi.string().max(100).optional().messages({
    'string.max': 'La ciudad no puede exceder 100 caracteres'
  }),
  provincia: Joi.string().max(100).optional().messages({
    'string.max': 'La provincia no puede exceder 100 caracteres'
  }),
  codigo_postal: Joi.string().max(10).optional().messages({
    'string.max': 'El código postal no puede exceder 10 caracteres'
  }),
  fecha_nacimiento: Joi.date().max('now').optional().messages({
    'date.max': 'La fecha de nacimiento no puede ser futura'
  })
});

// POST /api/customers - Registrar nuevo cliente
router.post('/', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = customerSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const {
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    ciudad,
    provincia,
    codigo_postal,
    fecha_nacimiento
  } = value;

  // Verificar si el email ya existe
  const [existingCustomer] = await executeQuery(
    'SELECT id FROM clientes WHERE email = ?',
    [email]
  );

  if (existingCustomer) {
    throw createError('Ya existe un cliente registrado con ese email', 400);
  }

  // Insertar cliente
  const [result] = await executeQuery(
    `INSERT INTO clientes (
      nombre, apellido, email, telefono, direccion, ciudad, provincia, 
      codigo_postal, fecha_nacimiento, registrado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [nombre, apellido, email, telefono, direccion, ciudad, provincia, codigo_postal, fecha_nacimiento]
  );

  // Obtener cliente creado
  const [newCustomer] = await executeQuery(
    'SELECT * FROM clientes WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Cliente registrado exitosamente',
    data: {
      customer: newCustomer
    }
  });
}));

// GET /api/customers - Listar clientes
router.get('/', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    registrado,
    activo = 'true'
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (search) {
    whereClause += ' AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR telefono LIKE ?)';
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (registrado === 'true') {
    whereClause += ' AND registrado = TRUE';
  } else if (registrado === 'false') {
    whereClause += ' AND registrado = FALSE';
  }

  if (activo === 'true') {
    whereClause += ' AND activo = TRUE';
  } else if (activo === 'false') {
    whereClause += ' AND activo = FALSE';
  }

  // Obtener total de clientes
  const [countResult] = await executeQuery(
    `SELECT COUNT(*) as total FROM clientes ${whereClause}`,
    queryParams
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener clientes
  const customers = await executeQuery(
    `SELECT c.*, 
            COUNT(p.id) as total_pedidos,
            SUM(p.total) as total_gastado,
            MAX(p.created_at) as ultimo_pedido
     FROM clientes c 
     LEFT JOIN pedidos p ON c.id = p.cliente_id 
     ${whereClause} 
     GROUP BY c.id 
     ORDER BY c.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      customers,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }
  });
}));

// GET /api/customers/:id - Obtener cliente por ID
router.get('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);

  const [customer] = await executeQuery(
    'SELECT * FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  res.json({
    success: true,
    data: {
      customer
    }
  });
}));

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);

  // Verificar que el cliente existe
  const [existingCustomer] = await executeQuery(
    'SELECT id, email FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!existingCustomer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Validar datos de entrada
  const { error, value } = customerUpdateSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  // Verificar si el email ya existe en otro cliente
  if (value.email && value.email !== existingCustomer.email) {
    const [duplicateCustomer] = await executeQuery(
      'SELECT id FROM clientes WHERE email = ? AND id != ?',
      [value.email, customerId]
    );

    if (duplicateCustomer) {
      throw createError('Ya existe otro cliente con ese email', 400);
    }
  }

  // Construir consulta de actualización
  const updateFields = [];
  const updateValues = [];

  Object.keys(value).forEach(key => {
    if (value[key] !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value[key]);
    }
  });

  if (updateFields.length === 0) {
    throw createError('No se proporcionaron datos para actualizar', 400);
  }

  updateValues.push(customerId);

  // Actualizar cliente
  await executeQuery(
    `UPDATE clientes SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Obtener cliente actualizado
  const [updatedCustomer] = await executeQuery(
    'SELECT * FROM clientes WHERE id = ?',
    [customerId]
  );

  res.json({
    success: true,
    message: 'Cliente actualizado exitosamente',
    data: {
      customer: updatedCustomer
    }
  });
}));

// DELETE /api/customers/:id - Eliminar cliente (soft delete)
router.delete('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);

  // Verificar que el cliente existe
  const [customer] = await executeQuery(
    'SELECT id, nombre, apellido FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Verificar si tiene pedidos asociados
  const [ordersCount] = await executeQuery(
    'SELECT COUNT(*) as total FROM pedidos WHERE cliente_id = ?',
    [customerId]
  );

  if (ordersCount.total > 0) {
    throw createError(`No se puede eliminar el cliente porque tiene ${ordersCount.total} pedidos asociados`, 400);
  }

  // Soft delete - marcar como inactivo
  await executeQuery(
    'UPDATE clientes SET activo = FALSE WHERE id = ?',
    [customerId]
  );

  res.json({
    success: true,
    message: 'Cliente eliminado exitosamente',
    data: {
      customerId,
      nombre: `${customer.nombre} ${customer.apellido}`
    }
  });
}));

// GET /api/customers/:id/orders - Obtener historial de pedidos del cliente
router.get('/:id/orders', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);
  const { page = 1, limit = 10 } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Verificar que el cliente existe
  const [customer] = await executeQuery(
    'SELECT id, nombre, apellido FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Obtener total de pedidos del cliente
  const [countResult] = await executeQuery(
    'SELECT COUNT(*) as total FROM pedidos WHERE cliente_id = ?',
    [customerId]
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener pedidos del cliente
  const orders = await executeQuery(
    `SELECT p.*, 
            COUNT(dp.id) as total_items,
            GROUP_CONCAT(dp.producto_nombre SEPARATOR ', ') as productos
     FROM pedidos p 
     LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id 
     WHERE p.cliente_id = ? 
     GROUP BY p.id 
     ORDER BY p.created_at DESC 
     LIMIT ? OFFSET ?`,
    [customerId, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      customer,
      orders,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }
  });
}));

// GET /api/customers/:id/favorites - Obtener productos favoritos del cliente
router.get('/:id/favorites', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);

  // Verificar que el cliente existe
  const [customer] = await executeQuery(
    'SELECT id, nombre, apellido FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Obtener productos favoritos
  const favorites = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre, f.created_at as fecha_favorito
     FROM favoritos f 
     JOIN productos p ON f.producto_id = p.id 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE f.cliente_id = ? AND p.activo = TRUE 
     ORDER BY f.created_at DESC`,
    [customerId]
  );

  // Procesar formato_disponible JSON
  favorites.forEach(product => {
    if (product.formato_disponible) {
      try {
        product.formato_disponible = JSON.parse(product.formato_disponible);
      } catch (e) {
        product.formato_disponible = [];
      }
    } else {
      product.formato_disponible = [];
    }
  });

  res.json({
    success: true,
    data: {
      customer,
      favorites,
      count: favorites.length
    }
  });
}));

// POST /api/customers/:id/favorites/:productId - Agregar producto a favoritos
router.post('/:id/favorites/:productId', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);
  const productId = validateId(req.params.productId);

  // Verificar que el cliente existe
  const [customer] = await executeQuery(
    'SELECT id, nombre, apellido FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Verificar que el producto existe
  const [product] = await executeQuery(
    'SELECT id, nombre FROM productos WHERE id = ? AND activo = TRUE',
    [productId]
  );

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  // Verificar si ya está en favoritos
  const [existingFavorite] = await executeQuery(
    'SELECT id FROM favoritos WHERE cliente_id = ? AND producto_id = ?',
    [customerId, productId]
  );

  if (existingFavorite) {
    throw createError('El producto ya está en favoritos', 400);
  }

  // Agregar a favoritos
  await executeQuery(
    'INSERT INTO favoritos (cliente_id, producto_id) VALUES (?, ?)',
    [customerId, productId]
  );

  res.json({
    success: true,
    message: 'Producto agregado a favoritos exitosamente',
    data: {
      customerId,
      productId,
      productName: product.nombre
    }
  });
}));

// DELETE /api/customers/:id/favorites/:productId - Remover producto de favoritos
router.delete('/:id/favorites/:productId', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.id);
  const productId = validateId(req.params.productId);

  // Verificar que el cliente existe
  const [customer] = await executeQuery(
    'SELECT id, nombre, apellido FROM clientes WHERE id = ?',
    [customerId]
  );

  if (!customer) {
    throw createError('Cliente no encontrado', 404);
  }

  // Verificar que el producto existe
  const [product] = await executeQuery(
    'SELECT id, nombre FROM productos WHERE id = ?',
    [productId]
  );

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  // Remover de favoritos
  const [result] = await executeQuery(
    'DELETE FROM favoritos WHERE cliente_id = ? AND producto_id = ?',
    [customerId, productId]
  );

  if (result.affectedRows === 0) {
    throw createError('El producto no estaba en favoritos', 404);
  }

  res.json({
    success: true,
    message: 'Producto removido de favoritos exitosamente',
    data: {
      customerId,
      productId,
      productName: product.nombre
    }
  });
}));

// GET /api/customers/stats/overview - Estadísticas de clientes
router.get('/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  // Estadísticas generales
  const [stats] = await executeQuery(
    `SELECT 
      COUNT(*) as total_clientes,
      COUNT(CASE WHEN registrado = TRUE THEN 1 END) as clientes_registrados,
      COUNT(CASE WHEN activo = TRUE THEN 1 END) as clientes_activos,
      COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as nuevos_hoy,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as nuevos_semana,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes
     FROM clientes`
  );

  // Clientes más activos (por total gastado)
  const topCustomers = await executeQuery(
    `SELECT 
      c.id,
      c.nombre,
      c.apellido,
      c.email,
      COUNT(p.id) as total_pedidos,
      SUM(p.total) as total_gastado,
      MAX(p.created_at) as ultimo_pedido
     FROM clientes c 
     LEFT JOIN pedidos p ON c.id = p.cliente_id 
     WHERE c.activo = TRUE 
     GROUP BY c.id 
     HAVING total_gastado > 0 
     ORDER BY total_gastado DESC 
     LIMIT 10`
  );

  // Nuevos clientes por mes (últimos 12 meses)
  const newCustomersByMonth = await executeQuery(
    `SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as mes,
      COUNT(*) as nuevos_clientes
     FROM clientes 
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY mes DESC`
  );

  res.json({
    success: true,
    data: {
      stats,
      topCustomers,
      newCustomersByMonth
    }
  });
}));

module.exports = router;
