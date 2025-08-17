/**
 * Script de migración para crear las tablas de Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const { executeQuery, testConnection } = require('./config');

// Definición de las tablas
const tables = [
  // Tabla de categorías
  `CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Tabla de productos
  `CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_por_unidad BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    categoria_id INT,
    imagen VARCHAR(255),
    ingredientes TEXT,
    beneficios TEXT,
    formato_disponible JSON,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
  )`,

  // Tabla de usuarios administrativos
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor') DEFAULT 'vendedor',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Tabla de clientes
  `CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    codigo_postal VARCHAR(10),
    fecha_nacimiento DATE,
    registrado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Tabla de pedidos
  `CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT,
    cliente_nombre VARCHAR(100),
    cliente_email VARCHAR(100),
    cliente_telefono VARCHAR(20),
    cliente_direccion TEXT,
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    estado ENUM('pendiente', 'en_preparacion', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    forma_pago ENUM('mercadopago', 'efectivo', 'transferencia') DEFAULT 'mercadopago',
    id_pago_mercadopago VARCHAR(100),
    observaciones TEXT,
    fecha_entrega DATE,
    hora_entrega TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
  )`,

  // Tabla de detalle de pedidos
  `CREATE TABLE IF NOT EXISTS detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    producto_nombre VARCHAR(200) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    formato VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
  )`,

  // Tabla de caja (transacciones)
  `CREATE TABLE IF NOT EXISTS caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    pedido_id INT,
    usuario_id INT,
    metodo_pago ENUM('efectivo', 'mercadopago', 'transferencia', 'otro'),
    observaciones TEXT,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
  )`,

  // Tabla de contactos (mensajes del formulario)
  `CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,
    estado ENUM('nuevo', 'leido', 'respondido', 'archivado') DEFAULT 'nuevo',
    leido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    respuesta TEXT,
    fecha_respuesta TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de favoritos (para usuarios registrados)
  `CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    producto_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorito (cliente_id, producto_id)
  )`,

  // Tabla de cupones/descuentos
  `CREATE TABLE IF NOT EXISTS cupones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200),
    tipo ENUM('porcentaje', 'monto_fijo') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    monto_minimo DECIMAL(10,2) DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    max_usos INT DEFAULT 1,
    usos_actuales INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Tabla de configuración del sistema
  `CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion VARCHAR(200),
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
];

// Índices para optimizar consultas
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id)',
  'CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo)',
  'CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado)',
  'CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id)',
  'CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado)',
  'CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido ON detalle_pedido(pedido_id)',
  'CREATE INDEX IF NOT EXISTS idx_detalle_pedido_producto ON detalle_pedido(producto_id)',
  'CREATE INDEX IF NOT EXISTS idx_caja_fecha ON caja(fecha)',
  'CREATE INDEX IF NOT EXISTS idx_caja_tipo ON caja(tipo)',
  'CREATE INDEX IF NOT EXISTS idx_contactos_leido ON contactos(leido)',
  'CREATE INDEX IF NOT EXISTS idx_favoritos_cliente ON favoritos(cliente_id)',
  'CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo)',
  'CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo)'
];

// Función principal de migración
const runMigrations = async () => {
  try {
    console.log('🚀 Iniciando migración de base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Crear tablas
    console.log('📋 Creando tablas...');
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      await executeQuery(table);
      console.log(`✅ Tabla ${i + 1}/${tables.length} creada/verificada`);
    }

    // Crear índices
    console.log('🔍 Creando índices...');
    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      await executeQuery(index);
      console.log(`✅ Índice ${i + 1}/${indexes.length} creado/verificado`);
    }

    // Actualizar tablas existentes
    await updateExistingTables();

    // Insertar datos iniciales
    console.log('🌱 Insertando datos iniciales...');
    await insertInitialData();

    console.log('🎉 Migración completada exitosamente!');
    console.log('📊 Base de datos lista para usar');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
};

// Función para actualizar tablas existentes
const updateExistingTables = async () => {
  try {
    console.log('🔄 Actualizando tablas existentes...');
    
    // Verificar si la columna estado existe en contactos
    const [columns] = await executeQuery(
      "SHOW COLUMNS FROM contactos LIKE 'estado'"
    );
    
    if (columns.length === 0) {
      console.log('📝 Agregando columna estado a tabla contactos...');
      await executeQuery(
        'ALTER TABLE contactos ADD COLUMN estado ENUM("nuevo", "leido", "respondido", "archivado") DEFAULT "nuevo" AFTER mensaje'
      );
      
      // Actualizar registros existentes
      await executeQuery(
        'UPDATE contactos SET estado = CASE WHEN leido = TRUE THEN "leido" WHEN respondido = TRUE THEN "respondido" ELSE "nuevo" END'
      );
      
      console.log('✅ Columna estado agregada y datos actualizados');
    } else {
      console.log('✅ Columna estado ya existe en contactos');
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar tablas existentes:', error.message);
    throw error;
  }
};

// Función para insertar datos iniciales
const insertInitialData = async () => {
  try {
    // Insertar categorías
    const categorias = [
      { nombre: 'Hierbas medicinales', descripcion: 'Hierbas naturales con propiedades medicinales', orden: 1 },
      { nombre: 'Especias', descripcion: 'Especias naturales para condimentar', orden: 2 },
      { nombre: 'Frutos secos', descripcion: 'Frutos secos naturales y orgánicos', orden: 3 },
      { nombre: 'Mix de frutos secos', descripcion: 'Mezclas especiales de frutos secos', orden: 4 },
      { nombre: 'Frutos abrillantados', descripcion: 'Frutos secos con cobertura natural', orden: 5 },
      { nombre: 'Hierbas para infusiones', descripcion: 'Hierbas para mate y té', orden: 6 },
      { nombre: 'Accesorios', descripcion: 'Bombillas, mates, termos y accesorios', orden: 7 }
    ];

    for (const categoria of categorias) {
      await executeQuery(
        'INSERT IGNORE INTO categorias (nombre, descripcion, orden) VALUES (?, ?, ?)',
        [categoria.nombre, categoria.descripcion, categoria.orden]
      );
    }

    // Insertar usuario administrador por defecto
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await executeQuery(
      'INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@kairosnatural.com', passwordHash, 'admin']
    );

    // Insertar configuración inicial
    const configuraciones = [
      { clave: 'nombre_tienda', valor: 'Kairos Natural Market', descripcion: 'Nombre de la tienda', tipo: 'string' },
      { clave: 'email_contacto', valor: 'info@kairosnatural.com', descripcion: 'Email de contacto', tipo: 'string' },
      { clave: 'telefono_contacto', valor: '+54 9 11 1234-5678', descripcion: 'Teléfono de contacto', tipo: 'string' },
      { clave: 'direccion_tienda', valor: 'Av. Principal 123, Ciudad', descripcion: 'Dirección de la tienda', tipo: 'string' },
      { clave: 'horarios_atencion', valor: 'Lunes a Viernes 9:00-18:00', descripcion: 'Horarios de atención', tipo: 'string' },
      { clave: 'costo_envio_base', valor: '500', descripcion: 'Costo base de envío', tipo: 'number' },
      { clave: 'monto_gratis_envio', valor: '5000', descripcion: 'Monto mínimo para envío gratis', tipo: 'number' }
    ];

    for (const config of configuraciones) {
      await executeQuery(
        'INSERT IGNORE INTO configuracion (clave, valor, descripcion, tipo) VALUES (?, ?, ?, ?)',
        [config.clave, config.valor, config.descripcion, config.tipo]
      );
    }

    console.log('✅ Datos iniciales insertados correctamente');
    
  } catch (error) {
    console.error('❌ Error al insertar datos iniciales:', error.message);
    throw error;
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  runMigrations().then(() => {
    console.log('🏁 Proceso de migración finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };
