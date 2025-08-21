# 🚀 OPTIMIZACIÓN DE BASE DE DATOS - KAIROS NATURAL MARKET

## 📊 **ANÁLISIS ACTUAL**

### **Configuración Actual:**
- **Base de datos**: MySQL con mysql2/promise
- **Pool de conexiones**: 10 conexiones máximas
- **Índices básicos**: Implementados en migrate.js
- **Sin caché**: No hay sistema de caché implementado
- **Compresión**: Habilitada en Express

---

## 🎯 **ESTRATEGIAS DE OPTIMIZACIÓN**

### **1. OPTIMIZACIÓN DE CONEXIONES Y POOL**

#### **Configuración Actual (server/database/config.js):**
```javascript
const dbConfig = {
  connectionLimit: 10,
  queueLimit: 0,
  // ...
};
```

#### **Optimización Recomendada:**
```javascript
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
```

### **2. ÍNDICES AVANZADOS**

#### **Índices Actuales (Básicos):**
```sql
-- Ya implementados en migrate.js
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_destacado ON productos(destacado);
```

#### **Índices Optimizados Recomendados:**
```sql
-- Índices compuestos para consultas complejas
CREATE INDEX idx_productos_busqueda ON productos(activo, destacado, categoria_id);
CREATE INDEX idx_productos_precio ON productos(activo, precio);
CREATE INDEX idx_productos_nombre ON productos(activo, nombre);
CREATE INDEX idx_productos_fecha ON productos(activo, created_at);

-- Índices para búsqueda de texto
CREATE FULLTEXT INDEX idx_productos_busqueda_texto ON productos(nombre, descripcion, ingredientes);

-- Índices para pedidos
CREATE INDEX idx_pedidos_completo ON pedidos(estado, created_at, cliente_id);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(created_at, estado);

-- Índices para clientes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_activo ON clientes(activo);
```

### **3. IMPLEMENTACIÓN DE CACHÉ**

#### **Opción A: Redis (Recomendado)**
```bash
# Instalar Redis
npm install redis
```

#### **Configuración Redis:**
```javascript
// server/database/cache.js
const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis conectado'));

module.exports = client;
```

#### **Middleware de Caché:**
```javascript
// server/middleware/cache.js
const redis = require('../database/cache');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Interceptar la respuesta
      const originalSend = res.json;
      res.json = function(data) {
        redis.setex(key, duration, JSON.stringify(data));
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = { cacheMiddleware };
```

### **4. OPTIMIZACIÓN DE CONSULTAS**

#### **Consulta Actual (Productos):**
```javascript
// Consulta actual - 2 queries separadas
const [countResult] = await executeQuery(
  `SELECT COUNT(*) as total FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ${whereClause}`,
  queryParams
);

const products = await executeQuery(
  `SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ${whereClause} ORDER BY p.${orderBy} ${orderDirection} LIMIT ? OFFSET ?`,
  [...queryParams, limitNum, offset]
);
```

#### **Consulta Optimizada:**
```javascript
// Consulta optimizada - 1 query con SQL_CALC_FOUND_ROWS
const products = await executeQuery(
  `SELECT SQL_CALC_FOUND_ROWS p.*, c.nombre as categoria_nombre 
   FROM productos p 
   LEFT JOIN categorias c ON p.categoria_id = c.id 
   ${whereClause} 
   ORDER BY p.${orderBy} ${orderDirection} 
   LIMIT ? OFFSET ?`,
  [...queryParams, limitNum, offset]
);

const [countResult] = await executeQuery('SELECT FOUND_ROWS() as total');
```

### **5. PAGINACIÓN OPTIMIZADA**

#### **Implementación de Cursor-based Pagination:**
```javascript
// Para listas grandes de productos
router.get('/cursor', asyncHandler(async (req, res) => {
  const { cursor, limit = 12 } = req.query;
  const limitNum = parseInt(limit);
  
  let whereClause = 'WHERE p.activo = TRUE';
  const queryParams = [];
  
  if (cursor) {
    whereClause += ' AND p.id > ?';
    queryParams.push(parseInt(cursor));
  }
  
  const products = await executeQuery(
    `SELECT p.*, c.nombre as categoria_nombre 
     FROM productos p 
     LEFT JOIN categorias c ON p.categoria_id = c.id 
     ${whereClause} 
     ORDER BY p.id ASC 
     LIMIT ?`,
    [...queryParams, limitNum + 1] // +1 para saber si hay más
  );
  
  const hasMore = products.length > limitNum;
  const nextCursor = hasMore ? products[limitNum - 1].id : null;
  
  res.json({
    success: true,
    data: {
      products: products.slice(0, limitNum),
      pagination: {
        hasMore,
        nextCursor,
        limit: limitNum
      }
    }
  });
}));
```

### **6. COMPRESIÓN Y OPTIMIZACIÓN DE RESPUESTAS**

#### **Middleware de Compresión Avanzado:**
```javascript
// server/index.js
const compression = require('compression');

app.use(compression({
  level: 6,                    // Nivel de compresión (0-9)
  threshold: 1024,             // Comprimir respuestas > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### **7. CONSULTAS PREPARADAS Y CONNECTION POOLING**

#### **Optimización de Pool:**
```javascript
// server/database/config.js
const pool = mysql.createPool({
  ...dbConfig,
  // Configuración avanzada del pool
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Monitoreo del pool
  connectionLimit: 20,
  queueLimit: 5,
  // Configuración de consultas
  multipleStatements: false,
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Keep-alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Monitoreo del pool
pool.on('connection', (connection) => {
  console.log('🔗 Nueva conexión establecida');
});

pool.on('acquire', (connection) => {
  console.log('📥 Conexión adquirida del pool');
});

pool.on('release', (connection) => {
  console.log('📤 Conexión liberada al pool');
});
```

### **8. OPTIMIZACIÓN DE IMÁGENES**

#### **Middleware de Optimización:**
```javascript
// server/middleware/imageOptimizer.js
const sharp = require('sharp');
const path = require('path');

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const optimizedBuffer = await sharp(req.file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    
    // Guardar imagen optimizada
    await sharp(optimizedBuffer).toFile(req.file.path);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { optimizeImage };
```

### **9. MONITOREO Y MÉTRICAS**

#### **Middleware de Performance:**
```javascript
// server/middleware/performance.js
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Alertar consultas lentas
    if (duration > 1000) {
      console.warn(`⚠️ Consulta lenta detectada: ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

module.exports = { performanceMiddleware };
```

---

## 📋 **PLAN DE IMPLEMENTACIÓN**

### **Fase 1: Optimizaciones Inmediatas (1-2 días)**
1. ✅ Optimizar configuración del pool de conexiones
2. ✅ Implementar índices compuestos
3. ✅ Optimizar consultas de productos
4. ✅ Agregar middleware de performance

### **Fase 2: Sistema de Caché (3-5 días)**
1. 🔄 Instalar y configurar Redis
2. 🔄 Implementar middleware de caché
3. 🔄 Cachear consultas frecuentes
4. 🔄 Cachear productos destacados

### **Fase 3: Optimizaciones Avanzadas (1 semana)**
1. 🔄 Implementar cursor-based pagination
2. 🔄 Optimización de imágenes
3. 🔄 Compresión avanzada
4. 🔄 Monitoreo y métricas

---

## 🎯 **RESULTADOS ESPERADOS**

### **Antes de la Optimización:**
- ⏱️ Tiempo de carga de productos: ~500-800ms
- 📊 Consultas por segundo: ~50-100
- 💾 Uso de memoria: ~200-300MB

### **Después de la Optimización:**
- ⚡ Tiempo de carga de productos: ~100-200ms (60-75% mejora)
- 📈 Consultas por segundo: ~200-500 (300-400% mejora)
- 💾 Uso de memoria: ~150-200MB (25-33% reducción)
- 🔄 Cache hit ratio: ~80-90%

---

## 🛠️ **COMANDOS DE IMPLEMENTACIÓN**

```bash
# 1. Instalar dependencias de optimización
npm install redis sharp

# 2. Crear índices optimizados
mysql -u root -p kairos_natural_market < optimizacion_indices.sql

# 3. Reiniciar servidor con nuevas configuraciones
npm run dev

# 4. Monitorear performance
# Usar herramientas como: New Relic, PM2, o logs personalizados
```

---

## 📊 **MONITOREO CONTINUO**

### **Métricas a Monitorear:**
- ⏱️ Tiempo de respuesta promedio
- 📊 Throughput (consultas/segundo)
- 💾 Uso de memoria y CPU
- 🔄 Cache hit ratio
- ⚠️ Consultas lentas (>1 segundo)
- 🔗 Conexiones activas del pool

### **Alertas Recomendadas:**
- Tiempo de respuesta > 500ms
- Cache hit ratio < 70%
- Conexiones del pool > 80%
- Errores de base de datos > 1%

---

**Estado**: 📋 Plan de optimización completo
**Próximo paso**: Implementar Fase 1 - Optimizaciones Inmediatas
