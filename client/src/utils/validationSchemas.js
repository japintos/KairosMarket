/**
 * Esquemas de validación centralizados
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

// Esquema de validación para productos
export const productSchema = {
  nombre: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]+$/
  },
  descripcion: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  precio: {
    required: true,
    min: 0,
    type: 'number'
  },
  stock: {
    required: true,
    min: 0,
    type: 'number'
  },
  stock_minimo: {
    required: true,
    min: 0,
    type: 'number'
  },
  categoria_id: {
    required: true,
    type: 'number'
  }
};

// Esquema de validación para usuarios
export const userSchema = {
  nombre: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/
  },
  telefono: {
    required: false,
    pattern: /^[\d\s\-\+\(\)]+$/
  }
};

// Esquema de validación para categorías
export const categorySchema = {
  nombre: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  descripcion: {
    required: false,
    maxLength: 200
  }
};

// Esquema de validación para pedidos
export const orderSchema = {
  cliente_id: {
    required: true,
    type: 'number'
  },
  direccion_envio: {
    required: true,
    minLength: 10,
    maxLength: 200
  },
  metodo_pago: {
    required: true,
    enum: ['efectivo', 'tarjeta', 'transferencia']
  }
};

// Función para validar un objeto según un esquema
export const validateObject = (object, schema) => {
  const errors = {};

  Object.keys(schema).forEach(field => {
    const value = object[field];
    const rules = schema[field];

    // Validación required
    if (rules.required && (!value || value === '')) {
      errors[field] = `${field} es requerido`;
      return;
    }

    // Si no es required y no hay valor, saltar validaciones
    if (!rules.required && (!value || value === '')) {
      return;
    }

    // Validación de tipo
    if (rules.type === 'number' && isNaN(Number(value))) {
      errors[field] = `${field} debe ser un número`;
      return;
    }

    // Validación de longitud mínima
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} debe tener al menos ${rules.minLength} caracteres`;
      return;
    }

    // Validación de longitud máxima
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} debe tener máximo ${rules.maxLength} caracteres`;
      return;
    }

    // Validación de valor mínimo
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors[field] = `${field} debe ser mayor o igual a ${rules.min}`;
      return;
    }

    // Validación de patrón
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = `${field} tiene un formato inválido`;
      return;
    }

    // Validación de enum
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = `${field} debe ser uno de: ${rules.enum.join(', ')}`;
      return;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Función para obtener mensajes de error en español
export const getErrorMessage = (field, error) => {
  const errorMessages = {
    required: `${field} es requerido`,
    minLength: `${field} debe tener al menos {min} caracteres`,
    maxLength: `${field} debe tener máximo {max} caracteres`,
    min: `${field} debe ser mayor o igual a {min}`,
    max: `${field} debe ser menor o igual a {max}`,
    pattern: `${field} tiene un formato inválido`,
    email: `${field} debe ser un email válido`,
    number: `${field} debe ser un número`,
    enum: `${field} debe ser uno de los valores permitidos`
  };

  return errorMessages[error] || `${field} es inválido`;
};
