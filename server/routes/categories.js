/**
 * Rutas de categorías para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const { executeQuery } = require('../database/config');
const { authMiddleware, sellerMiddleware } = require('../middleware/auth');
const { asyncHandler, createError, validateId } = require('../middleware/errorHandler');

const router = express.Router();

// Configuración de multer para subida de imágenes de categorías
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/categories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

// Esquemas de validación
const categorySchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(500).optional().messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  orden: Joi.number().integer().min(0).default(0).messages({
    'number.integer': 'El orden debe ser un número entero',
    'number.min': 'El orden no puede ser negativo'
  })
});

// GET /api/categories - Listar todas las categorías
router.get('/', asyncHandler(async (req, res) => {
  const { activo = 'true' } = req.query;

  let whereClause = '';
  const queryParams = [];

  if (activo === 'true') {
    whereClause = 'WHERE activo = TRUE';
  } else if (activo === 'false') {
    whereClause = 'WHERE activo = FALSE';
  }

  const categories = await executeQuery(
    `SELECT c.*, 
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.activo = TRUE THEN 1 END) as productos_activos
     FROM categorias c 
     LEFT JOIN productos p ON c.id = p.categoria_id 
     ${whereClause} 
     GROUP BY c.id 
     ORDER BY c.orden ASC, c.nombre ASC`,
    queryParams
  );

  res.json({
    success: true,
    data: {
      categories
    }
  });
}));

// GET /api/categories/active - Listar solo categorías activas
router.get('/active', asyncHandler(async (req, res) => {
  const categories = await executeQuery(
    `SELECT c.*, 
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.activo = TRUE THEN 1 END) as productos_activos
     FROM categorias c 
     LEFT JOIN productos p ON c.id = p.categoria_id 
     WHERE c.activo = TRUE 
     GROUP BY c.id 
     ORDER BY c.orden ASC, c.nombre ASC`
  );

  res.json({
    success: true,
    data: {
      categories
    }
  });
}));

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', asyncHandler(async (req, res) => {
  const categoryId = validateId(req.params.id);

  const [category] = await executeQuery(
    `SELECT c.*, 
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.activo = TRUE THEN 1 END) as productos_activos
     FROM categorias c 
     LEFT JOIN productos p ON c.id = p.categoria_id 
     WHERE c.id = ? 
     GROUP BY c.id`,
    [categoryId]
  );

  if (!category) {
    throw createError('Categoría no encontrada', 404);
  }

  res.json({
    success: true,
    data: {
      category
    }
  });
}));

// GET /api/categories/:id/products - Obtener productos de una categoría
router.get('/:id/products', asyncHandler(async (req, res) => {
  const categoryId = validateId(req.params.id);
  const {
    page = 1,
    limit = 12,
    orden = 'nombre',
    direccion = 'ASC'
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Verificar que la categoría existe
  const [category] = await executeQuery(
    'SELECT id, nombre FROM categorias WHERE id = ? AND activo = TRUE',
    [categoryId]
  );

  if (!category) {
    throw createError('Categoría no encontrada', 404);
  }

  // Validar orden
  const allowedOrders = ['nombre', 'precio', 'created_at', 'stock'];
  const allowedDirections = ['ASC', 'DESC'];
  const orderBy = allowedOrders.includes(orden) ? orden : 'nombre';
  const orderDirection = allowedDirections.includes(direccion.toUpperCase()) ? direccion.toUpperCase() : 'ASC';

  // Obtener total de productos en la categoría
  const [countResult] = await executeQuery(
    'SELECT COUNT(*) as total FROM productos WHERE categoria_id = ? AND activo = TRUE',
    [categoryId]
  );

  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

  // Obtener productos de la categoría
  const products = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.categoria_id = ? AND p.activo = TRUE 
     ORDER BY p.${orderBy} ${orderDirection} 
     LIMIT ? OFFSET ?`,
    [categoryId, limitNum, offset]
  );

  // Procesar formato_disponible JSON
  products.forEach(product => {
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
      category,
      products,
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

// POST /api/categories - Crear nueva categoría
router.post('/', authMiddleware, sellerMiddleware, upload.single('imagen'), asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = categorySchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { nombre, descripcion, orden } = value;

  // Verificar que el nombre no existe
  const [existingCategory] = await executeQuery(
    'SELECT id FROM categorias WHERE nombre = ?',
    [nombre]
  );

  if (existingCategory) {
    throw createError('Ya existe una categoría con ese nombre', 400);
  }

  // Procesar imagen si se subió
  let imagen = null;
  if (req.file) {
    imagen = `/uploads/categories/${req.file.filename}`;
  }

  // Insertar categoría
  const [result] = await executeQuery(
    'INSERT INTO categorias (nombre, descripcion, imagen, orden) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, imagen, orden]
  );

  // Obtener categoría creada
  const [newCategory] = await executeQuery(
    'SELECT * FROM categorias WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Categoría creada exitosamente',
    data: {
      category: newCategory
    }
  });
}));

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', authMiddleware, sellerMiddleware, upload.single('imagen'), asyncHandler(async (req, res) => {
  const categoryId = validateId(req.params.id);

  // Verificar que la categoría existe
  const [existingCategory] = await executeQuery(
    'SELECT id, nombre, imagen FROM categorias WHERE id = ?',
    [categoryId]
  );

  if (!existingCategory) {
    throw createError('Categoría no encontrada', 404);
  }

  // Validar datos de entrada
  const { error, value } = categorySchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const { nombre, descripcion, orden } = value;

  // Verificar que el nombre no existe en otra categoría
  if (nombre !== existingCategory.nombre) {
    const [duplicateCategory] = await executeQuery(
      'SELECT id FROM categorias WHERE nombre = ? AND id != ?',
      [nombre, categoryId]
    );

    if (duplicateCategory) {
      throw createError('Ya existe una categoría con ese nombre', 400);
    }
  }

  // Procesar imagen si se subió
  let imagen = existingCategory.imagen;
  if (req.file) {
    // Eliminar imagen anterior si existe
    if (existingCategory.imagen) {
      const oldImagePath = path.join(__dirname, '..', existingCategory.imagen);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    imagen = `/uploads/categories/${req.file.filename}`;
  }

  // Actualizar categoría
  await executeQuery(
    'UPDATE categorias SET nombre = ?, descripcion = ?, imagen = ?, orden = ? WHERE id = ?',
    [nombre, descripcion, imagen, orden, categoryId]
  );

  // Obtener categoría actualizada
  const [updatedCategory] = await executeQuery(
    'SELECT * FROM categorias WHERE id = ?',
    [categoryId]
  );

  res.json({
    success: true,
    message: 'Categoría actualizada exitosamente',
    data: {
      category: updatedCategory
    }
  });
}));

// DELETE /api/categories/:id - Eliminar categoría (soft delete)
router.delete('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const categoryId = validateId(req.params.id);

  // Verificar que la categoría existe
  const [category] = await executeQuery(
    'SELECT id, nombre, imagen FROM categorias WHERE id = ?',
    [categoryId]
  );

  if (!category) {
    throw createError('Categoría no encontrada', 404);
  }

  // Verificar si tiene productos asociados
  const [productsCount] = await executeQuery(
    'SELECT COUNT(*) as total FROM productos WHERE categoria_id = ? AND activo = TRUE',
    [categoryId]
  );

  if (productsCount.total > 0) {
    throw createError(`No se puede eliminar la categoría porque tiene ${productsCount.total} productos asociados`, 400);
  }

  // Soft delete - marcar como inactiva
  await executeQuery(
    'UPDATE categorias SET activo = FALSE WHERE id = ?',
    [categoryId]
  );

  res.json({
    success: true,
    message: 'Categoría eliminada exitosamente',
    data: {
      categoryId,
      nombre: category.nombre
    }
  });
}));

// PUT /api/categories/:id/status - Cambiar estado de categoría
router.put('/:id/status', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const categoryId = validateId(req.params.id);
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    throw createError('El campo activo debe ser un booleano', 400);
  }

  // Verificar que la categoría existe
  const [category] = await executeQuery(
    'SELECT id, nombre FROM categorias WHERE id = ?',
    [categoryId]
  );

  if (!category) {
    throw createError('Categoría no encontrada', 404);
  }

  // Actualizar estado
  await executeQuery(
    'UPDATE categorias SET activo = ? WHERE id = ?',
    [activo, categoryId]
  );

  res.json({
    success: true,
    message: `Categoría ${activo ? 'activada' : 'desactivada'} exitosamente`,
    data: {
      categoryId,
      nombre: category.nombre,
      activo
    }
  });
}));

// PUT /api/categories/reorder - Reordenar categorías
router.put('/reorder', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    throw createError('Se requiere un array de categorías con sus nuevos órdenes', 400);
  }

  // Validar estructura de datos
  for (const item of categories) {
    if (!item.id || typeof item.orden !== 'number') {
      throw createError('Cada categoría debe tener id y orden', 400);
    }
  }

  // Actualizar órdenes en transacción
  const queries = categories.map(item => ({
    query: 'UPDATE categorias SET orden = ? WHERE id = ?',
    params: [item.orden, item.id]
  }));

  await executeQuery('START TRANSACTION');
  
  try {
    for (const { query, params } of queries) {
      await executeQuery(query, params);
    }
    
    await executeQuery('COMMIT');
  } catch (error) {
    await executeQuery('ROLLBACK');
    throw error;
  }

  res.json({
    success: true,
    message: 'Orden de categorías actualizado exitosamente',
    data: {
      updatedCount: categories.length
    }
  });
}));

// GET /api/categories/stats - Estadísticas de categorías
router.get('/stats/overview', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const stats = await executeQuery(
    `SELECT 
      c.id,
      c.nombre,
      c.activo,
      COUNT(p.id) as total_productos,
      COUNT(CASE WHEN p.activo = TRUE THEN 1 END) as productos_activos,
      COUNT(CASE WHEN p.stock <= p.stock_minimo THEN 1 END) as productos_stock_bajo,
      SUM(CASE WHEN p.activo = TRUE THEN p.stock ELSE 0 END) as stock_total,
      AVG(CASE WHEN p.activo = TRUE THEN p.precio ELSE NULL END) as precio_promedio
     FROM categorias c 
     LEFT JOIN productos p ON c.id = p.categoria_id 
     GROUP BY c.id 
     ORDER BY c.orden ASC, c.nombre ASC`
  );

  // Calcular totales
  const totals = {
    total_categorias: stats.length,
    categorias_activas: stats.filter(c => c.activo).length,
    total_productos: stats.reduce((sum, c) => sum + c.total_productos, 0),
    productos_activos: stats.reduce((sum, c) => sum + c.productos_activos, 0),
    productos_stock_bajo: stats.reduce((sum, c) => sum + c.productos_stock_bajo, 0),
    stock_total: stats.reduce((sum, c) => sum + (c.stock_total || 0), 0)
  };

  res.json({
    success: true,
    data: {
      stats,
      totals
    }
  });
}));

module.exports = router;
