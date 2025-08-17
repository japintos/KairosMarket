/**
 * Script para insertar datos de ejemplo para el dashboard
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const mariadb = require('mariadb');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kairos_natural_market',
  port: 3306,
  ssl: false
};

async function seedDashboardData() {
  let connection;
  
  try {
    console.log('🌱 Iniciando inserción de datos de ejemplo para el dashboard...');
    
    // Conectar a la base de datos
    connection = await mariadb.createConnection(dbConfig);
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si ya existen datos
    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM productos');
    const [existingCustomers] = await connection.query('SELECT COUNT(*) as count FROM clientes');
    
    if (existingProducts.count > 0 && existingCustomers.count > 0) {
      console.log('✅ Ya existen datos en la base de datos');
      return;
    }

    // Insertar productos de ejemplo
    const products = [
      {
        nombre: 'Chanel N°5',
        descripcion: 'Perfume clásico de Chanel',
        precio: 200,
        stock: 50,
        stock_minimo: 10,
        categoria_id: 1,
        destacado: true,
        activo: true
      },
      {
        nombre: 'Dior Sauvage',
        descripcion: 'Perfume masculino de Dior',
        precio: 180,
        stock: 40,
        stock_minimo: 8,
        categoria_id: 1,
        destacado: true,
        activo: true
      },
      {
        nombre: 'Versace Eros',
        descripcion: 'Perfume masculino de Versace',
        precio: 150,
        stock: 35,
        stock_minimo: 7,
        categoria_id: 1,
        destacado: true,
        activo: true
      },
      {
        nombre: 'Paco Rabanne 1 Million',
        descripcion: 'Perfume masculino de Paco Rabanne',
        precio: 120,
        stock: 30,
        stock_minimo: 6,
        categoria_id: 1,
        destacado: true,
        activo: true
      }
    ];

    console.log('📦 Insertando productos...');
    for (const product of products) {
      await connection.query(
        `INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, destacado, activo, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [product.nombre, product.descripcion, product.precio, product.stock, product.stock_minimo, product.categoria_id, product.destacado, product.activo]
      );
    }
    console.log('✅ Productos insertados correctamente');

    // Insertar clientes de ejemplo
    const customers = [
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria@example.com',
        telefono: '123456789',
        direccion: 'Calle Principal 123',
        activo: true
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos@example.com',
        telefono: '987654321',
        direccion: 'Avenida Central 456',
        activo: true
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana@example.com',
        telefono: '555666777',
        direccion: 'Plaza Mayor 789',
        activo: true
      }
    ];

    console.log('👥 Insertando clientes...');
    for (const customer of customers) {
      await connection.query(
        `INSERT INTO clientes (nombre, apellido, email, telefono, direccion, activo, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [customer.nombre, customer.apellido, customer.email, customer.telefono, customer.direccion, customer.activo]
      );
    }
    console.log('✅ Clientes insertados correctamente');

    // Insertar mensajes de contacto de ejemplo
    const messages = [
      {
        nombre: 'Sofía López',
        email: 'sofia@example.com',
        asunto: 'Consulta sobre productos orgánicos',
        mensaje: 'Hola, me gustaría saber más sobre sus productos orgánicos.',
        leido: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        nombre: 'Luis Fernández',
        email: 'luis@example.com',
        asunto: 'Problema con mi pedido',
        mensaje: 'Tengo un problema con mi pedido #12345.',
        leido: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
      },
      {
        nombre: 'Roberto Silva',
        email: 'roberto@example.com',
        asunto: 'Información sobre envíos',
        mensaje: '¿Cuánto tiempo tardan los envíos?',
        leido: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
      }
    ];

    console.log('💬 Insertando mensajes...');
    for (const message of messages) {
      await connection.query(
        `INSERT INTO contactos (nombre, email, asunto, mensaje, leido, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [message.nombre, message.email, message.asunto, message.mensaje, message.leido, message.created_at]
      );
    }
    console.log('✅ Mensajes insertados correctamente');

    console.log('✅ Datos de ejemplo insertados correctamente');
    console.log('📊 Dashboard ahora mostrará datos reales');

  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el script
seedDashboardData();
