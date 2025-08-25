/**
 * Página de catálogo - CatalogPage
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaFilter, FaSort, FaThLarge, FaList, FaTh } from 'react-icons/fa';
import { useProducts } from '../hooks/useProducts';
import { useActiveCategories } from '../hooks/useCategories';
import ProductGrid from '../components/products/ProductGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './CatalogPage.css';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoria: searchParams.get('categoria') || '',
    precio_min: searchParams.get('precio_min') || '',
    precio_max: searchParams.get('precio_max') || '',
    ordenar: searchParams.get('ordenar') || 'nombre_asc',
    destacado: searchParams.get('destacado') === 'true'
  });
  const [layout, setLayout] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Obtener datos
  const { data: products, isLoading, error } = useProducts(filters);
  const { data: categories } = useActiveCategories();

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      categoria: '',
      precio_min: '',
      precio_max: '',
      ordenar: 'nombre_asc',
      destacado: false
    });
  };

  // Opciones de ordenamiento
  const sortOptions = [
    { value: 'nombre_asc', label: 'Nombre A-Z' },
    { value: 'nombre_desc', label: 'Nombre Z-A' },
    { value: 'precio_asc', label: 'Precio: Menor a Mayor' },
    { value: 'precio_desc', label: 'Precio: Mayor a Menor' },
    { value: 'rating_desc', label: 'Mejor Valorados' },
    { value: 'fecha_desc', label: 'Más Recientes' }
  ];

  // Contar productos filtrados
  const productCount = products?.length || 0;

  return (
    <>
      <Helmet>
        <title>Catálogo - Kairos Natural Market</title>
        <meta name="description" content="Explora nuestro catálogo completo de productos naturales fraccionados. Filtra por categoría, precio y más." />
      </Helmet>

      <div className="catalog-page">
        {/* Header del catálogo */}
        <div className="catalog-header">
          <div className="container">
            <h1>Catálogo de Productos</h1>
            <p>Descubre nuestra amplia selección de productos naturales</p>
          </div>
        </div>

        <div className="container">
          <div className="catalog-content">
            {/* Filtros y controles */}
            <div className="catalog-controls">
              {/* Búsqueda */}
              <div className="search-section">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Controles de vista y ordenamiento */}
              <div className="view-controls">
                <div className="layout-controls">
                  <button
                    className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
                    onClick={() => setLayout('grid')}
                    title="Vista de cuadrícula"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    className={`layout-btn ${layout === 'compact' ? 'active' : ''}`}
                    onClick={() => setLayout('compact')}
                    title="Vista compacta"
                  >
                    <FaTh />
                  </button>
                  <button
                    className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
                    onClick={() => setLayout('list')}
                    title="Vista de lista"
                  >
                    <FaList />
                  </button>
                </div>

                <div className="sort-controls">
                  <FaSort className="sort-icon" />
                  <select
                    value={filters.ordenar}
                    onChange={(e) => handleFilterChange('ordenar', e.target.value)}
                    className="sort-select"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  Filtros
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className="filters-panel">
                <div className="filters-content">
                  {/* Categorías */}
                  <div className="filter-group">
                    <h3>Categorías</h3>
                    <div className="category-filters">
                      <label className="filter-checkbox">
                        <input
                          type="radio"
                          name="categoria"
                          value=""
                          checked={filters.categoria === ''}
                          onChange={(e) => handleFilterChange('categoria', e.target.value)}
                        />
                        <span>Todas las categorías</span>
                      </label>
                      {categories?.map(category => (
                        <label key={category.id} className="filter-checkbox">
                          <input
                            type="radio"
                            name="categoria"
                            value={category.id}
                            checked={filters.categoria === category.id.toString()}
                            onChange={(e) => handleFilterChange('categoria', e.target.value)}
                          />
                          <span>{category.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rango de precios */}
                  <div className="filter-group">
                    <h3>Rango de Precios</h3>
                    <div className="price-filters">
                      <div className="price-input-group">
                        <label>Mínimo:</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={filters.precio_min}
                          onChange={(e) => handleFilterChange('precio_min', e.target.value)}
                          className="price-input"
                        />
                      </div>
                      <div className="price-input-group">
                        <label>Máximo:</label>
                        <input
                          type="number"
                          placeholder="10000"
                          value={filters.precio_max}
                          onChange={(e) => handleFilterChange('precio_max', e.target.value)}
                          className="price-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Productos destacados */}
                  <div className="filter-group">
                    <h3>Características</h3>
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.destacado}
                        onChange={(e) => handleFilterChange('destacado', e.target.checked)}
                      />
                      <span>Solo productos destacados</span>
                    </label>
                  </div>

                  {/* Botones de filtros */}
                  <div className="filter-actions">
                    <button onClick={clearFilters} className="btn btn-ghost">
                      Limpiar Filtros
                    </button>
                    <button onClick={() => setShowFilters(false)} className="btn btn-primary">
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información de resultados */}
            <div className="results-info">
              <p>
                {isLoading ? 'Cargando productos...' : 
                 `Mostrando ${productCount} producto${productCount !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {/* Grilla de productos */}
            <div className="products-section">
              {isLoading ? (
                <div className="products-loading">
                  <LoadingSpinner text="Cargando productos..." />
                </div>
              ) : error ? (
                <div className="products-error">
                  <div className="alert alert-danger">
                    <h3>Error al cargar productos</h3>
                    <p>{error.message || 'Error desconocido al cargar productos'}</p>
                  </div>
                </div>
              ) : (
                <ProductGrid
                  products={products || []}
                  layout={layout}
                  columns={layout === 'list' ? 1 : layout === 'compact' ? 3 : 4}
                  emptyMessage="No se encontraron productos con los filtros aplicados"
                />
              )}
            </div>

            {/* Mensaje cuando no hay productos */}
            {!isLoading && !error && productCount === 0 && (
              <div className="no-products">
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No se encontraron productos</h3>
                  <p>Intenta ajustar los filtros de búsqueda o explorar otras categorías</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogPage;
