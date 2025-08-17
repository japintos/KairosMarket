const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔧 Prueba de variables de entorno:');
console.log('   Ruta del archivo .env:', path.join(__dirname, '.env'));
console.log('   JWT_SECRET:', process.env.JWT_SECRET);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   PORT:', process.env.PORT);
console.log('   CORS_ORIGIN:', process.env.CORS_ORIGIN);

if (!process.env.JWT_SECRET) {
  console.log('❌ JWT_SECRET no está configurado');
} else {
  console.log('✅ JWT_SECRET configurado correctamente');
}
