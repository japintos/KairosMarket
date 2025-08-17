/**
 * Script para verificar y corregir el usuario admin
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const { executeQuery } = require('./config');
const bcrypt = require('bcryptjs');

const fixAdminUser = async () => {
  try {
    console.log('🔍 Verificando usuario admin...');
    
    // Verificar si el usuario admin existe
    const [adminUser] = await executeQuery(
      'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
      ['admin@kairosnatural.com']
    );
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado. Creando...');
      
      // Crear usuario admin
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await executeQuery(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', 'admin@kairosnatural.com', passwordHash, 'admin', 1]
      );
      
      console.log('✅ Usuario admin creado exitosamente');
    } else {
      console.log('✅ Usuario admin encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Nombre: ${adminUser.nombre}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rol: ${adminUser.rol}`);
      console.log(`   Activo: ${adminUser.activo}`);
      
      // Verificar si la contraseña es correcta
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   Contraseña válida: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log('🔄 Actualizando contraseña del admin...');
        const newPasswordHash = await bcrypt.hash('admin123', 10);
        
        await executeQuery(
          'UPDATE usuarios SET password = ?, activo = ? WHERE id = ?',
          [newPasswordHash, 1, adminUser.id]
        );
        
        console.log('✅ Contraseña actualizada exitosamente');
      }
    }
    
    // Verificar que el usuario esté activo
    await executeQuery(
      'UPDATE usuarios SET activo = ? WHERE email = ?',
      [1, 'admin@kairosnatural.com']
    );
    
    console.log('✅ Usuario admin verificado y corregido');
    console.log('📋 Credenciales:');
    console.log('   Email: admin@kairosnatural.com');
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error al verificar usuario admin:', error.message);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAdminUser().then(() => {
    console.log('🏁 Script de verificación finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { fixAdminUser };
