/**
 * Mapa de iconos mejorado para la administración
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React from 'react';
import { 
  FaBox, 
  FaTags, 
  FaShoppingBag, 
  FaUsers, 
  FaChartBar, 
  FaCog,
  FaHome,
  FaEnvelope,
  FaCashRegister,
  FaClipboardList,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaUpload,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDownload,
  FaPrint,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaCreditCard,
  FaTruck,
  FaStore,
  FaUserCog,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaNetworkWired,
  FaMobile,
  FaTablet,
  FaDesktop,
  FaLaptop
} from 'react-icons/fa';

export const IconMap = {
  // Navegación principal
  home: <FaHome />,
  products: <FaBox />,
  categories: <FaTags />,
  orders: <FaShoppingBag />,
  customers: <FaUsers />,
  reports: <FaChartBar />,
  settings: <FaCog />,
  messages: <FaEnvelope />,
  cash: <FaCashRegister />,
  inventory: <FaClipboardList />,
  logout: <FaSignOutAlt />,

  // Acciones CRUD
  add: <FaPlus />,
  edit: <FaEdit />,
  delete: <FaTrash />,
  view: <FaEye />,
  hide: <FaEyeSlash />,
  save: <FaSave />,
  close: <FaTimes />,
  confirm: <FaCheck />,

  // Búsqueda y filtros
  search: <FaSearch />,
  filter: <FaFilter />,

  // Archivos y medios
  upload: <FaUpload />,
  download: <FaDownload />,
  print: <FaPrint />,

  // Estados y notificaciones
  warning: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
  error: <FaExclamationTriangle />,
  success: <FaCheck />,

  // Tiempo y fechas
  calendar: <FaCalendar />,
  clock: <FaClock />,

  // Ubicación y contacto
  location: <FaMapMarkerAlt />,
  phone: <FaPhone />,
  website: <FaGlobe />,

  // Comercio
  payment: <FaCreditCard />,
  shipping: <FaTruck />,
  store: <FaStore />,

  // Usuario y seguridad
  userSettings: <FaUserCog />,
  security: <FaShieldAlt />,

  // Tecnología
  database: <FaDatabase />,
  server: <FaServer />,
  network: <FaNetworkWired />,

  // Dispositivos
  mobile: <FaMobile />,
  tablet: <FaTablet />,
  desktop: <FaDesktop />,
  laptop: <FaLaptop />
};

// Función helper para obtener icono con tamaño personalizado
export const getIcon = (name, size = 16, className = '') => {
  const icon = IconMap[name];
  if (!icon) {
    console.warn(`Icono "${name}" no encontrado en IconMap`);
    return null;
  }
  
  return React.cloneElement(icon, {
    size,
    className
  });
};

// Función helper para obtener icono con estilos personalizados
export const getStyledIcon = (name, styles = {}) => {
  const icon = IconMap[name];
  if (!icon) {
    console.warn(`Icono "${name}" no encontrado en IconMap`);
    return null;
  }
  
  return React.cloneElement(icon, {
    style: styles
  });
};

export default IconMap;
