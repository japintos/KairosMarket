/**
 * Script de seed para insertar datos de ejemplo
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

const { executeQuery } = require('./config');

// Datos de productos de ejemplo
const productos = [
  {
    nombre: 'Manzanilla Orgánica',
    descripcion: 'Manzanilla 100% orgánica, perfecta para infusiones relajantes. Ayuda a calmar los nervios y mejorar la digestión.',
    precio: 250.00,
    precio_por_unidad: false,
    stock: 50,
    stock_minimo: 10,
    categoria_id: 1,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Manzanilla orgánica 100%',
    beneficios: 'Relajante, digestivo, antiinflamatorio',
    formato_disponible: JSON.stringify(['50g', '100g', '250g']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Menta Piperita',
    descripcion: 'Menta piperita fresca y aromática, ideal para infusiones digestivas y refrescantes.',
    precio: 280.00,
    precio_por_unidad: false,
    stock: 40,
    stock_minimo: 10,
    categoria_id: 1,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Menta piperita orgánica 100%',
    beneficios: 'Digestivo, refrescante, alivia náuseas',
    formato_disponible: JSON.stringify(['50g', '100g', '250g']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Canela en Rama',
    descripcion: 'Canela en rama de la más alta calidad, perfecta para infusiones y repostería.',
    precio: 320.00,
    precio_por_unidad: false,
    stock: 30,
    stock_minimo: 5,
    categoria_id: 2,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Canela en rama 100% natural',
    beneficios: 'Antioxidante, antiinflamatorio, regula azúcar',
    formato_disponible: JSON.stringify(['100g', '250g', '500g']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Nueces Pecan',
    descripcion: 'Nueces pecan frescas y crujientes, ricas en omega-3 y antioxidantes.',
    precio: 850.00,
    precio_por_unidad: false,
    stock: 25,
    stock_minimo: 5,
    categoria_id: 3,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Nueces pecan 100% naturales',
    beneficios: 'Ricas en omega-3, antioxidantes, proteínas',
    formato_disponible: JSON.stringify(['250g', '500g', '1kg']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Almendras Naturales',
    descripcion: 'Almendras naturales sin procesar, fuente excelente de proteínas y vitamina E.',
    precio: 750.00,
    precio_por_unidad: false,
    stock: 35,
    stock_minimo: 10,
    categoria_id: 3,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Almendras naturales 100%',
    beneficios: 'Proteínas, vitamina E, calcio, magnesio',
    formato_disponible: JSON.stringify(['250g', '500g', '1kg']),
    activo: true,
    destacado: false
  },
  {
    nombre: 'Mix Energético',
    descripcion: 'Mezcla especial de frutos secos y semillas para energía natural y salud.',
    precio: 680.00,
    precio_por_unidad: false,
    stock: 20,
    stock_minimo: 5,
    categoria_id: 4,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Almendras, nueces, pasas, semillas de girasol',
    beneficios: 'Energía natural, proteínas, fibra',
    formato_disponible: JSON.stringify(['250g', '500g']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Yerba Mate Orgánica',
    descripcion: 'Yerba mate orgánica de la mejor calidad, perfecta para el mate tradicional.',
    precio: 420.00,
    precio_por_unidad: false,
    stock: 45,
    stock_minimo: 10,
    categoria_id: 6,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Yerba mate orgánica 100%',
    beneficios: 'Energía natural, antioxidantes, vitaminas',
    formato_disponible: JSON.stringify(['500g', '1kg']),
    activo: true,
    destacado: true
  },
  {
    nombre: 'Bombilla de Alpaca',
    descripcion: 'Bombilla artesanal de alpaca, perfecta para disfrutar el mate tradicional.',
    precio: 1200.00,
    precio_por_unidad: true,
    stock: 15,
    stock_minimo: 3,
    categoria_id: 7,
    imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ingredientes: 'Alpaca 925',
    beneficios: 'Duradera, no se oxida, sabor auténtico',
    formato_disponible: JSON.stringify(['Unidad']),
    activo: true,
    destacado: false
  }
];

// Función para insertar productos
const insertProducts = async () => {
  try {
    console.log('🌱 Insertando productos de ejemplo...');
    
    for (const producto of productos) {
      await executeQuery(`
        INSERT IGNORE INTO productos (
          nombre, descripcion, precio, precio_por_unidad, stock, stock_minimo,
          categoria_id, imagen, ingredientes, beneficios, formato_disponible,
          activo, destacado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        producto.nombre, producto.descripcion, producto.precio, producto.precio_por_unidad,
        producto.stock, producto.stock_minimo, producto.categoria_id, producto.imagen,
        producto.ingredientes, producto.beneficios, producto.formato_disponible,
        producto.activo, producto.destacado
      ]);
    }
    
    console.log(`✅ ${productos.length} productos insertados correctamente`);
    
  } catch (error) {
    console.error('❌ Error al insertar productos:', error.message);
    throw error;
  }
};

// Función principal
const runSeed = async () => {
  try {
    console.log('🚀 Iniciando seed de datos...');
    
    await insertProducts();
    
    console.log('🎉 Seed completado exitosamente!');
    console.log('📊 Base de datos poblada con datos de ejemplo');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeed().then(() => {
    console.log('🏁 Proceso de seed finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { runSeed };
