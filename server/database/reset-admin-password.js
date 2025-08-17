const { executeQuery } = require('./config');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
  try {
    console.log('🔧 Reseteando contraseña del admin...');
    
    // Generar nuevo hash para 'admin123'
    const newPassword = 'admin123';
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔐 Nuevo hash generado para:', newPassword);
    console.log('📏 Longitud del hash:', newPasswordHash.length);
    
    // Actualizar la contraseña del admin
    await executeQuery(
      'UPDATE usuarios SET password = ?, activo = ? WHERE email = ?',
      [newPasswordHash, 1, 'admin@kairosnatural.com']
    );
    
    console.log('✅ Contraseña del admin actualizada exitosamente');
    
    // Verificar que se actualizó correctamente
    const [adminUser] = await executeQuery(
      'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
      ['admin@kairosnatural.com']
    );
    
    if (adminUser) {
      console.log('✅ Usuario admin verificado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Nombre: ${adminUser.nombre}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rol: ${adminUser.rol}`);
      console.log(`   Activo: ${adminUser.activo}`);
      console.log(`   Nueva longitud del hash: ${adminUser.password.length}`);
      
      // Verificar que la contraseña funciona
      const isPasswordValid = await bcrypt.compare(newPassword, adminUser.password);
      console.log(`   Contraseña válida: ${isPasswordValid}`);
      
      if (isPasswordValid) {
        console.log('🎉 ¡Contraseña reseteada exitosamente!');
        console.log('📋 Credenciales:');
        console.log('   Email: admin@kairosnatural.com');
        console.log('   Contraseña: admin123');
      } else {
        console.log('❌ Error: La contraseña no es válida después del reset');
      }
    } else {
      console.log('❌ Error: No se pudo verificar el usuario admin');
    }
    
  } catch (error) {
    console.error('❌ Error al resetear contraseña del admin:', error.message);
    throw error;
  }
};

if (require.main === module) {
  resetAdminPassword().then(() => {
    console.log('🏁 Script de reset finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { resetAdminPassword };
