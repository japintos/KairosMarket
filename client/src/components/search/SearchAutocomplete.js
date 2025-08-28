/**
 * Componente de búsqueda con autocompletado
 * Kairos Natural Market - Desarrollado por Julio Alberto Pintos - WebXpert
 * Año: 2025
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { debounce } from 'lodash';
import './SearchAutocomplete.css';

const SearchAutocomplete = ({ 
  placeholder = "Buscar productos...",
  className = "",
  onSearch,
  suggestions = [],
  loading = false
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchTerm) => {
      if (searchTerm.length > 2) {
        onSearch?.(searchTerm);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.nombre || suggestion);
    setShowSuggestions(false);
    navigate(`/catalogo?search=${encodeURIComponent(suggestion.nombre || suggestion)}`);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/catalogo?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle focus/blur
  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`search-autocomplete ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="search-input"
            aria-label="Buscar productos"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          
          {loading && (
            <FaSpinner className="search-spinner" />
          )}
          
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label="Sugerencias de búsqueda"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <FaSearch className="suggestion-icon" />
                <span className="suggestion-text">
                  {suggestion.nombre || suggestion}
                </span>
                {suggestion.categoria && (
                  <span className="suggestion-category">
                    en {suggestion.categoria}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {showSuggestions && query.length > 2 && suggestions.length === 0 && !loading && (
          <div className="no-results">
            <span>No se encontraron resultados para "{query}"</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchAutocomplete;
