import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaEnvelope, 
  FaUser, 
  FaPhone, 
  FaCalendarAlt, 
  FaSearch,
  FaFilter,
  FaEye,
  FaReply,
  FaTrash,
  FaTimesCircle,
  FaCheck,
  FaClock,
  FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminContactsPage.css';

// Datos simulados para desarrollo
const mockContacts = [
  {
    id: 1,
    nombre: 'María González',
    email: 'maria.gonzalez@email.com',
    telefono: '+54 9 11 1234-5678',
    asunto: 'Consulta sobre productos orgánicos',
    mensaje: 'Hola, me interesa saber si tienen productos orgánicos certificados. ¿Podrían enviarme información sobre sus certificaciones y si tienen productos sin gluten?',
    estado: 'nuevo',
    fecha_creacion: '2025-01-15T10:30:00Z',
    respuesta: null,
    fecha_respuesta: null
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '+54 9 11 2345-6789',
    asunto: 'Pedido especial para eventos',
    mensaje: 'Necesito hacer un pedido especial para un evento corporativo. Somos aproximadamente 50 personas y necesitaríamos una mezcla personalizada de frutos secos. ¿Es posible?',
    estado: 'respondido',
    fecha_creacion: '2025-01-14T15:45:00Z',
    respuesta: 'Hola Carlos, gracias por tu consulta. Sí, podemos preparar mezclas personalizadas para eventos. Te envío nuestra propuesta por email.',
    fecha_respuesta: '2025-01-15T09:15:00Z'
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    telefono: '+54 9 11 3456-7890',
    asunto: 'Problema con mi pedido',
    mensaje: 'Hice un pedido la semana pasada y recibí productos diferentes a los que ordené. El número de pedido es #2025-001. ¿Podrían ayudarme?',
    estado: 'leido',
    fecha_creacion: '2025-01-13T12:20:00Z',
    respuesta: null,
    fecha_respuesta: null
  },
  {
    id: 4,
    nombre: 'Luis Fernández',
    email: 'luis.fernandez@email.com',
    telefono: '+54 9 11 4567-8901',
    asunto: 'Información sobre envíos',
    mensaje: '¿Cuál es el costo de envío a Córdoba? Y ¿cuánto tiempo tarda en llegar?',
    estado: 'archivado',
    fecha_creacion: '2025-01-12T08:15:00Z',
    respuesta: 'Hola Luis, el envío a Córdoba tiene un costo de $800 y tarda entre 2-3 días hábiles.',
    fecha_respuesta: '2025-01-12T14:30:00Z'
  },
  {
    id: 5,
    nombre: 'Sofía López',
    email: 'sofia.lopez@email.com',
    telefono: '+54 9 11 5678-9012',
    asunto: 'Sugerencia de productos',
    mensaje: 'Me encantan sus productos. ¿Podrían agregar más variedades de té de hierbas? Especialmente me interesan los tés relajantes.',
    estado: 'nuevo',
    fecha_creacion: '2025-01-15T16:00:00Z',
    respuesta: null,
    fecha_respuesta: null
  }
];

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  const statusFilters = [
    { value: '', label: 'Todos los mensajes' },
    { value: 'nuevo', label: 'Nuevos', color: '#2196f3' },
    { value: 'leido', label: 'Leídos', color: '#4caf50' },
    { value: 'respondido', label: 'Respondidos', color: '#ff9800' },
    { value: 'archivado', label: 'Archivados', color: '#9e9e9e' }
  ];

  // Cargar contactos (simulado)
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar contactos
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || contact.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ver detalles del contacto
  const viewContactDetails = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    // Marcar como leído si es nuevo
    if (contact.estado === 'nuevo') {
      markAsRead(contact.id);
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
    setReplyMessage('');
  };

  // Marcar como leído
  const markAsRead = async (contactId) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { ...contact, estado: 'leido' }
            : contact
        )
      );
      
      toast.success('Mensaje marcado como leído');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar como leído');
    }
  };

  // Responder mensaje
  const replyToContact = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      toast.error('Por favor escribe un mensaje de respuesta');
      return;
    }

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === selectedContact.id 
            ? { 
                ...contact, 
                estado: 'respondido',
                respuesta: replyMessage,
                fecha_respuesta: new Date().toISOString()
              }
            : contact
        )
      );
      
      toast.success('Respuesta enviada correctamente');
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Archivar mensaje
  const archiveContact = async (contactId) => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { ...contact, estado: 'archivado' }
            : contact
        )
      );
      
      toast.success('Mensaje archivado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Eliminar mensaje
  const deleteContact = async (contactId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContacts(prevContacts => 
        prevContacts.filter(contact => contact.id !== contactId)
      );
      
      toast.success('Mensaje eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const statusObj = statusFilters.find(s => s.value === status);
    return statusObj ? statusObj.color : '#666';
  };

  // Obtener label del estado
  const getStatusLabel = (status) => {
    const statusObj = statusFilters.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener tiempo transcurrido
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Hace ${diffInWeeks} semanas`;
  };

  if (loading && contacts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Mensajes de Contacto - Panel Administrativo</title>
      </Helmet>

      <div className="admin-contacts-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Mensajes de Contacto</h1>
            <p>Gestiona las consultas y mensajes de tus clientes</p>
          </div>
        </div>

        <div className="page-content">
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, asunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <FaFilter />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="contacts-grid">
            <AnimatePresence>
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  className={`contact-card ${contact.estado === 'nuevo' ? 'unread' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="contact-header">
                    <div className="contact-info">
                      <div className="contact-avatar">
                        <FaUser />
                      </div>
                      <div className="contact-details">
                        <h3>{contact.nombre}</h3>
                        <p className="contact-email">{contact.email}</p>
                        <span className="contact-time">{getTimeAgo(contact.fecha_creacion)}</span>
                      </div>
                    </div>
                    <div className="contact-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(contact.estado) }}
                      >
                        {getStatusLabel(contact.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="contact-content">
                    <h4 className="contact-subject">{contact.asunto}</h4>
                    <p className="contact-message">
                      {contact.mensaje.length > 150 
                        ? `${contact.mensaje.substring(0, 150)}...` 
                        : contact.mensaje
                      }
                    </p>
                  </div>

                  <div className="contact-actions">
                    <button
                      className="btn-primary"
                      onClick={() => viewContactDetails(contact)}
                    >
                      <FaEye /> Ver Detalles
                    </button>
                    {contact.estado === 'nuevo' && (
                      <button
                        className="btn-secondary"
                        onClick={() => markAsRead(contact.id)}
                      >
                        <FaCheck /> Marcar Leído
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => archiveContact(contact.id)}
                      title="Archivar"
                    >
                      <FaClock />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => deleteContact(contact.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredContacts.length === 0 && (
              <div className="empty-state">
                <FaEnvelope />
                <h3>No hay mensajes</h3>
                <p>
                  {searchTerm || statusFilter
                    ? 'No se encontraron mensajes con los filtros aplicados'
                    : 'Aún no hay mensajes de contacto'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalles del contacto */}
        <AnimatePresence>
          {showModal && selectedContact && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="modal-content contact-details-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Mensaje de {selectedContact.nombre}</h2>
                  <button className="btn-icon" onClick={closeModal}>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="contact-profile">
                    <div className="profile-avatar">
                      <FaUser />
                    </div>
                    <div className="profile-info">
                      <h3>{selectedContact.nombre}</h3>
                      <p>{selectedContact.email}</p>
                      {selectedContact.telefono && (
                        <p><FaPhone /> {selectedContact.telefono}</p>
                      )}
                      <span className="contact-date">
                        <FaCalendarAlt /> {formatDate(selectedContact.fecha_creacion)}
                      </span>
                    </div>
                  </div>

                  <div className="message-content">
                    <h3>Asunto: {selectedContact.asunto}</h3>
                    <div className="message-text">
                      <p>{selectedContact.mensaje}</p>
                    </div>
                  </div>

                  {selectedContact.respuesta && (
                    <div className="response-content">
                      <h3>Respuesta Enviada</h3>
                      <div className="response-text">
                        <p>{selectedContact.respuesta}</p>
                      </div>
                      <span className="response-date">
                        Respondido el {formatDate(selectedContact.fecha_respuesta)}
                      </span>
                    </div>
                  )}

                  {!selectedContact.respuesta && (
                    <div className="reply-section">
                      <h3>Responder Mensaje</h3>
                      <form onSubmit={replyToContact}>
                        <div className="form-group">
                          <label>Respuesta *</label>
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows="5"
                            required
                          />
                        </div>
                        <div className="reply-actions">
                          <button
                            type="submit"
                            className="btn-primary"
                          >
                            <FaReply /> Enviar Respuesta
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => archiveContact(selectedContact.id)}
                  >
                    <FaClock /> Archivar
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => deleteContact(selectedContact.id)}
                  >
                    <FaTrash /> Eliminar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={closeModal}
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminContactsPage;
