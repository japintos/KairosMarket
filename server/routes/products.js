/**
 * Rutas de productos para Kairos Natural Market
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
const { asyncHandler, createError, validateId, validatePrice } = require('../middleware/errorHandler');

const router = express.Router();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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
const productSchema = Joi.object({
  nombre: Joi.string().min(2).max(200).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 200 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(1000).optional().messages({
    'string.max': 'La descripción no puede exceder 1000 caracteres'
  }),
  precio: Joi.number().positive().required().messages({
    'number.positive': 'El precio debe ser positivo',
    'any.required': 'El precio es requerido'
  }),
  precio_por_unidad: Joi.boolean().default(false),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.integer': 'El stock debe ser un número entero',
    'number.min': 'El stock no puede ser negativo'
  }),
  stock_minimo: Joi.number().integer().min(0).default(5).messages({
    'number.integer': 'El stock mínimo debe ser un número entero',
    'number.min': 'El stock mínimo no puede ser negativo'
  }),
  categoria_id: Joi.number().integer().positive().optional().messages({
    'number.integer': 'El ID de categoría debe ser un número entero',
    'number.positive': 'El ID de categoría debe ser positivo'
  }),
  ingredientes: Joi.string().max(500).optional().messages({
    'string.max': 'Los ingredientes no pueden exceder 500 caracteres'
  }),
  beneficios: Joi.string().max(500).optional().messages({
    'string.max': 'Los beneficios no pueden exceder 500 caracteres'
  }),
  formato_disponible: Joi.array().items(Joi.string()).optional(),
  destacado: Joi.boolean().default(false)
});

// GET /api/products - Listar productos con filtros
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    categoria_id,
    search = '',
    min_price,
    max_price,
    destacado,
    orden = 'nombre',
    direccion = 'ASC'
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Construir consulta con filtros
  let whereClause = 'WHERE p.activo = TRUE';
  const queryParams = [];

  if (categoria_id) {
    whereClause += ' AND p.categoria_id = ?';
    queryParams.push(parseInt(categoria_id));
  }

  if (search) {
    whereClause += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.ingredientes LIKE ?)';
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  if (min_price) {
    whereClause += ' AND p.precio >= ?';
    queryParams.push(parseFloat(min_price));
  }

  if (max_price) {
    whereClause += ' AND p.precio <= ?';
    queryParams.push(parseFloat(max_price));
  }

  if (destacado === 'true') {
    whereClause += ' AND p.destacado = TRUE';
  }

  // Validar orden
  const allowedOrders = ['nombre', 'precio', 'created_at', 'stock'];
  const allowedDirections = ['ASC', 'DESC'];
  const orderBy = allowedOrders.includes(orden) ? orden : 'nombre';
  const orderDirection = allowedDirections.includes(direccion.toUpperCase()) ? direccion.toUpperCase() : 'ASC';

  // Obtener productos con SQL_CALC_FOUND_ROWS (optimización)
  const products = await executeQuery(
    `SELECT SQL_CALC_FOUND_ROWS p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     ${whereClause} 
     ORDER BY p.${orderBy} ${orderDirection} 
     LIMIT ? OFFSET ?`,
    [...queryParams, limitNum, offset]
  );

  // Obtener total usando FOUND_ROWS() (más eficiente)
  const [countResult] = await executeQuery('SELECT FOUND_ROWS() as total');
  const total = countResult.total;
  const totalPages = Math.ceil(total / limitNum);

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

// GET /api/products/featured - Productos destacados
router.get('/featured', asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  const limitNum = parseInt(limit);

  const products = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE AND p.destacado = TRUE 
     ORDER BY p.created_at DESC 
     LIMIT ?`,
    [limitNum]
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
      products
    }
  });
}));

// GET /api/products/low-stock - Productos con stock bajo
router.get('/low-stock', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const products = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.activo = TRUE AND p.stock <= p.stock_minimo 
     ORDER BY p.stock ASC`
  );

  res.json({
    success: true,
    data: {
      products,
      count: products.length
    }
  });
}));

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', asyncHandler(async (req, res) => {
  const productId = validateId(req.params.id);

  const [product] = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.id = ? AND p.activo = TRUE`,
    [productId]
  );

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  // Procesar formato_disponible JSON
  if (product.formato_disponible) {
    try {
      product.formato_disponible = JSON.parse(product.formato_disponible);
    } catch (e) {
      product.formato_disponible = [];
    }
  } else {
    product.formato_disponible = [];
  }

  res.json({
    success: true,
    data: {
      product
    }
  });
}));

// POST /api/products - Crear nuevo producto
router.post('/', authMiddleware, sellerMiddleware, upload.single('imagen'), asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const {
    nombre,
    descripcion,
    precio,
    precio_por_unidad,
    stock,
    stock_minimo,
    categoria_id,
    ingredientes,
    beneficios,
    formato_disponible,
    destacado
  } = value;

  // Verificar que la categoría existe si se proporciona
  if (categoria_id) {
    const [categoria] = await executeQuery(
      'SELECT id FROM categorias WHERE id = ? AND activo = TRUE',
      [categoria_id]
    );

    if (!categoria) {
      throw createError('Categoría no encontrada', 400);
    }
  }

  // Procesar imagen si se subió
  let imagen = null;
  if (req.file) {
    imagen = `/uploads/products/${req.file.filename}`;
  }

  // Procesar formato_disponible
  const formatoDisponibleJson = formato_disponible ? JSON.stringify(formato_disponible) : null;

  // Insertar producto
  const [result] = await executeQuery(
    `INSERT INTO productos (
      nombre, descripcion, precio, precio_por_unidad, stock, stock_minimo,
      categoria_id, imagen, ingredientes, beneficios, formato_disponible, destacado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre, descripcion, precio, precio_por_unidad, stock, stock_minimo,
      categoria_id, imagen, ingredientes, beneficios, formatoDisponibleJson, destacado
    ]
  );

  // Obtener producto creado
  const [newProduct] = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.id = ?`,
    [result.insertId]
  );

  // Procesar formato_disponible JSON
  if (newProduct.formato_disponible) {
    try {
      newProduct.formato_disponible = JSON.parse(newProduct.formato_disponible);
    } catch (e) {
      newProduct.formato_disponible = [];
    }
  } else {
    newProduct.formato_disponible = [];
  }

  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: {
      product: newProduct
    }
  });
}));

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authMiddleware, sellerMiddleware, upload.single('imagen'), asyncHandler(async (req, res) => {
  const productId = validateId(req.params.id);

  // Verificar que el producto existe
  const [existingProduct] = await executeQuery(
    'SELECT id, imagen FROM productos WHERE id = ?',
    [productId]
  );

  if (!existingProduct) {
    throw createError('Producto no encontrado', 404);
  }

  // Validar datos de entrada
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw createError('Datos de entrada inválidos', 400, error.details);
  }

  const {
    nombre,
    descripcion,
    precio,
    precio_por_unidad,
    stock,
    stock_minimo,
    categoria_id,
    ingredientes,
    beneficios,
    formato_disponible,
    destacado
  } = value;

  // Verificar que la categoría existe si se proporciona
  if (categoria_id) {
    const [categoria] = await executeQuery(
      'SELECT id FROM categorias WHERE id = ? AND activo = TRUE',
      [categoria_id]
    );

    if (!categoria) {
      throw createError('Categoría no encontrada', 400);
    }
  }

  // Procesar imagen si se subió
  let imagen = existingProduct.imagen;
  if (req.file) {
    // Eliminar imagen anterior si existe
    if (existingProduct.imagen) {
      const oldImagePath = path.join(__dirname, '..', existingProduct.imagen);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    imagen = `/uploads/products/${req.file.filename}`;
  }

  // Procesar formato_disponible
  const formatoDisponibleJson = formato_disponible ? JSON.stringify(formato_disponible) : null;

  // Actualizar producto
  await executeQuery(
    `UPDATE productos SET 
      nombre = ?, descripcion = ?, precio = ?, precio_por_unidad = ?, 
      stock = ?, stock_minimo = ?, categoria_id = ?, imagen = ?, 
      ingredientes = ?, beneficios = ?, formato_disponible = ?, destacado = ?
     WHERE id = ?`,
    [
      nombre, descripcion, precio, precio_por_unidad, stock, stock_minimo,
      categoria_id, imagen, ingredientes, beneficios, formatoDisponibleJson, destacado, productId
    ]
  );

  // Obtener producto actualizado
  const [updatedProduct] = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     WHERE p.id = ?`,
    [productId]
  );

  // Procesar formato_disponible JSON
  if (updatedProduct.formato_disponible) {
    try {
      updatedProduct.formato_disponible = JSON.parse(updatedProduct.formato_disponible);
    } catch (e) {
      updatedProduct.formato_disponible = [];
    }
  } else {
    updatedProduct.formato_disponible = [];
  }

  res.json({
    success: true,
    message: 'Producto actualizado exitosamente',
    data: {
      product: updatedProduct
    }
  });
}));

// DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete('/:id', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const productId = validateId(req.params.id);

  // Verificar que el producto existe
  const [product] = await executeQuery(
    'SELECT id, nombre, imagen FROM productos WHERE id = ?',
    [productId]
  );

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  // Soft delete - marcar como inactivo
  await executeQuery(
    'UPDATE productos SET activo = FALSE WHERE id = ?',
    [productId]
  );

  res.json({
    success: true,
    message: 'Producto eliminado exitosamente',
    data: {
      productId,
      nombre: product.nombre
    }
  });
}));

// PUT /api/products/:id/stock - Actualizar stock
router.put('/:id/stock', authMiddleware, sellerMiddleware, asyncHandler(async (req, res) => {
  const productId = validateId(req.params.id);
  const { stock } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    throw createError('El stock debe ser un número no negativo', 400);
  }

  // Verificar que el producto existe
  const [product] = await executeQuery(
    'SELECT id, nombre, stock FROM productos WHERE id = ?',
    [productId]
  );

  if (!product) {
    throw createError('Producto no encontrado', 404);
  }

  // Actualizar stock
  await executeQuery(
    'UPDATE productos SET stock = ? WHERE id = ?',
    [stock, productId]
  );

  res.json({
    success: true,
    message: 'Stock actualizado exitosamente',
    data: {
      productId,
      nombre: product.nombre,
      stockAnterior: product.stock,
      stockNuevo: stock
    }
  });
}));

// GET /api/products/search - Búsqueda avanzada
router.get('/search/advanced', asyncHandler(async (req, res) => {
  const {
    q = '',
    categoria_id,
    min_price,
    max_price,
    in_stock = false,
    destacado,
    limit = 20
  } = req.query;

  const limitNum = parseInt(limit);

  // Construir consulta de búsqueda
  let whereClause = 'WHERE p.activo = TRUE';
  const queryParams = [];

  if (q) {
    whereClause += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.ingredientes LIKE ? OR p.beneficios LIKE ?)';
    const searchTerm = `%${q}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (categoria_id) {
    whereClause += ' AND p.categoria_id = ?';
    queryParams.push(parseInt(categoria_id));
  }

  if (min_price) {
    whereClause += ' AND p.precio >= ?';
    queryParams.push(parseFloat(min_price));
  }

  if (max_price) {
    whereClause += ' AND p.precio <= ?';
    queryParams.push(parseFloat(max_price));
  }

  if (in_stock === 'true') {
    whereClause += ' AND p.stock > 0';
  }

  if (destacado === 'true') {
    whereClause += ' AND p.destacado = TRUE';
  }

  // Obtener productos
  const products = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     ${whereClause} 
     ORDER BY p.nombre ASC 
     LIMIT ?`,
    [...queryParams, limitNum]
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
      products,
      count: products.length,
      searchTerm: q
    }
  });
}));

module.exports = router;
