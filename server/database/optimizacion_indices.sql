-- Script de optimización de índices para Kairos Natural Market
-- Desarrollado por Julio Alberto Pintos - WebXpert
-- Año: 2025

-- Índices compuestos para consultas complejas de productos
CREATE INDEX IF NOT EXISTS idx_productos_busqueda ON productos(activo, destacado, categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(activo, precio);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(activo, nombre);
CREATE INDEX IF NOT EXISTS idx_productos_fecha ON productos(activo, created_at);

-- Índice de texto completo para búsquedas
CREATE FULLTEXT INDEX IF NOT EXISTS idx_productos_busqueda_texto ON productos(nombre, descripcion, ingredientes);

-- Índices optimizados para pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_completo ON pedidos(estado, created_at, cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_estado ON pedidos(created_at, estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_email ON pedidos(cliente_email);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre, apellido);

-- Índices para categorías
CREATE INDEX IF NOT EXISTS idx_categorias_activo ON categorias(activo);
CREATE INDEX IF NOT EXISTS idx_categorias_orden ON categorias(orden);

-- Índices para detalle de pedidos
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_completo ON detalle_pedido(pedido_id, producto_id);

-- Índices para caja
CREATE INDEX IF NOT EXISTS idx_caja_fecha_tipo ON caja(fecha, tipo);

-- Índices para contactos
CREATE INDEX IF NOT EXISTS idx_contactos_estado ON contactos(estado);
CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos(created_at);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favoritos_cliente_producto ON favoritos(cliente_id, producto_id);

-- Índices para cupones
CREATE INDEX IF NOT EXISTS idx_cupones_codigo_activo ON cupones(codigo, activo);

-- Verificar que los índices se crearon correctamente
SHOW INDEX FROM productos;
SHOW INDEX FROM pedidos;
SHOW INDEX FROM clientes;
