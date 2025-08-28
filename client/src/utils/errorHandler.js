/**
 * Sistema de manejo de errores tipado
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

// Tipos de errores
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Clasificar errores según su tipo
export const classifyError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // Errores de red
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }

  // Errores de timeout
  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }

  // Errores de autenticación
  if (error.status === 401 || error.message.includes('unauthorized')) {
    return ErrorTypes.AUTH;
  }

  // Errores de permisos
  if (error.status === 403 || error.message.includes('forbidden')) {
    return ErrorTypes.PERMISSION;
  }

  // Errores de no encontrado
  if (error.status === 404 || error.message.includes('not found')) {
    return ErrorTypes.NOT_FOUND;
  }

  // Errores de validación
  if (error.status === 400 || error.message.includes('validation')) {
    return ErrorTypes.VALIDATION;
  }

  // Errores del servidor
  if (error.status >= 500 || error.message.includes('server')) {
    return ErrorTypes.SERVER;
  }

  return ErrorTypes.UNKNOWN;
};

// Mensajes de error por tipo y contexto
const errorMessages = {
  [ErrorTypes.NETWORK]: {
    default: 'Error de conexión. Verifica tu conexión a internet.',
    products: 'No se pudieron cargar los productos. Verifica tu conexión.',
    cart: 'Error al actualizar el carrito. Verifica tu conexión.',
    checkout: 'Error al procesar el pedido. Verifica tu conexión.',
    login: 'Error al iniciar sesión. Verifica tu conexión.',
    register: 'Error al registrarse. Verifica tu conexión.',
    admin: 'Error de conexión en el panel de administración.'
  },
  [ErrorTypes.VALIDATION]: {
    default: 'Los datos ingresados no son válidos.',
    product: 'Los datos del producto no son válidos.',
    user: 'Los datos del usuario no son válidos.',
    order: 'Los datos del pedido no son válidos.',
    form: 'Por favor, corrige los errores en el formulario.'
  },
  [ErrorTypes.AUTH]: {
    default: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
    login: 'Credenciales incorrectas.',
    register: 'Error al crear la cuenta.',
    admin: 'Acceso denegado al panel de administración.'
  },
  [ErrorTypes.PERMISSION]: {
    default: 'No tienes permisos para realizar esta acción.',
    admin: 'No tienes permisos de administrador.',
    product: 'No tienes permisos para modificar este producto.',
    order: 'No tienes permisos para ver este pedido.'
  },
  [ErrorTypes.NOT_FOUND]: {
    default: 'El recurso solicitado no fue encontrado.',
    product: 'El producto no fue encontrado.',
    category: 'La categoría no fue encontrada.',
    order: 'El pedido no fue encontrado.',
    user: 'El usuario no fue encontrado.'
  },
  [ErrorTypes.SERVER]: {
    default: 'Error interno del servidor. Intenta nuevamente más tarde.',
    database: 'Error en la base de datos.',
    upload: 'Error al subir el archivo.',
    email: 'Error al enviar el email.'
  },
  [ErrorTypes.TIMEOUT]: {
    default: 'La operación tardó demasiado. Intenta nuevamente.',
    search: 'La búsqueda tardó demasiado.',
    upload: 'La subida del archivo tardó demasiado.',
    load: 'La carga de datos tardó demasiado.'
  },
  [ErrorTypes.UNKNOWN]: {
    default: 'Ocurrió un error inesperado. Intenta nuevamente.',
    fallback: 'Algo salió mal. Por favor, contacta al soporte.'
  }
};

// Obtener mensaje de error según tipo y contexto
export const getErrorMessage = (errorType, context = 'default') => {
  const messages = errorMessages[errorType];
  if (!messages) {
    return errorMessages[ErrorTypes.UNKNOWN].default;
  }

  return messages[context] || messages.default || errorMessages[ErrorTypes.UNKNOWN].default;
};

// Función principal para manejar errores
export const handleError = (error, context = 'default') => {
  const errorType = classifyError(error);
  const message = getErrorMessage(errorType, context);

  // Log del error para debugging
  console.error(`[${errorType}] ${context}:`, error);

  return {
    type: errorType,
    message,
    originalError: error,
    context
  };
};

// Hook para manejo de errores en componentes
export const useErrorHandler = () => {
  const handleComponentError = (error, context = 'default') => {
    const errorInfo = handleError(error, context);
    
    // Aquí se puede integrar con toast notifications
    if (typeof window !== 'undefined' && window.toast) {
      window.toast.error(errorInfo.message);
    }
    
    return errorInfo;
  };

  return { handleError: handleComponentError };
};

// Error Boundary para React
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const errorData = handleError(error, 'component');
    console.error('Error Boundary caught an error:', errorData, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo salió mal</h2>
          <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
