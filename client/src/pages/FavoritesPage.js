import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaSearch } from 'react-icons/fa';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo
  const favorites = [
    {
      id: 1,
      name: 'Aceite de Coco Orgánico',
      price: 450.00,
      image: '/img/product1.jpg',
      category: 'Aceites',
      inStock: true
    },
    {
      id: 2,
      name: 'Miel Pura de Abeja',
      price: 250.00,
      image: '/img/product2.jpg',
      category: 'Endulzantes',
      inStock: true
    },
    {
      id: 3,
      name: 'Quinoa Orgánica',
      price: 180.00,
      image: '/img/product3.jpg',
      category: 'Granos',
      inStock: false
    }
  ];

  const filteredFavorites = favorites.filter(favorite =>
    favorite.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeFromFavorites = (id) => {
    // Aquí iría la lógica para remover de favoritos
    console.log('Removing from favorites:', id);
  };

  const addToCart = (id) => {
    // Aquí iría la lógica para agregar al carrito
    console.log('Adding to cart:', id);
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Mis Favoritos</h1>
          <p>Productos que has guardado como favoritos</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar en favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="favorites-content">
        {filteredFavorites.length > 0 ? (
          <div className="favorites-grid">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div className="favorite-image">
                  <img src={favorite.image} alt={favorite.name} />
                  <button
                    className="remove-favorite"
                    onClick={() => removeFromFavorites(favorite.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="favorite-info">
                  <h3>{favorite.name}</h3>
                  <p className="category">{favorite.category}</p>
                  <p className="price">${favorite.price.toFixed(2)}</p>
                  
                  <div className="stock-status">
                    {favorite.inStock ? (
                      <span className="in-stock">En stock</span>
                    ) : (
                      <span className="out-of-stock">Sin stock</span>
                    )}
                  </div>
                </div>
                
                <div className="favorite-actions">
                  {favorite.inStock ? (
                    <button
                      className="btn-primary"
                      onClick={() => addToCart(favorite.id)}
                    >
                      <FaShoppingCart />
                      Agregar al carrito
                    </button>
                  ) : (
                    <button className="btn-secondary" disabled>
                      Sin stock
                    </button>
                  )}
                  
                  <Link to={`/product/${favorite.id}`} className="btn-secondary">
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaHeart />
            <h3>No tienes favoritos</h3>
            <p>
              {searchTerm 
                ? 'No se encontraron productos que coincidan con tu búsqueda'
                : 'Aún no has agregado productos a tus favoritos'
              }
            </p>
            {!searchTerm && (
              <Link to="/catalog" className="btn-primary">
                Explorar productos
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
