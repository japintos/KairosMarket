/**
 * Rutas del panel administrativo para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId, validatePrice } = require('../middleware/errorHandler');

const router = express.Router();

// Esquemas de validación
const cashEntrySchema = Joi.object({
  tipo: Joi.string().valid('ingreso', 'egreso').required().messages({
    'any.only': 'El tipo debe ser ingreso o egreso',
    'any.required': 'El tipo es requerido'
  }),
  concepto: Joi.string().min(2).max(200).required().messages({
    'string.min': 'El concepto debe tener al menos 2 caracteres',
    'string.max': 'El concepto no puede exceder 200 caracteres',
    'any.required': 'El concepto es requerido'
  }),
  monto: Joi.number().positive().required().messages({
    'number.positive': 'El monto debe ser positivo',
    'any.required': 'El monto es requerido'
  }),
  pedido_id: Joi.number().integer().positive().optional().messages({
    'number.integer': 'El ID del pedido debe ser un número entero',
    'number.positive': 'El ID del pedido debe ser positivo'
  }),
  metodo_pago: Joi.string().valid('efectivo', 'mercadopago', 'transferencia', 'otro').optional().messages({
    'any.only': 'El método de pago debe ser efectivo, mercadopago, transferencia u otro'
  }),
  observaciones: Joi.string().max(500).optional().messages({
    'string.max': 'Las observaciones no pueden exceder 500 caracteres'
  }),
  fecha: Joi.date().max('now').default(() => new Date()).messages({
    'date.max': 'La fecha no puede ser futura'
  })
});

// GET /api/admin/dashboard - Dashboard principal
router.get('/dashboard', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  try {
    // Estadísticas generales
    const [generalStats] = await executeQuery(
      `SELECT 
        (SELECT COUNT(*) FROM productos WHERE activo = TRUE) as total_productos,
        (SELECT COUNT(*) FROM productos WHERE stock <= stock_minimo AND activo = TRUE) as productos_stock_bajo,
        (SELECT COUNT(*) FROM clientes WHERE activo = TRUE) as total_clientes,
        (SELECT COUNT(*) FROM clientes WHERE DATE(created_at) = CURDATE()) as nuevos_clientes_hoy,
        (SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente') as pedidos_pendientes,
        (SELECT COUNT(*) FROM pedidos WHERE estado = 'en_preparacion') as pedidos_preparacion,
        (SELECT COUNT(*) FROM contactos WHERE leido = FALSE) as mensajes_no_leidos`
    );

    // Ventas del día
    const [todaySales] = await executeQuery(
      `SELECT 
        COUNT(*) as pedidos_hoy,
        COALESCE(SUM(total), 0) as ventas_hoy,
        COALESCE(AVG(total), 0) as promedio_venta_hoy
       FROM pedidos 
       WHERE DATE(created_at) = CURDATE() AND estado != 'cancelado'`
    );

    // Ventas del mes
    const [monthSales] = await executeQuery(
      `SELECT 
        COUNT(*) as pedidos_mes,
        COALESCE(SUM(total), 0) as ventas_mes,
        COALESCE(AVG(total), 0) as promedio_venta_mes
       FROM pedidos 
       WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') 
       AND estado != 'cancelado'`
    );

    // Productos más vendidos (últimos 30 días)
    const topProducts = await executeQuery(
      `SELECT 
        dp.producto_nombre,
        SUM(dp.cantidad) as cantidad_vendida,
        SUM(dp.subtotal) as total_vendido
       FROM detalle_pedido dp 
       JOIN pedidos p ON dp.pedido_id = p.id 
       WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
       AND p.estado != 'cancelado'
       GROUP BY dp.producto_id, dp.producto_nombre 
       ORDER BY cantidad_vendida DESC 
       LIMIT 5`
    );

    // Pedidos recientes
    const recentOrders = await executeQuery(
      `SELECT 
        p.id,
        c.nombre as cliente_nombre,
        p.total,
        p.estado,
        p.created_at
       FROM pedidos p
       JOIN clientes c ON p.cliente_id = c.id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    // Mensajes recientes
    const recentMessages = await executeQuery(
      `SELECT 
        id,
        nombre,
        asunto,
        created_at
       FROM contactos
       ORDER BY created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts: generalStats.total_productos || 0,
          totalCustomers: generalStats.total_clientes || 0,
          totalOrders: generalStats.pedidos_pendientes + generalStats.pedidos_preparacion || 0,
          unreadMessages: generalStats.mensajes_no_leidos || 0,
          todaySales: todaySales.ventas_hoy || 0,
          monthlySales: monthSales.ventas_mes || 0,
          averageOrderValue: monthSales.promedio_venta_mes || 0
        },
        topProducts,
        recentOrders,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    throw createError('Error al cargar datos del dashboard', 500);
  }
}));

// GET /api/admin/cash - Obtener movimientos de caja
router.get('/cash', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    tipo,
    fecha_inicio,
    fecha_fin,
    metodo_pago
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (tipo) {
    whereClause += ' AND tipo = ?';
    queryParams.push(tipo);
  }

  if (fecha_inicio) {
    whereClause += ' AND fecha >= ?';
    queryParams.push(fecha_inicio);
  }

  if (fecha_fin) {
    whereClause += ' AND fecha <= ?';
    queryParams.push(fecha_fin);
  }

  if (metodo_pago) {
    whereClause += ' AND metodo_pago = ?';
    queryParams.push(metodo_pago);
  }

  // Obtener total de movimientos
  const [countResult] = await executeQuery(
    `SELECT COUNT(*) as total FROM caja ${whereClause}`,
    queryParams
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener movimientos
  const cashMovements = await executeQuery(
    `SELECT c.*, 
            p.numero_pedido,
            u.nombre as usuario_nombre
     FROM caja c 
     LEFT JOIN pedidos p ON c.pedido_id = p.id 
     LEFT JOIN usuarios u ON c.usuario_id = u.id 
     ${whereClause} 
     ORDER BY c.fecha DESC, c.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  // Calcular totales
  const [totals] = await executeQuery(
    `SELECT 
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
      SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance
     FROM caja ${whereClause}`,
    queryParams
  );

  res.json({
    success: true,
    data: {
      cashMovements,
      totals,
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

// POST /api/admin/cash - Registrar movimiento de caja
router.post('/cash', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = cashEntrySchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const {
    tipo,
    concepto,
    monto,
    pedido_id,
    metodo_pago,
    observaciones,
    fecha
  } = value;

  // Verificar que el pedido existe si se proporciona
  if (pedido_id) {
    const [order] = await executeQuery(
      'SELECT id, numero_pedido FROM pedidos WHERE id = ?',
      [pedido_id]
    );

    if (!order) {
      throw createError('Pedido no encontrado', 400);
    }
  }

  // Insertar movimiento de caja
  const [result] = await executeQuery(
    `INSERT INTO caja (
      tipo, concepto, monto, pedido_id, usuario_id, metodo_pago, observaciones, fecha
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipo, concepto, monto, pedido_id, req.user.id, metodo_pago, observaciones, fecha]
  );

  // Obtener movimiento creado
  const [newMovement] = await executeQuery(
    `SELECT c.*, 
            p.numero_pedido,
            u.nombre as usuario_nombre
     FROM caja c 
     LEFT JOIN pedidos p ON c.pedido_id = p.id 
     LEFT JOIN usuarios u ON c.usuario_id = u.id 
     WHERE c.id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Movimiento de caja registrado exitosamente',
    data: {
      movement: newMovement
    }
  });
}));

// GET /api/admin/cash/summary - Resumen de caja
router.get('/cash/summary', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let dateFilter = '';
  const queryParams = [];

  if (fecha_inicio && fecha_fin) {
    dateFilter = 'WHERE fecha BETWEEN ? AND ?';
    queryParams.push(fecha_inicio, fecha_fin);
  }

  // Resumen general
  const [summary] = await executeQuery(
    `SELECT 
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
      SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance,
      COUNT(*) as total_movimientos
     FROM caja ${dateFilter}`,
    queryParams
  );

  // Movimientos por tipo
  const movementsByType = await executeQuery(
    `SELECT 
      tipo,
      COUNT(*) as cantidad,
      SUM(monto) as total
     FROM caja ${dateFilter} 
     GROUP BY tipo`,
    queryParams
  );

  // Movimientos por método de pago
  const movementsByMethod = await executeQuery(
    `SELECT 
      metodo_pago,
      COUNT(*) as cantidad,
      SUM(monto) as total
     FROM caja ${dateFilter} 
     WHERE metodo_pago IS NOT NULL
     GROUP BY metodo_pago`,
    queryParams
  );

  // Movimientos diarios
  const dailyMovements = await executeQuery(
    `SELECT 
      fecha,
      COUNT(*) as movimientos,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
      SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as egresos
     FROM caja 
     WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY fecha 
     ORDER BY fecha DESC`
  );

  res.json({
    success: true,
    data: {
      summary,
      movementsByType,
      movementsByMethod,
      dailyMovements
    }
  });
}));

// GET /api/admin/reports/sales - Reporte de ventas
router.get('/reports/sales', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { fecha_inicio, fecha_fin, categoria_id } = req.query;

  let dateFilter = 'WHERE p.estado != "cancelado"';
  const queryParams = [];

  if (fecha_inicio && fecha_fin) {
    dateFilter += ' AND DATE(p.created_at) BETWEEN ? AND ?';
    queryParams.push(fecha_inicio, fecha_fin);
  }

  if (categoria_id) {
    dateFilter += ' AND p.categoria_id = ?';
    queryParams.push(parseInt(categoria_id));
  }

  // Resumen de ventas
  const [salesSummary] = await executeQuery(
    `SELECT 
      COUNT(DISTINCT p.id) as total_pedidos,
      COUNT(DISTINCT p.cliente_id) as clientes_unicos,
      SUM(p.total) as total_ventas,
      AVG(p.total) as promedio_venta,
      SUM(p.costo_envio) as total_envios
     FROM pedidos p 
     ${dateFilter}`,
    queryParams
  );

  // Ventas por categoría
  const salesByCategory = await executeQuery(
    `SELECT 
      c.nombre as categoria,
      COUNT(DISTINCT p.id) as pedidos,
      SUM(dp.cantidad) as unidades_vendidas,
      SUM(dp.subtotal) as total_ventas
     FROM pedidos p 
     JOIN detalle_pedido dp ON p.id = dp.pedido_id 
     JOIN productos prod ON dp.producto_id = prod.id 
     LEFT JOIN categorias c ON prod.categoria_id = c.id 
     ${dateFilter} 
     GROUP BY c.id, c.nombre 
     ORDER BY total_ventas DESC`,
    queryParams
  );

  // Productos más vendidos
  const topSellingProducts = await executeQuery(
    `SELECT 
      dp.producto_nombre,
      SUM(dp.cantidad) as cantidad_vendida,
      SUM(dp.subtotal) as total_vendido,
      AVG(dp.precio_unitario) as precio_promedio
     FROM detalle_pedido dp 
     JOIN pedidos p ON dp.pedido_id = p.id 
     ${dateFilter} 
     GROUP BY dp.producto_id, dp.producto_nombre 
     ORDER BY cantidad_vendida DESC 
     LIMIT 15`,
    queryParams
  );

  // Ventas por día
  const salesByDay = await executeQuery(
    `SELECT 
      DATE(p.created_at) as fecha,
      COUNT(DISTINCT p.id) as pedidos,
      COUNT(DISTINCT p.cliente_id) as clientes,
      SUM(p.total) as ventas,
      AVG(p.total) as promedio_venta
     FROM pedidos p 
     ${dateFilter} 
     GROUP BY DATE(p.created_at) 
     ORDER BY fecha DESC`,
    queryParams
  );

  res.json({
    success: true,
    data: {
      salesSummary,
      salesByCategory,
      topSellingProducts,
      salesByDay
    }
  });
}));

// GET /api/admin/reports/inventory - Reporte de inventario
router.get('/reports/inventory', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  // Resumen de inventario
  const [inventorySummary] = await executeQuery(
    `SELECT 
      COUNT(*) as total_productos,
      COUNT(CASE WHEN stock > 0 THEN 1 END) as con_stock,
      COUNT(CASE WHEN stock = 0 THEN 1 END) as sin_stock,
      COUNT(CASE WHEN stock <= stock_minimo THEN 1 END) as stock_bajo,
      SUM(stock) as total_unidades,
      SUM(stock * precio) as valor_inventario
     FROM productos 
     WHERE activo = TRUE`
  );

  // Productos con stock bajo
  const lowStockProducts = await executeQuery(
    `SELECT 
      p.*, c.nombre as categoria_nombre
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE AND p.stock <= p.stock_minimo 
     ORDER BY p.stock ASC`
  );

  // Productos sin stock
  const outOfStockProducts = await executeQuery(
    `SELECT 
      p.*, c.nombre as categoria_nombre
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE AND p.stock = 0 
     ORDER BY p.nombre ASC`
  );

  // Inventario por categoría
  const inventoryByCategory = await executeQuery(
    `SELECT 
      c.nombre as categoria,
      COUNT(p.id) as total_productos,
      COUNT(CASE WHEN p.stock > 0 THEN 1 END) as con_stock,
      COUNT(CASE WHEN p.stock <= p.stock_minimo THEN 1 END) as stock_bajo,
      SUM(p.stock) as total_unidades,
      SUM(p.stock * p.precio) as valor_inventario
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE 
     GROUP BY c.id, c.nombre 
     ORDER BY valor_inventario DESC`
  );

  // Productos más valiosos
  const mostValuableProducts = await executeQuery(
    `SELECT 
      p.nombre,
      p.stock,
      p.precio,
      (p.stock * p.precio) as valor_inventario,
      c.nombre as categoria_nombre
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE 
     ORDER BY valor_inventario DESC 
     LIMIT 10`
  );

  res.json({
    success: true,
    data: {
      inventorySummary,
      lowStockProducts,
      outOfStockProducts,
      inventoryByCategory,
      mostValuableProducts
    }
  });
}));

// GET /api/admin/reports/customers - Reporte de clientes
router.get('/reports/customers', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let dateFilter = '';
  const queryParams = [];

  if (fecha_inicio && fecha_fin) {
    dateFilter = 'WHERE c.created_at BETWEEN ? AND ?';
    queryParams.push(fecha_inicio, fecha_fin);
  }

  // Resumen de clientes
  const [customerSummary] = await executeQuery(
    `SELECT 
      COUNT(*) as total_clientes,
      COUNT(CASE WHEN registrado = TRUE THEN 1 END) as clientes_registrados,
      COUNT(CASE WHEN activo = TRUE THEN 1 END) as clientes_activos,
      COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as nuevos_hoy
     FROM clientes ${dateFilter}`,
    queryParams
  );

  // Clientes más activos
  const topCustomers = await executeQuery(
    `SELECT 
      c.nombre,
      c.apellido,
      c.email,
      COUNT(p.id) as total_pedidos,
      SUM(p.total) as total_gastado,
      AVG(p.total) as promedio_compra,
      MAX(p.created_at) as ultimo_pedido
     FROM clientes c 
     LEFT JOIN pedidos p ON c.id = p.cliente_id 
     ${dateFilter} 
     GROUP BY c.id 
     HAVING total_gastado > 0 
     ORDER BY total_gastado DESC 
     LIMIT 10`,
    queryParams
  );

  // Nuevos clientes por mes
  const newCustomersByMonth = await executeQuery(
    `SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as mes,
      COUNT(*) as nuevos_clientes,
      COUNT(CASE WHEN registrado = TRUE THEN 1 END) as registrados
     FROM clientes 
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY mes DESC`
  );

  // Clientes por valor de compra
  const customersByValue = await executeQuery(
    `SELECT 
      CASE 
        WHEN total_gastado >= 10000 THEN 'Alto valor (≥$10,000)'
        WHEN total_gastado >= 5000 THEN 'Medio valor ($5,000-$9,999)'
        WHEN total_gastado >= 1000 THEN 'Bajo valor ($1,000-$4,999)'
        ELSE 'Sin compras'
      END as segmento,
      COUNT(*) as cantidad_clientes,
      SUM(total_gastado) as total_ventas
     FROM (
       SELECT c.id, COALESCE(SUM(p.total), 0) as total_gastado
       FROM clientes c 
       LEFT JOIN pedidos p ON c.id = p.cliente_id 
       ${dateFilter} 
       GROUP BY c.id
     ) as customer_totals 
     GROUP BY segmento`,
    queryParams
  );

  res.json({
    success: true,
    data: {
      customerSummary,
      topCustomers,
      newCustomersByMonth,
      customersByValue
    }
  });
}));

// ===== RUTAS DE CONTACTOS PARA ADMIN =====

// GET /api/admin/contacts - Listar mensajes de contacto
router.get('/contacts', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    estado,
    search = ''
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (estado) {
    whereClause += ' AND estado = ?';
    queryParams.push(estado);
  }

  if (search) {
    whereClause += ' AND (nombre LIKE ? OR email LIKE ? OR asunto LIKE ? OR mensaje LIKE ?)';
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Obtener total de mensajes
  const [countResult] = await executeQuery(
    `SELECT COUNT(*) as total FROM contactos ${whereClause}`,
    queryParams
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener mensajes
  const contacts = await executeQuery(
    `SELECT * FROM contactos ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      contacts,
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

// GET /api/admin/contacts/:id - Obtener mensaje por ID
router.get('/contacts/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  const [contact] = await executeQuery(
    'SELECT * FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  res.json({
    success: true,
    data: {
      contact
    }
  });
}));

// PATCH /api/admin/contacts/:id/read - Marcar mensaje como leído
router.patch('/contacts/:id/read', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre, estado FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  // Marcar como leído (cambiar estado a 'leido')
  await executeQuery(
    'UPDATE contactos SET estado = "leido" WHERE id = ?',
    [contactId]
  );

  res.json({
    success: true,
    message: 'Mensaje marcado como leído',
    data: {
      contactId,
      nombre: contact.nombre
    }
  });
}));

// POST /api/admin/contacts/:id/reply - Responder mensaje
router.post('/contacts/:id/reply', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);
  const { respuesta } = req.body;

  if (!respuesta || respuesta.trim().length < 10) {
    throw createError('La respuesta debe tener al menos 10 caracteres', 400);
  }

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre, email, asunto, estado FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  // Actualizar mensaje con respuesta
  await executeQuery(
    'UPDATE contactos SET respuesta = ?, estado = "respondido", fecha_respuesta = CURRENT_TIMESTAMP WHERE id = ?',
    [respuesta.trim(), contactId]
  );

  res.json({
    success: true,
    message: 'Respuesta enviada exitosamente',
    data: {
      contactId,
      nombre: contact.nombre,
      email: contact.email,
      asunto: contact.asunto
    }
  });
}));

// PATCH /api/admin/contacts/:id/archive - Archivar mensaje
router.patch('/contacts/:id/archive', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  // Archivar mensaje (cambiar estado a 'archivado')
  await executeQuery(
    'UPDATE contactos SET estado = "archivado" WHERE id = ?',
    [contactId]
  );

  res.json({
    success: true,
    message: 'Mensaje archivado correctamente',
    data: {
      contactId,
      nombre: contact.nombre
    }
  });
}));

// DELETE /api/admin/contacts/:id - Eliminar mensaje
router.delete('/contacts/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre, email FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  // Eliminar mensaje
  await executeQuery('DELETE FROM contactos WHERE id = ?', [contactId]);

  res.json({
    success: true,
    message: 'Mensaje eliminado exitosamente',
    data: {
      contactId,
      nombre: contact.nombre,
      email: contact.email
    }
  });
}));

// GET /api/admin/contacts/stats/overview - Estadísticas de contactos
router.get('/contacts/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  // Estadísticas generales
  const [stats] = await executeQuery(
    `SELECT 
      COUNT(*) as total_mensajes,
      COUNT(CASE WHEN estado = 'nuevo' THEN 1 END) as no_leidos,
      COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos,
      COUNT(CASE WHEN estado = 'archivado' THEN 1 END) as archivados,
      COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as nuevos_hoy,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as nuevos_semana,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes
     FROM contactos`
  );

  // Mensajes por mes (últimos 12 meses)
  const messagesByMonth = await executeQuery(
    `SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as mes,
      COUNT(*) as total_mensajes,
      COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos
     FROM contactos 
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY mes DESC`
  );

  // Asuntos más comunes
  const commonSubjects = await executeQuery(
    `SELECT 
      asunto,
      COUNT(*) as cantidad
     FROM contactos 
     GROUP BY asunto 
     ORDER BY cantidad DESC 
     LIMIT 10`
  );

  res.json({
    success: true,
    data: {
      stats,
      messagesByMonth,
      commonSubjects
    }
  });
}));

module.exports = router;
