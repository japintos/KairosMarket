# 🌿 Kairos Natural Market

**E-commerce de productos naturales fraccionados** - Plataforma completa con panel administrativo, sistema de pagos y gestión integral.

![Kairos Natural Market](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![MercadoPago](https://img.shields.io/badge/MercadoPago-Integrated-yellow)

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [✨ Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [📱 Uso](#-uso)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [📊 Estructura del Proyecto](#-estructura-del-proyecto)
- [🛠️ Tecnologías](#️-tecnologías)
- [🔒 Seguridad](#-seguridad)
- [📈 Optimizaciones](#-optimizaciones)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🎯 Descripción

**Kairos Natural Market** es una plataforma e-commerce completa desarrollada para la venta de productos naturales fraccionados. El proyecto incluye un frontend moderno en React, un backend robusto en Node.js, y un panel administrativo completo para la gestión del negocio.

### 🎨 Diseño y UX
- **Paleta de colores**: Grises profesionales con acentos naranjas
- **Accesibilidad**: WCAG AA/AAA compliant
- **Responsive**: Optimizado para todos los dispositivos
- **Microinteracciones**: Animaciones suaves con Framer Motion

---

## ✨ Características

### 🛒 **Frontend (Cliente)**
- ✅ **Catálogo de productos** con filtros avanzados
- ✅ **Carrito de compras** persistente
- ✅ **Sistema de usuarios** (registro, login, perfil)
- ✅ **Checkout integrado** con MercadoPago
- ✅ **Búsqueda inteligente** con autocompletado
- ✅ **Lista de favoritos** personalizada
- ✅ **Historial de pedidos** detallado
- ✅ **Diseño responsive** y accesible

### 🏢 **Panel Administrativo**
- ✅ **Gestión de productos** (CRUD completo)
- ✅ **Gestión de categorías** y inventario
- ✅ **Panel de clientes** con estadísticas
- ✅ **Control de pedidos** y envíos
- ✅ **Control de caja** con gráficos
- ✅ **Reportes y analytics** en tiempo real
- ✅ **Configuración del sitio** centralizada
- ✅ **Gestión de contactos** y mensajes

### 🔧 **Backend (Servidor)**
- ✅ **API RESTful** completa
- ✅ **Autenticación JWT** segura
- ✅ **Integración MercadoPago** para pagos
- ✅ **Base de datos MySQL** optimizada
- ✅ **Sistema de emails** automático
- ✅ **Validación de datos** robusta
- ✅ **Logging y monitoreo** avanzado
- ✅ **Rate limiting** y seguridad

---

## 🏗️ Arquitectura

```
kairos-natural-market/
├── 📁 client/                 # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes reutilizables
│   │   ├── 📁 pages/         # Páginas de la aplicación
│   │   ├── 📁 hooks/         # Custom hooks
│   │   ├── 📁 contexts/      # Context API
│   │   ├── 📁 styles/        # Estilos globales
│   │   └── 📁 utils/         # Utilidades
│   └── 📁 public/            # Assets públicos
├── 📁 server/                # Backend Node.js
│   ├── 📁 routes/           # Rutas de la API
│   ├── 📁 middleware/       # Middlewares personalizados
│   ├── 📁 database/         # Scripts de BD y migraciones
│   └── 📁 scripts/          # Scripts de optimización
└── 📁 img/                  # Imágenes del proyecto
```

---

## 🚀 Instalación

### **Prerrequisitos**
- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/kairos-natural-market.git
cd kairos-natural-market
```

### **2. Instalar dependencias**
```bash
# Instalar dependencias del cliente
cd client
npm install

# Instalar dependencias del servidor
cd ../server
npm install
```

### **3. Configurar base de datos**
```bash
# Crear base de datos
npm run create-db

# Ejecutar migraciones
npm run migrate

# Poblar con datos de prueba
npm run seed
```

### **4. Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables en .env
nano .env
```

### **5. Iniciar el proyecto**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

---

## ⚙️ Configuración

### **Variables de Entorno (.env)**
```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=kairos_natural_market
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=24h

# MercadoPago
MP_ACCESS_TOKEN=TEST-1234567890abcdef-1234-5678-90ab-cdef12345678
MP_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_email

# CORS
CORS_ORIGIN=http://localhost:3000
```

### **Configuración de Base de Datos**
El proyecto incluye scripts automatizados para:
- Crear la base de datos
- Ejecutar migraciones
- Poblar con datos de prueba
- Optimizar índices

---

## 📱 Uso

### **Acceso a la Aplicación**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api/health

### **Credenciales de Administrador**
- **Email**: admin@kairosnatural.com
- **Contraseña**: admin123

### **Funcionalidades Principales**

#### **🛒 Como Cliente**
1. **Navegar** por el catálogo de productos
2. **Filtrar** por categorías y precios
3. **Agregar** productos al carrito
4. **Completar** el checkout con MercadoPago
5. **Seguir** el estado de tus pedidos

#### **🏢 Como Administrador**
1. **Gestionar** productos y categorías
2. **Revisar** pedidos y clientes
3. **Monitorear** ventas y caja
4. **Configurar** el sitio web
5. **Generar** reportes

---

## 🔧 Scripts Disponibles

### **Servidor (Backend)**
```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo
npm run create-db  # Crear base de datos
npm run migrate    # Ejecutar migraciones
npm run seed       # Poblar con datos de prueba
npm run setup      # Setup completo (BD + migraciones + datos)
npm run optimizar-db # Optimizar índices de BD
```

### **Cliente (Frontend)**
```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm test           # Ejecutar tests
npm run eject      # Eyectar configuración (irreversible)
```

---

## 📊 Estructura del Proyecto

### **Frontend (React)**
```
client/src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes comunes
│   ├── layout/          # Layout y navegación
│   ├── products/        # Componentes de productos
│   └── search/          # Componentes de búsqueda
├── pages/               # Páginas de la aplicación
│   ├── admin/          # Páginas del panel admin
│   └── public/         # Páginas públicas
├── hooks/               # Custom hooks
├── contexts/            # Context API
├── styles/              # Estilos globales
└── utils/               # Utilidades
```

### **Backend (Node.js)**
```
server/
├── routes/              # Rutas de la API
│   ├── auth.js         # Autenticación
│   ├── products.js     # Productos
│   ├── orders.js       # Pedidos
│   └── admin.js        # Panel admin
├── middleware/          # Middlewares
├── database/           # Scripts de BD
└── scripts/            # Scripts de optimización
```

---

## 🛠️ Tecnologías

### **Frontend**
- **React 18.2.0** - Biblioteca de UI
- **React Router 6** - Enrutamiento
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Formularios
- **Framer Motion** - Animaciones
- **Chart.js** - Gráficos
- **React Icons** - Iconografía
- **Axios** - Cliente HTTP

### **Backend**
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL2** - Cliente de base de datos
- **JWT** - Autenticación
- **MercadoPago** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **Multer** - Manejo de archivos
- **Joi** - Validación de datos

### **Base de Datos**
- **MySQL 8.0+** - Sistema de gestión de BD
- **Índices optimizados** para consultas rápidas
- **Relaciones** bien definidas
- **Integridad referencial** garantizada

### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Nodemon** - Recarga automática
- **Git** - Control de versiones

---

## 🔒 Seguridad

### **Autenticación y Autorización**
- ✅ **JWT Tokens** para sesiones seguras
- ✅ **Bcrypt** para hash de contraseñas
- ✅ **Rate Limiting** para prevenir ataques
- ✅ **Helmet** para headers de seguridad
- ✅ **CORS** configurado correctamente

### **Validación de Datos**
- ✅ **Joi** para validación en backend
- ✅ **React Hook Form** para validación en frontend
- ✅ **Sanitización** de inputs
- ✅ **Prevención de SQL Injection**

### **Protección de Rutas**
- ✅ **Middleware de autenticación** para rutas protegidas
- ✅ **Roles y permisos** implementados
- ✅ **Validación de tokens** en cada request

---

## 📈 Optimizaciones

### **Rendimiento Frontend**
- ✅ **Lazy Loading** de componentes
- ✅ **Virtualización** de listas largas
- ✅ **Optimización de imágenes** con WebP
- ✅ **Code Splitting** automático
- ✅ **Caching** inteligente

### **Rendimiento Backend**
- ✅ **Connection Pooling** para MySQL
- ✅ **Compresión** de respuestas
- ✅ **Índices optimizados** en BD
- ✅ **Query optimization** con SQL_CALC_FOUND_ROWS
- ✅ **Caching** de consultas frecuentes

### **Base de Datos**
- ✅ **Índices compuestos** para consultas complejas
- ✅ **Índices fulltext** para búsquedas
- ✅ **Optimización de queries** con EXPLAIN
- ✅ **Monitoreo de performance**

---

## 🤝 Contribución

### **Cómo Contribuir**
1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Estándares de Código**
- **ESLint** configurado para mantener consistencia
- **Prettier** para formateo automático
- **Conventional Commits** para mensajes de commit
- **Documentación** obligatoria para nuevas funciones

### **Testing**
- **Tests unitarios** para componentes críticos
- **Tests de integración** para APIs
- **Tests E2E** para flujos completos

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Desarrollador

**Julio Alberto Pintos - WebXpert**
- **Email**: contacto@webxpert.com
- **LinkedIn**: [Julio Alberto Pintos](https://linkedin.com/in/julio-pintos)
- **Portfolio**: [WebXpert](https://webxpert.com)

---

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@kairosnatural.com
- **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/kairos-natural-market/wiki)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/kairos-natural-market/issues)

---

## 🚀 Roadmap

### **Próximas Funcionalidades**
- [ ] **App móvil** nativa (React Native)
- [ ] **Sistema de notificaciones** push
- [ ] **Integración con WhatsApp** Business
- [ ] **Analytics avanzados** con Google Analytics
- [ ] **Sistema de cupones** y descuentos
- [ ] **Múltiples idiomas** (i18n)
- [ ] **PWA** (Progressive Web App)
- [ ] **API pública** para desarrolladores

### **Mejoras Técnicas**
- [ ] **Microservicios** para escalabilidad
- [ ] **Docker** para containerización
- [ ] **CI/CD** automatizado
- [ ] **Monitoreo** con APM
- [ ] **Backup automático** de BD
- [ ] **CDN** para assets estáticos

---

**⭐ Si este proyecto te resulta útil, ¡déjanos una estrella en GitHub!**

---

*Última actualización: Enero 2025*
*Versión: 1.0.0*
*Estado: Production Ready*
