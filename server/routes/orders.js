/**
 * Rutas de órdenes para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId } = require('../middleware/errorHandler');

const router = express.Router();

// Esquemas de validación
const createOrderSchema = Joi.object({
  numero_pedido: Joi.string().required(),
  cliente: Joi.object({
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    email: Joi.string().email().required(),
    telefono: Joi.string().required(),
    direccion: Joi.string().required(),
    ciudad: Joi.string().required(),
    provincia: Joi.string().required(),
    codigo_postal: Joi.string().optional()
  }).required(),
  productos: Joi.array().items(Joi.object({
    id: Joi.number().required(),
    nombre: Joi.string().required(),
    precio: Joi.number().positive().required(),
    quantity: Joi.number().positive().required(),
    formato: Joi.string().optional()
  })).min(1).required(),
  subtotal: Joi.number().positive().required(),
  costo_envio: Joi.number().min(0).required(),
  total: Joi.number().positive().required(),
  forma_pago: Joi.string().valid('mercadopago', 'efectivo', 'transferencia').required(),
  observaciones: Joi.string().optional()
});

// POST /api/orders - Crear nueva orden
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const orderData = value;
  const userId = req.user.id;

  try {
    // Iniciar transacción
    const connection = await executeQuery('START TRANSACTION');

    // Crear o buscar cliente
    let clienteId = null;
    const [existingCliente] = await executeQuery(
      'SELECT id FROM clientes WHERE email = ?',
      [orderData.cliente.email]
    );

    if (existingCliente) {
      clienteId = existingCliente.id;
      // Actualizar datos del cliente
      await executeQuery(
        `UPDATE clientes SET 
         nombre = ?, apellido = ?, telefono = ?, direccion = ?, 
         ciudad = ?, provincia = ?, codigo_postal = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          orderData.cliente.nombre, orderData.cliente.apellido, orderData.cliente.telefono,
          orderData.cliente.direccion, orderData.cliente.ciudad, orderData.cliente.provincia,
          orderData.cliente.codigo_postal, clienteId
        ]
      );
    } else {
      // Crear nuevo cliente
      const [clienteResult] = await executeQuery(
        `INSERT INTO clientes (nombre, apellido, email, telefono, direccion, ciudad, provincia, codigo_postal, registrado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          orderData.cliente.nombre, orderData.cliente.apellido, orderData.cliente.email,
          orderData.cliente.telefono, orderData.cliente.direccion, orderData.cliente.ciudad,
          orderData.cliente.provincia, orderData.cliente.codigo_postal
        ]
      );
      clienteId = clienteResult.insertId;
    }

    // Crear orden
    const [orderResult] = await executeQuery(
      `INSERT INTO pedidos (
        numero_pedido, cliente_id, cliente_nombre, cliente_email, cliente_telefono,
        cliente_direccion, total, subtotal, costo_envio, estado, forma_pago, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)`,
      [
        orderData.numero_pedido, clienteId, orderData.cliente.nombre, orderData.cliente.email,
        orderData.cliente.telefono, orderData.cliente.direccion, orderData.total,
        orderData.subtotal, orderData.costo_envio, orderData.forma_pago, orderData.observaciones
      ]
    );

    const orderId = orderResult.insertId;

    // Crear detalles de la orden
    for (const producto of orderData.productos) {
      await executeQuery(
        `INSERT INTO detalle_pedido (
          pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal, formato
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, producto.id, producto.nombre, producto.quantity, producto.precio,
          producto.precio * producto.quantity, producto.formato || null
        ]
      );

      // Actualizar stock del producto
      await executeQuery(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [producto.quantity, producto.id]
      );
    }

    // Si es pago en efectivo, registrar en caja
    if (orderData.forma_pago === 'efectivo') {
      await executeQuery(
        `INSERT INTO caja (tipo, concepto, monto, pedido_id, usuario_id, metodo_pago, fecha)
         VALUES ('ingreso', ?, ?, ?, ?, 'efectivo', CURDATE())`,
        [`Pago pedido ${orderData.numero_pedido}`, orderData.total, orderId, userId]
      );
    }

    // Confirmar transacción
    await executeQuery('COMMIT');

    // Obtener orden creada
    const [order] = await executeQuery(
      `SELECT p.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
       FROM pedidos p
       LEFT JOIN clientes c ON p.cliente_id = c.id
       WHERE p.id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        order
      }
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await executeQuery('ROLLBACK');
    console.error('Error al crear orden:', error);
    throw createError('Error al crear la orden', 500);
  }
}));

// GET /api/orders - Listar órdenes
router.get('/', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = '', search = '' } = req.query;
  
  const offset = (page - 1) * limit;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (status) {
    whereClause += ' AND p.estado = ?';
    queryParams.push(status);
  }

  if (search) {
    whereClause += ' AND (p.numero_pedido LIKE ? OR p.cliente_nombre LIKE ? OR p.cliente_email LIKE ?)';
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Obtener total de órdenes
  const [countResult] = await executeQuery(
    `SELECT COUNT(*) as total FROM pedidos p ${whereClause}`,
    queryParams
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener órdenes
  const orders = await executeQuery(
    `SELECT p.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
     FROM pedidos p
     LEFT JOIN clientes c ON p.cliente_id = c.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      orders,
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

// GET /api/orders/:id - Obtener orden específica
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const orderId = validateId(req.params.id);

  // Obtener orden
  const [order] = await executeQuery(
    `SELECT p.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
     FROM pedidos p
     LEFT JOIN clientes c ON p.cliente_id = c.id
     WHERE p.id = ?`,
    [orderId]
  );

  if (!order) {
    throw createError('Orden no encontrada', 404);
  }

  // Verificar permisos (solo admin/vendedor o el cliente propietario)
  if (req.user.rol !== 'admin' && req.user.rol !== 'vendedor') {
    // Para clientes, verificar que sea su orden
    if (order.cliente_id !== req.user.id) {
      throw createError('No tiene permisos para ver esta orden', 403);
    }
  }

  // Obtener detalles de la orden
  const orderDetails = await executeQuery(
    `SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen
     FROM detalle_pedido dp
     LEFT JOIN productos p ON dp.producto_id = p.id
     WHERE dp.pedido_id = ?`,
    [orderId]
  );

  res.json({
    success: true,
    data: {
      order,
      details: orderDetails
    }
  });
}));

// PUT /api/orders/:id/status - Actualizar estado de la orden
router.put('/:id/status', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const orderId = validateId(req.params.id);
  const { estado } = req.body;

  const validStates = ['pendiente', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
  if (!validStates.includes(estado)) {
    throw createError('Estado de orden inválido', 400);
  }

  // Verificar que la orden existe
  const [order] = await executeQuery(
    'SELECT id, numero_pedido, estado, total FROM pedidos WHERE id = ?',
    [orderId]
  );

  if (!order) {
    throw createError('Orden no encontrada', 404);
  }

  // Actualizar estado
  await executeQuery(
    'UPDATE pedidos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [estado, orderId]
  );

  // Si se cancela la orden, devolver stock
  if (estado === 'cancelado' && order.estado !== 'cancelado') {
    const orderDetails = await executeQuery(
      'SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = ?',
      [orderId]
    );

    for (const detail of orderDetails) {
      await executeQuery(
        'UPDATE productos SET stock = stock + ? WHERE id = ?',
        [detail.cantidad, detail.producto_id]
      );
    }

    // Registrar devolución en caja si ya se había pagado
    if (order.estado !== 'pendiente') {
      await executeQuery(
        `INSERT INTO caja (tipo, concepto, monto, pedido_id, usuario_id, metodo_pago, observaciones, fecha)
         VALUES ('egreso', ?, ?, ?, ?, 'devolucion', 'Cancelación de pedido', CURDATE())`,
        [`Devolución pedido ${order.numero_pedido}`, order.total, orderId, req.user.id]
      );
    }
  }

  res.json({
    success: true,
    message: 'Estado de orden actualizado exitosamente',
    data: {
      orderId,
      estado
    }
  });
}));

// GET /api/orders/customer/:customerId - Órdenes de un cliente específico
router.get('/customer/:customerId', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const customerId = validateId(req.params.customerId);
  const { page = 1, limit = 10 } = req.query;
  
  const offset = (page - 1) * limit;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  // Obtener total de órdenes del cliente
  const [countResult] = await executeQuery(
    'SELECT COUNT(*) as total FROM pedidos WHERE cliente_id = ?',
    [customerId]
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener órdenes del cliente
  const orders = await executeQuery(
    `SELECT * FROM pedidos 
     WHERE cliente_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [customerId, limitNum, offset]
  );

  res.json({
    success: true,
    data: {
      orders,
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

// GET /api/orders/stats/overview - Estadísticas de órdenes
router.get('/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let dateFilter = '';
  const queryParams = [];

  if (fecha_inicio && fecha_fin) {
    dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
    queryParams.push(fecha_inicio, fecha_fin);
  }

  // Estadísticas generales
  const [orderStats] = await executeQuery(
    `SELECT 
      COUNT(*) as total_pedidos,
      COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
      COUNT(CASE WHEN estado = 'en_preparacion' THEN 1 END) as en_preparacion,
      COUNT(CASE WHEN estado = 'enviado' THEN 1 END) as enviados,
      COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as entregados,
      COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados,
      SUM(total) as total_ventas,
      AVG(total) as promedio_venta
     FROM pedidos 
     ${dateFilter}`,
    queryParams
  );

  // Ventas por día (últimos 30 días)
  const dailySales = await executeQuery(
    `SELECT 
      DATE(created_at) as fecha,
      COUNT(*) as pedidos,
      SUM(total) as ventas
     FROM pedidos 
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY fecha DESC`
  );

  // Productos más vendidos
  const topProducts = await executeQuery(
    `SELECT 
      p.nombre,
      p.id,
      SUM(dp.cantidad) as total_vendido,
      SUM(dp.subtotal) as total_ventas
     FROM detalle_pedido dp
     JOIN productos p ON dp.producto_id = p.id
     JOIN pedidos ped ON dp.pedido_id = ped.id
     ${dateFilter ? 'WHERE ' + dateFilter.replace('created_at', 'ped.created_at') : ''}
     GROUP BY p.id, p.nombre
     ORDER BY total_vendido DESC
     LIMIT 10`,
    queryParams
  );

  res.json({
    success: true,
    data: {
      orderStats,
      dailySales,
      topProducts
    }
  });
}));

module.exports = router;
