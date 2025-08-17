/**
 * Rutas de contacto para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId, validateEmail } = require('../middleware/errorHandler');

const router = express.Router();

// Esquemas de validación
const contactSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  telefono: Joi.string().max(20).optional().messages({
    'string.max': 'El teléfono no puede exceder 20 caracteres'
  }),
  asunto: Joi.string().max(200).required().messages({
    'string.max': 'El asunto no puede exceder 200 caracteres',
    'any.required': 'El asunto es requerido'
  }),
  mensaje: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'El mensaje debe tener al menos 10 caracteres',
    'string.max': 'El mensaje no puede exceder 1000 caracteres',
    'any.required': 'El mensaje es requerido'
  })
});

const responseSchema = Joi.object({
  respuesta: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'La respuesta debe tener al menos 10 caracteres',
    'string.max': 'La respuesta no puede exceder 1000 caracteres',
    'any.required': 'La respuesta es requerida'
  })
});

// POST /api/contact - Enviar mensaje de contacto
router.post('/', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = contactSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { nombre, email, telefono, asunto, mensaje } = value;

  // Insertar mensaje de contacto
  const [result] = await executeQuery(
    'INSERT INTO contactos (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, telefono, asunto, mensaje]
  );

  // Obtener mensaje creado
  const [newContact] = await executeQuery(
    'SELECT * FROM contactos WHERE id = ?',
    [result.insertId]
  );

  // Enviar email de confirmación (opcional)
  if (process.env.EMAIL_HOST) {
    try {
      // Aquí se podría implementar el envío de email de confirmación
      console.log('📧 Email de confirmación enviado para contacto:', newContact.id);
    } catch (emailError) {
      console.error('❌ Error al enviar email de confirmación:', emailError);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
    data: {
      contact: {
        id: newContact.id,
        nombre: newContact.nombre,
        email: newContact.email,
        asunto: newContact.asunto,
        fecha: newContact.created_at
      }
    }
  });
}));

// GET /api/contact - Listar mensajes de contacto (solo admin)
router.get('/', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    leido,
    respondido,
    search = ''
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Construir consulta con filtros
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (leido === 'true') {
    whereClause += ' AND leido = TRUE';
  } else if (leido === 'false') {
    whereClause += ' AND leido = FALSE';
  }

  if (respondido === 'true') {
    whereClause += ' AND respondido = TRUE';
  } else if (respondido === 'false') {
    whereClause += ' AND respondido = FALSE';
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

// GET /api/contact/unread - Obtener mensajes no leídos
router.get('/unread', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contacts = await executeQuery(
    'SELECT * FROM contactos WHERE leido = FALSE ORDER BY created_at DESC'
  );

  res.json({
    success: true,
    data: {
      contacts,
      count: contacts.length
    }
  });
}));

// GET /api/contact/:id - Obtener mensaje por ID
router.get('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  const [contact] = await executeQuery(
    'SELECT * FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  // Marcar como leído si no lo está
  if (!contact.leido) {
    await executeQuery(
      'UPDATE contactos SET leido = TRUE WHERE id = ?',
      [contactId]
    );
    contact.leido = true;
  }

  res.json({
    success: true,
    data: {
      contact
    }
  });
}));

// PUT /api/contact/:id/read - Marcar mensaje como leído
router.put('/:id/read', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre, leido FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  if (contact.leido) {
    throw createError('El mensaje ya está marcado como leído', 400);
  }

  // Marcar como leído
  await executeQuery(
    'UPDATE contactos SET leido = TRUE WHERE id = ?',
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

// PUT /api/contact/:id/response - Responder mensaje
router.put('/:id/response', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const contactId = validateId(req.params.id);

  // Validar datos de entrada
  const { error, value } = responseSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { respuesta } = value;

  // Verificar que el mensaje existe
  const [contact] = await executeQuery(
    'SELECT id, nombre, email, asunto, respondido FROM contactos WHERE id = ?',
    [contactId]
  );

  if (!contact) {
    throw createError('Mensaje no encontrado', 404);
  }

  if (contact.respondido) {
    throw createError('El mensaje ya ha sido respondido', 400);
  }

  // Actualizar mensaje con respuesta
  await executeQuery(
    'UPDATE contactos SET respuesta = ?, respondido = TRUE, fecha_respuesta = CURRENT_TIMESTAMP WHERE id = ?',
    [respuesta, contactId]
  );

  // Enviar email de respuesta (opcional)
  if (process.env.EMAIL_HOST) {
    try {
      // Aquí se podría implementar el envío de email de respuesta
      console.log('📧 Email de respuesta enviado a:', contact.email);
    } catch (emailError) {
      console.error('❌ Error al enviar email de respuesta:', emailError);
    }
  }

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

// DELETE /api/contact/:id - Eliminar mensaje
router.delete('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
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

// GET /api/contact/stats/overview - Estadísticas de contactos
router.get('/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  // Estadísticas generales
  const [stats] = await executeQuery(
    `SELECT 
      COUNT(*) as total_mensajes,
      COUNT(CASE WHEN leido = FALSE THEN 1 END) as no_leidos,
      COUNT(CASE WHEN respondido = TRUE THEN 1 END) as respondidos,
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
      COUNT(CASE WHEN respondido = TRUE THEN 1 END) as respondidos
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

// POST /api/contact/bulk-read - Marcar múltiples mensajes como leídos
router.post('/bulk-read', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { contactIds } = req.body;

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    throw createError('Se requiere un array de IDs de mensajes', 400);
  }

  // Validar que todos los IDs son números
  for (const id of contactIds) {
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      throw createError('IDs inválidos en el array', 400);
    }
  }

  // Marcar como leídos
  const placeholders = contactIds.map(() => '?').join(',');
  const [result] = await executeQuery(
    `UPDATE contactos SET leido = TRUE WHERE id IN (${placeholders})`,
    contactIds
  );

  res.json({
    success: true,
    message: `${result.affectedRows} mensajes marcados como leídos`,
    data: {
      updatedCount: result.affectedRows,
      contactIds
    }
  });
}));

// POST /api/contact/bulk-delete - Eliminar múltiples mensajes
router.post('/bulk-delete', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { contactIds } = req.body;

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    throw createError('Se requiere un array de IDs de mensajes', 400);
  }

  // Validar que todos los IDs son números
  for (const id of contactIds) {
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      throw createError('IDs inválidos en el array', 400);
    }
  }

  // Eliminar mensajes
  const placeholders = contactIds.map(() => '?').join(',');
  const [result] = await executeQuery(
    `DELETE FROM contactos WHERE id IN (${placeholders})`,
    contactIds
  );

  res.json({
    success: true,
    message: `${result.affectedRows} mensajes eliminados`,
    data: {
      deletedCount: result.affectedRows,
      contactIds
    }
  });
}));

module.exports = router;
