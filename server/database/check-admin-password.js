const { executeQuery } = require('./config');
const bcrypt = require('bcryptjs');

const checkAdminPassword = async () => {
  try {
    console.log('🔍 Verificando contraseña del admin en la base de datos...');
    
    // Obtener usuario admin
    const [adminUser] = await executeQuery(
      'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
      ['admin@kairosnatural.com']
    );
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Nombre: ${adminUser.nombre}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Rol: ${adminUser.rol}`);
    console.log(`   Activo: ${adminUser.activo}`);
    console.log(`   Hash almacenado: ${adminUser.password}`);
    console.log(`   Longitud del hash: ${adminUser.password.length}`);
    
    // Probar diferentes contraseñas
    const testPasswords = ['admin123', 'admin', '123456', 'password'];
    
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`   Prueba con "${testPassword}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
    }
    
    // Generar un nuevo hash para comparar
    const newHash = await bcrypt.hash('admin123', 10);
    console.log(`   Nuevo hash para 'admin123': ${newHash}`);
    console.log(`   Longitud del nuevo hash: ${newHash.length}`);
    
    // Verificar si el hash actual coincide con el nuevo
    const currentIsValid = await bcrypt.compare('admin123', adminUser.password);
    const newIsValid = await bcrypt.compare('admin123', newHash);
    
    console.log(`   Hash actual válido: ${currentIsValid}`);
    console.log(`   Hash nuevo válido: ${newIsValid}`);
    
  } catch (error) {
    console.error('❌ Error al verificar contraseña:', error.message);
    throw error;
  }
};

if (require.main === module) {
  checkAdminPassword().then(() => {
    console.log('🏁 Verificación completada');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { checkAdminPassword };
