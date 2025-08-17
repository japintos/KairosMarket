/**
 * Script para crear la base de datos Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const mariadb = require('mariadb');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Buscando archivo .env en:', envPath);
require('dotenv').config({ path: envPath });

// Configuración específica para MariaDB
const mariadbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  port: 3306,
  ssl: false
};

const createDatabase = async () => {
  try {
    console.log('🚀 Iniciando creación de base de datos...');
    console.log('🔧 Configuración:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ? '***' : 'NO PASSWORD',
      port: process.env.DB_PORT
    });
    
    // Configuración para conectar sin especificar base de datos
    const connection = await mariadb.createConnection(mariadbConfig);

    const dbName = 'kairos_natural_market';
    
    console.log(`📊 Creando base de datos: ${dbName}`);
    
    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ Base de datos ${dbName} creada exitosamente`);
    
    // Verificar que la base de datos existe
    const databases = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbName);
    
    if (dbExists) {
      console.log(`✅ Base de datos ${dbName} verificada correctamente`);
    } else {
      throw new Error(`No se pudo crear la base de datos ${dbName}`);
    }
    
    await connection.end();
    
    console.log('🎉 Proceso de creación de base de datos completado');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecutar: npm run migrate');
    console.log('   2. Ejecutar: npm run seed');
    console.log('   3. Ejecutar: npm run dev');
    
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Solución: Verificar credenciales de MySQL en el archivo .env');
      console.error('   - DB_USER: usuario de MySQL');
      console.error('   - DB_PASSWORD: contraseña de MySQL');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Solución: Verificar que MySQL esté corriendo');
      console.error('   - En Windows: net start mysql');
      console.error('   - En Linux/Mac: sudo systemctl start mysql');
    }
    
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createDatabase().then(() => {
    console.log('🏁 Script de creación de base de datos finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { createDatabase };
