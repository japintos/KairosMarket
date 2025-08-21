/**
 * Configuración de base de datos MySQL para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuración de la base de datos optimizada
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kairos_natural_market',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 20,           // Aumentado de 10 a 20
  queueLimit: 5,                 // Limitado para evitar sobrecarga
  acquireTimeout: 60000,         // 60 segundos para adquirir conexión
  timeout: 60000,                // 60 segundos timeout
  reconnect: true,               // Reconexión automática
  charset: 'utf8mb4',
  ssl: false,
  // Nuevas optimizaciones
  multipleStatements: false,     // Seguridad
  dateStrings: true,             // Optimización de fechas
  supportBigNumbers: true,       // Soporte para números grandes
  bigNumberStrings: true,        // Números grandes como strings
  // Configuración de pool avanzada
  enableKeepAlive: true,         // Mantener conexiones vivas
  keepAliveInitialDelay: 0,      // Inicio inmediato del keep-alive
};

// Crear pool de conexiones optimizado
const pool = mysql.createPool(dbConfig);

// Monitoreo del pool para optimización
pool.on('connection', (connection) => {
  console.log('🔗 Nueva conexión establecida');
});

pool.on('acquire', (connection) => {
  console.log('📥 Conexión adquirida del pool');
});

pool.on('release', (connection) => {
  console.log('📤 Conexión liberada al pool');
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Error en consulta SQL:', error.message);
    console.error('📝 Query:', query);
    console.error('🔢 Parámetros:', params);
    throw error;
  }
};

// Función para ejecutar transacciones
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Función para cerrar el pool
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar pool:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  closePool,
  dbConfig
};
