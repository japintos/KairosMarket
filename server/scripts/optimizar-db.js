/**
 * Script de optimización de base de datos para Kairos Natural Market
 * Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const { executeQuery, testConnection } = require('../database/config');
const fs = require('fs');
const path = require('path');

// Índices optimizados
const optimizaciones = [
  // Índices compuestos para productos
  'CREATE INDEX IF NOT EXISTS idx_productos_busqueda ON productos(activo, destacado, categoria_id)',
  'CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(activo, precio)',
  'CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(activo, nombre)',
  'CREATE INDEX IF NOT EXISTS idx_productos_fecha ON productos(activo, created_at)',
  
  // Índice de texto completo
  'CREATE FULLTEXT INDEX IF NOT EXISTS idx_productos_busqueda_texto ON productos(nombre, descripcion, ingredientes)',
  
  // Índices para pedidos
  'CREATE INDEX IF NOT EXISTS idx_pedidos_completo ON pedidos(estado, created_at, cliente_id)',
  'CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_estado ON pedidos(created_at, estado)',
  'CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_email ON pedidos(cliente_email)',
  
  // Índices para clientes
  'CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)',
  'CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo)',
  'CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre, apellido)',
  
  // Índices para categorías
  'CREATE INDEX IF NOT EXISTS idx_categorias_activo ON categorias(activo)',
  'CREATE INDEX IF NOT EXISTS idx_categorias_orden ON categorias(orden)',
  
  // Índices para detalle de pedidos
  'CREATE INDEX IF NOT EXISTS idx_detalle_pedido_completo ON detalle_pedido(pedido_id, producto_id)',
  
  // Índices para caja
  'CREATE INDEX IF NOT EXISTS idx_caja_fecha_tipo ON caja(fecha, tipo)',
  
  // Índices para contactos
  'CREATE INDEX IF NOT EXISTS idx_contactos_estado ON contactos(estado)',
  'CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos(created_at)',
  
  // Índices para favoritos
  'CREATE INDEX IF NOT EXISTS idx_favoritos_cliente_producto ON favoritos(cliente_id, producto_id)',
  
  // Índices para cupones
  'CREATE INDEX IF NOT EXISTS idx_cupones_codigo_activo ON cupones(codigo, activo)'
];

// Función para ejecutar optimizaciones
const ejecutarOptimizaciones = async () => {
  try {
    console.log('🚀 Iniciando optimización de base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    console.log('📊 Ejecutando optimizaciones...');
    
    // Ejecutar cada optimización
    for (let i = 0; i < optimizaciones.length; i++) {
      const optimizacion = optimizaciones[i];
      const start = Date.now();
      
      try {
        await executeQuery(optimizacion);
        const duration = Date.now() - start;
        console.log(`✅ Optimización ${i + 1}/${optimizaciones.length} completada en ${duration}ms`);
      } catch (error) {
        console.warn(`⚠️ Optimización ${i + 1} falló (puede que ya exista): ${error.message}`);
      }
    }

    // Verificar índices creados
    console.log('\n🔍 Verificando índices creados...');
    
    const tablas = ['productos', 'pedidos', 'clientes', 'categorias'];
    for (const tabla of tablas) {
      try {
        const indices = await executeQuery(`SHOW INDEX FROM ${tabla}`);
        console.log(`📋 Tabla ${tabla}: ${indices.length} índices`);
      } catch (error) {
        console.warn(`⚠️ No se pudo verificar índices de ${tabla}: ${error.message}`);
      }
    }

    // Análisis de performance
    console.log('\n📈 Análisis de performance...');
    
    try {
      const analisis = await executeQuery(`
        SELECT 
          TABLE_NAME,
          TABLE_ROWS,
          DATA_LENGTH,
          INDEX_LENGTH,
          (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'kairos_natural_market'
        ORDER BY TOTAL_SIZE DESC
      `);
      
      console.log('📊 Tamaño de tablas:');
      analisis.forEach(tabla => {
        const sizeMB = (tabla.TOTAL_SIZE / 1024 / 1024).toFixed(2);
        console.log(`   ${tabla.TABLE_NAME}: ${tabla.TABLE_ROWS} filas, ${sizeMB}MB`);
      });
    } catch (error) {
      console.warn(`⚠️ No se pudo analizar performance: ${error.message}`);
    }

    console.log('\n🎉 Optimización completada exitosamente!');
    console.log('📊 Base de datos optimizada para mejor rendimiento');
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error.message);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarOptimizaciones();
}

module.exports = { ejecutarOptimizaciones };
