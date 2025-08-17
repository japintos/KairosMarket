/**
 * Rutas de pagos para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const mercadopago = require('mercadopago');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId } = require('../middleware/errorHandler');

const router = express.Router();

// Configurar MercadoPago
if (process.env.MP_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
  });
}

// POST /api/payments/create-preference - Crear preferencia de pago
router.post('/create-preference', asyncHandler(async (req, res) => {
  const { items, orderData } = req.body;

  if (!items || items.length === 0) {
    throw createError('No hay productos en el carrito', 400);
  }

  try {
    // Crear preferencia de MercadoPago
    const preference = {
      items: items.map(item => ({
        title: item.nombre,
        unit_price: parseFloat(item.precio),
        quantity: parseInt(item.cantidad),
        currency_id: 'ARS',
        picture_url: item.imagen || 'https://via.placeholder.com/150'
      })),
      back_urls: {
        success: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/failure`,
        pending: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: orderData?.numero_pedido || `KAI-${Date.now()}`,
      notification_url: process.env.MP_WEBHOOK_URL || `${process.env.CORS_ORIGIN || 'http://localhost:5000'}/api/payments/webhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    const response = await mercadopago.preferences.create(preference);
    
    res.json({
      success: true,
      message: 'Preferencia de pago creada exitosamente',
      data: {
        preference: response.body,
        init_point: response.body.init_point,
        sandbox_init_point: response.body.sandbox_init_point
      }
    });
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    throw createError('Error al crear la preferencia de pago', 500);
  }
}));

// GET /api/payments/preference/:id - Obtener preferencia por ID
router.get('/preference/:id', asyncHandler(async (req, res) => {
  const preferenceId = req.params.id;

  try {
    const response = await mercadopago.preferences.findById(preferenceId);
    
    res.json({
      success: true,
      data: {
        preference: response.body
      }
    });
  } catch (error) {
    console.error('Error al obtener preferencia:', error);
    throw createError('Error al obtener la preferencia de pago', 500);
  }
}));

// GET /api/payments/payment/:id - Obtener información de pago
router.get('/payment/:id', asyncHandler(async (req, res) => {
  const paymentId = req.params.id;

  try {
    const response = await mercadopago.payment.findById(paymentId);
    
    res.json({
      success: true,
      data: {
        payment: response.body
      }
    });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    throw createError('Error al obtener información del pago', 500);
  }
}));

// POST /api/payments/webhook - Webhook de MercadoPago
router.post('/webhook', asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  console.log('🔔 Webhook recibido:', { type, data });

  if (type === 'payment') {
    try {
      const paymentId = data.id;
      const payment = await mercadopago.payment.findById(paymentId);
      
      if (!payment.body) {
        throw new Error('No se pudo obtener información del pago');
      }

      const paymentData = payment.body;
      const externalReference = paymentData.external_reference;
      const status = paymentData.status;
      const statusDetail = paymentData.status_detail;

      console.log('💳 Información del pago:', {
        paymentId,
        externalReference,
        status,
        statusDetail,
        amount: paymentData.transaction_amount
      });

      // Buscar pedido por referencia externa
      const [order] = await executeQuery(
        'SELECT id, numero_pedido, estado, total FROM pedidos WHERE numero_pedido = ?',
        [externalReference]
      );

      if (!order) {
        console.error('❌ Pedido no encontrado para referencia:', externalReference);
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Actualizar pedido según el estado del pago
      let newStatus = order.estado;
      let updateFields = [];
      let updateValues = [];

      switch (status) {
        case 'approved':
          newStatus = 'en_preparacion';
          updateFields.push('estado = ?', 'id_pago_mercadopago = ?');
          updateValues.push(newStatus, paymentId.toString());
          
          // Registrar en caja
          await executeQuery(
            `INSERT INTO caja (tipo, concepto, monto, pedido_id, metodo_pago, fecha) 
             VALUES ('ingreso', ?, ?, ?, 'mercadopago', CURDATE())`,
            [`Pago pedido ${order.numero_pedido}`, order.total, order.id]
          );
          break;

        case 'pending':
          newStatus = 'pendiente';
          updateFields.push('estado = ?', 'id_pago_mercadopago = ?');
          updateValues.push(newStatus, paymentId.toString());
          break;

        case 'in_process':
          newStatus = 'pendiente';
          updateFields.push('estado = ?', 'id_pago_mercadopago = ?');
          updateValues.push(newStatus, paymentId.toString());
          break;

        case 'rejected':
        case 'cancelled':
          newStatus = 'cancelado';
          updateFields.push('estado = ?', 'id_pago_mercadopago = ?');
          updateValues.push(newStatus, paymentId.toString());
          break;

        default:
          console.log('⚠️ Estado de pago no manejado:', status);
          break;
      }

      // Actualizar pedido si hay cambios
      if (updateFields.length > 0) {
        updateValues.push(order.id);
        await executeQuery(
          `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );

        console.log(`✅ Pedido ${order.numero_pedido} actualizado a estado: ${newStatus}`);
      }

      // Enviar notificación por email (opcional)
      if (process.env.EMAIL_HOST && status === 'approved') {
        try {
          // Aquí se podría implementar el envío de email de confirmación
          console.log('📧 Email de confirmación enviado para pedido:', order.numero_pedido);
        } catch (emailError) {
          console.error('❌ Error al enviar email:', emailError);
        }
      }

      res.json({ success: true, message: 'Webhook procesado correctamente' });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  } else {
    console.log('ℹ️ Webhook de tipo no manejado:', type);
    res.json({ success: true, message: 'Webhook recibido' });
  }
}));

// GET /api/payments/orders/:orderId - Obtener información de pago de un pedido
router.get('/orders/:orderId', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const orderId = validateId(req.params.orderId);

  // Obtener pedido
  const [order] = await executeQuery(
    'SELECT id, numero_pedido, id_pago_mercadopago, estado, total, forma_pago FROM pedidos WHERE id = ?',
    [orderId]
  );

  if (!order) {
    throw createError('Pedido no encontrado', 404);
  }

  let paymentInfo = null;

  // Si tiene ID de pago de MercadoPago, obtener información
  if (order.id_pago_mercadopago) {
    try {
      const payment = await mercadopago.payment.findById(order.id_pago_mercadopago);
      paymentInfo = payment.body;
    } catch (error) {
      console.error('Error al obtener información de pago:', error);
      paymentInfo = { error: 'No se pudo obtener información del pago' };
    }
  }

  res.json({
    success: true,
    data: {
      order,
      payment: paymentInfo
    }
  });
}));

// POST /api/payments/refund/:paymentId - Reembolsar pago
router.post('/refund/:paymentId', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const paymentId = req.params.paymentId;
  const { amount, reason } = req.body;

  try {
    const refundData = {
      amount: amount || null // Si no se especifica, reembolsa todo
    };

    const response = await mercadopago.refund.create(paymentId, refundData);
    
    // Buscar pedido asociado al pago
    const [order] = await executeQuery(
      'SELECT id, numero_pedido, total FROM pedidos WHERE id_pago_mercadopago = ?',
      [paymentId]
    );

    if (order) {
      // Actualizar estado del pedido
      await executeQuery(
        'UPDATE pedidos SET estado = ? WHERE id = ?',
        ['cancelado', order.id]
      );

      // Registrar reembolso en caja
      const refundAmount = amount || order.total;
      await executeQuery(
        `INSERT INTO caja (tipo, concepto, monto, pedido_id, metodo_pago, observaciones, fecha) 
         VALUES ('egreso', ?, ?, ?, 'mercadopago', ?, CURDATE())`,
        [`Reembolso pedido ${order.numero_pedido}`, refundAmount, order.id, reason || 'Reembolso solicitado']
      );
    }

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: {
        refund: response.body,
        orderId: order?.id,
        orderNumber: order?.numero_pedido
      }
    });
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    throw createError('Error al procesar reembolso', 500);
  }
}));

// GET /api/payments/stats/overview - Estadísticas de pagos
router.get('/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let dateFilter = '';
  const queryParams = [];

  if (fecha_inicio && fecha_fin) {
    dateFilter = 'WHERE DATE(p.created_at) BETWEEN ? AND ?';
    queryParams.push(fecha_inicio, fecha_fin);
  }

  // Estadísticas de pagos
  const [paymentStats] = await executeQuery(
    `SELECT 
      COUNT(*) as total_pedidos,
      COUNT(CASE WHEN p.id_pago_mercadopago IS NOT NULL THEN 1 END) as pagos_mercadopago,
      COUNT(CASE WHEN p.forma_pago = 'efectivo' THEN 1 END) as pagos_efectivo,
      COUNT(CASE WHEN p.forma_pago = 'transferencia' THEN 1 END) as pagos_transferencia,
      SUM(p.total) as total_ventas,
      AVG(p.total) as promedio_venta
     FROM pedidos p 
     ${dateFilter}`,
    queryParams
  );

  // Ventas por método de pago
  const salesByMethod = await executeQuery(
    `SELECT 
      forma_pago,
      COUNT(*) as cantidad_pedidos,
      SUM(total) as total_ventas
     FROM pedidos 
     ${dateFilter} 
     GROUP BY forma_pago 
     ORDER BY total_ventas DESC`,
    queryParams
  );

  // Ventas diarias (últimos 30 días)
  const dailySales = await executeQuery(
    `SELECT 
      DATE(created_at) as fecha,
      COUNT(*) as pedidos,
      SUM(total) as ventas,
      COUNT(CASE WHEN id_pago_mercadopago IS NOT NULL THEN 1 END) as pagos_online
     FROM pedidos 
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY fecha DESC`
  );

  res.json({
    success: true,
    data: {
      paymentStats,
      salesByMethod,
      dailySales
    }
  });
}));

// GET /api/payments/config - Obtener configuración de pagos
router.get('/config', asyncHandler(async (req, res) => {
  const config = {
    publicKey: process.env.MP_PUBLIC_KEY,
    sandbox: process.env.NODE_ENV === 'development',
    currency: 'ARS',
    installments: 12,
    excludedPaymentTypes: ['ticket'], // Excluir pagos en efectivo
    backUrls: {
      success: `${process.env.CORS_ORIGIN}/payment/success`,
      failure: `${process.env.CORS_ORIGIN}/payment/failure`,
      pending: `${process.env.CORS_ORIGIN}/payment/pending`
    }
  };

  res.json({
    success: true,
    data: {
      config
    }
  });
}));

module.exports = router;
