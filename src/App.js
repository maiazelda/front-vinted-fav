import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, ShoppingBag, AlertCircle, Menu, ChevronLeft, Tag, Users, Grid, TrendingUp } from 'lucide-react';

// URL de votre API Spring Boot
const API_BASE_URL = 'http://localhost:8080/api/favorites';

const VintedFavoritesApp = () => {
  // ========================================
  // STATE - Les données qui changent dans l'application
  // ========================================
  
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NOUVEAU : State pour la sidebar
  // Comme une variable boolean en Java qui contrôle l'affichage
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filtres
  const [filters, setFilters] = useState({
    marque: '',
    genre: '',
    categorie: '',
    vendu: ''
  });
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    marque: '',
    prix: '',
    taille: '',
    genre: '',
    categorie: '',
    url: '',
    vendu: false
  });

  // ========================================
  // useEffect - Chargement des données
  // ========================================
  
  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [favorites, filters]);

  // ========================================
  // FONCTIONS API
  // ========================================
  
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      // Debug: affiche la structure des données pour vérifier les champs photo
      console.log('Données favorites reçues:', data);
      if (data.length > 0) {
        console.log('Structure d\'un favori:', Object.keys(data[0]));
        console.log('Premier favori complet:', data[0]);
      }
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (favoriteData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favoriteData)
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      await fetchFavorites();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateFavorite = async (id, favoriteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favoriteData)
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      await fetchFavorites();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFavorite = async (id) => {
    if (!window.confirm('Supprimer ce favori ?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await fetchFavorites();
    } catch (err) {
      setError(err.message);
    }
  };

  // ========================================
  // FONCTIONS DE FILTRAGE
  // ========================================
  
  const applyFilters = () => {
    let result = [...favorites];
    
    if (filters.marque) {
      result = result.filter(fav => 
        fav.marque?.toLowerCase().includes(filters.marque.toLowerCase())
      );
    }
    if (filters.genre) {
      result = result.filter(fav => fav.genre === filters.genre);
    }
    if (filters.categorie) {
      result = result.filter(fav => 
        fav.categorie?.toLowerCase().includes(filters.categorie.toLowerCase())
      );
    }
    if (filters.vendu !== '') {
      result = result.filter(fav => fav.vendu === (filters.vendu === 'true'));
    }
    
    setFilteredFavorites(result);
  };

  const resetFilters = () => {
    setFilters({
      marque: '',
      genre: '',
      categorie: '',
      vendu: ''
    });
  };

  // ========================================
  // FONCTIONS MODAL
  // ========================================
  
  const openAddModal = () => {
    setEditingFavorite(null);
    setFormData({
      titre: '',
      marque: '',
      prix: '',
      taille: '',
      genre: '',
      categorie: '',
      url: '',
      vendu: false
    });
    setShowModal(true);
  };

  const openEditModal = (favorite) => {
    setEditingFavorite(favorite);
    setFormData({
      titre: favorite.titre || '',
      marque: favorite.marque || '',
      prix: favorite.prix || '',
      taille: favorite.taille || '',
      genre: favorite.genre || '',
      categorie: favorite.categorie || '',
      url: favorite.url || '',
      vendu: favorite.vendu || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFavorite(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFavorite) {
      updateFavorite(editingFavorite.id, formData);
    } else {
      addFavorite(formData);
    }
  };

  // ========================================
  // EXTRACTION DES VALEURS UNIQUES
  // ========================================
  
  const uniqueGenres = [...new Set(favorites.map(f => f.genre).filter(Boolean))];
  const uniqueMarques = [...new Set(favorites.map(f => f.marque).filter(Boolean))];
  const uniqueCategories = [...new Set(favorites.map(f => f.categorie).filter(Boolean))];

  // Statistiques pour la sidebar
  const stats = {
    total: favorites.length,
    disponibles: favorites.filter(f => !f.vendu).length,
    vendus: favorites.filter(f => f.vendu).length,
    prixMoyen: favorites.length > 0 
      ? (favorites.reduce((acc, f) => acc + (parseFloat(f.prix) || 0), 0) / favorites.length).toFixed(2)
      : 0
  };

  // ========================================
  // RENDU JSX
  // ========================================
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0e27',
        color: '#00ff9d',
        fontFamily: '"Roboto Mono", monospace',
        fontSize: '18px',
        letterSpacing: '2px'
      }}>
        CHARGEMENT...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e27',
      color: '#e4e7eb',
      fontFamily: '"Inter", sans-serif',
      display: 'flex'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Roboto+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
        
        .sidebar {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-dark {
          background: linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%);
          border: 1px solid rgba(0, 255, 157, 0.1);
          border-radius: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .card-dark::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff9d, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .card-dark:hover::before {
          opacity: 1;
        }
        
        .card-dark:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 255, 157, 0.3);
          box-shadow: 0 8px 32px rgba(0, 255, 157, 0.1);
        }
        
        .btn-dark {
          border: none;
          padding: 12px 24px;
          border-radius: 2px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Roboto Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }
        
        .btn-dark::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transition: left 0.3s;
        }
        
        .btn-dark:hover::before {
          left: 100%;
        }
        
        .btn-primary-dark {
          background: linear-gradient(135deg, #00ff9d 0%, #00b8ff 100%);
          color: #0a0e27;
          box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);
        }
        
        .btn-primary-dark:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 157, 0.4);
        }
        
        .btn-danger-dark {
          background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
          color: white;
        }
        
        .btn-secondary-dark {
          background: rgba(255, 255, 255, 0.05);
          color: #e4e7eb;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn-secondary-dark:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(0, 255, 157, 0.3);
        }
        
        input, select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #e4e7eb;
          transition: all 0.2s;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #00ff9d;
          box-shadow: 0 0 0 3px rgba(0, 255, 157, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }
        
        input::placeholder {
          color: rgba(228, 231, 235, 0.4);
        }
        
        .badge-dark {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Roboto Mono', monospace;
        }
        
        .badge-sold-dark {
          background: rgba(255, 71, 87, 0.2);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.3);
        }
        
        .badge-available-dark {
          background: rgba(0, 255, 157, 0.2);
          color: #00ff9d;
          border: 1px solid rgba(0, 255, 157, 0.3);
        }
        
        .sidebar-item {
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }
        
        .sidebar-item:hover {
          background: rgba(0, 255, 157, 0.05);
          border-left-color: #00ff9d;
          padding-left: 24px;
        }
        
        .sidebar-item.active {
          background: rgba(0, 255, 157, 0.1);
          border-left-color: #00ff9d;
          color: #00ff9d;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in-left {
          animation: slideInLeft 0.4s ease-out forwards;
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0a0e27;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 157, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 157, 0.5);
        }
      `}</style>

      {/* ========================================
          SIDEBAR RÉTRACTABLE
          Concept : Rendu conditionnel basé sur le state sidebarOpen
          transform: translateX(-100%) cache la sidebar hors de l'écran
          ======================================== */}
      <div 
        className="sidebar"
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #0f1729 0%, #0a0e27 100%)',
          borderRight: '1px solid rgba(0, 255, 157, 0.1)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflowY: 'auto'
        }}
      >
        {/* Header Sidebar */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(0, 255, 157, 0.1)',
          background: 'rgba(0, 255, 157, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 700,
              color: '#00ff9d',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              VINTED TRACKER
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e4e7eb',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <p style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.6)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '0.5px'
          }}>
            SYSTÈME DE GESTION
          </p>
        </div>

        {/* Statistiques */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.5)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '1px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            Statistiques
          </h3>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{
              background: 'rgba(0, 255, 157, 0.05)',
              padding: '12px',
              borderRadius: '2px',
              border: '1px solid rgba(0, 255, 157, 0.1)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00ff9d',
                fontFamily: '"Rajdhani", sans-serif'
              }}>
                {stats.total}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(228, 231, 235, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total articles
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '12px',
              borderRadius: '2px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00b8ff',
                fontFamily: '"Rajdhani", sans-serif'
              }}>
                {stats.disponibles}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(228, 231, 235, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Disponibles
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '12px',
              borderRadius: '2px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#ff6348',
                fontFamily: '"Rajdhani", sans-serif'
              }}>
                {stats.prixMoyen}€
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(228, 231, 235, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Prix moyen
              </div>
            </div>
          </div>
        </div>

        {/* Filtres par Genre */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.5)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Users size={14} />
            Genre
          </h3>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, genre: ''})}
            style={{ color: filters.genre === '' ? '#00ff9d' : '#e4e7eb' }}
          >
            <Grid size={16} />
            Tous
          </div>
          {uniqueGenres.map(genre => (
            <div
              key={genre}
              className="sidebar-item"
              onClick={() => setFilters({...filters, genre})}
              style={{ color: filters.genre === genre ? '#00ff9d' : '#e4e7eb' }}
            >
              {genre}
            </div>
          ))}
        </div>

        {/* Filtres par Marque */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.5)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag size={14} />
            Marques
          </h3>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, marque: ''})}
            style={{ color: filters.marque === '' ? '#00ff9d' : '#e4e7eb' }}
          >
            <Grid size={16} />
            Toutes
          </div>
          {uniqueMarques.slice(0, 8).map(marque => (
            <div
              key={marque}
              className="sidebar-item"
              onClick={() => setFilters({...filters, marque})}
              style={{ color: filters.marque === marque ? '#00ff9d' : '#e4e7eb' }}
            >
              {marque}
            </div>
          ))}
        </div>

        {/* Filtres par Catégorie */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.5)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={14} />
            Catégories
          </h3>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, categorie: ''})}
            style={{ color: filters.categorie === '' ? '#00ff9d' : '#e4e7eb' }}
          >
            <Grid size={16} />
            Toutes
          </div>
          {uniqueCategories.slice(0, 8).map(cat => (
            <div
              key={cat}
              className="sidebar-item"
              onClick={() => setFilters({...filters, categorie: cat})}
              style={{ color: filters.categorie === cat ? '#00ff9d' : '#e4e7eb' }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Statut */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{
            fontSize: '11px',
            color: 'rgba(228, 231, 235, 0.5)',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            Statut
          </h3>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, vendu: ''})}
            style={{ color: filters.vendu === '' ? '#00ff9d' : '#e4e7eb' }}
          >
            <Grid size={16} />
            Tous
          </div>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, vendu: 'false'})}
            style={{ color: filters.vendu === 'false' ? '#00ff9d' : '#e4e7eb' }}
          >
            Disponible
          </div>
          <div
            className="sidebar-item"
            onClick={() => setFilters({...filters, vendu: 'true'})}
            style={{ color: filters.vendu === 'true' ? '#00ff9d' : '#e4e7eb' }}
          >
            Vendu
          </div>
        </div>

        {/* Reset Button */}
        <div style={{ padding: '20px' }}>
          <button 
            className="btn-dark btn-secondary-dark"
            onClick={resetFilters}
            style={{ width: '100%' }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ========================================
          CONTENU PRINCIPAL
          margin-left change selon l'état de la sidebar
          ======================================== */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh'
      }}>
        {/* Header avec bouton menu */}
        <div style={{
          background: 'linear-gradient(135deg, #0f1729 0%, #1a1f3a 100%)',
          borderBottom: '1px solid rgba(0, 255, 157, 0.1)',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'rgba(0, 255, 157, 0.1)',
                  border: '1px solid rgba(0, 255, 157, 0.3)',
                  color: '#00ff9d',
                  padding: '10px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 style={{
                fontSize: '24px',
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 700,
                color: '#00ff9d',
                letterSpacing: '2px'
              }}>
                MES FAVORIS
              </h1>
              <p style={{
                fontSize: '12px',
                color: 'rgba(228, 231, 235, 0.6)',
                fontFamily: '"Roboto Mono", monospace'
              }}>
                {filteredFavorites.length} / {favorites.length} articles
              </p>
            </div>
          </div>
          <button className="btn-dark btn-primary-dark" onClick={openAddModal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} />
              Ajouter
            </div>
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.1)',
            color: '#ff4757',
            padding: '16px 32px',
            margin: '20px 32px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255, 71, 87, 0.3)'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Grille des favoris */}
        <div style={{ padding: '32px' }}>
          {filteredFavorites.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'rgba(228, 231, 235, 0.4)'
            }}>
              <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: '"Rajdhani", sans-serif' }}>
                AUCUN ARTICLE TROUVÉ
              </h3>
              <p style={{ fontFamily: '"Roboto Mono", monospace', fontSize: '13px' }}>
                Ajoutez votre premier favori ou modifiez vos filtres
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {filteredFavorites.map((favorite, index) => (
                <div
                  key={favorite.id}
                  className="card-dark animate-in-left"
                  style={{
                    padding: '24px',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {/* Photo du favori - supporte plusieurs noms de champs */}
                  {(favorite.photoUrl || favorite.photo || favorite.imageUrl || (favorite.photos && favorite.photos[0])) && (
                    <div style={{
                      marginBottom: '16px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: 'rgba(0, 0, 0, 0.3)'
                    }}>
                      <img
                        src={favorite.photoUrl || favorite.photo || favorite.imageUrl || (favorite.photos && favorite.photos[0])}
                        alt={favorite.titre}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#e4e7eb',
                      flex: 1,
                      marginRight: '12px',
                      fontFamily: '"Rajdhani", sans-serif',
                      letterSpacing: '0.5px'
                    }}>
                      {favorite.titre}
                    </h3>
                    <span className={favorite.vendu ? 'badge-dark badge-sold-dark' : 'badge-dark badge-available-dark'}>
                      {favorite.vendu ? 'Vendu' : 'Dispo'}
                    </span>
                  </div>

                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '2px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <div>
                        <span style={{
                          display: 'block',
                          color: 'rgba(228, 231, 235, 0.5)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                          fontFamily: '"Roboto Mono", monospace'
                        }}>
                          Marque
                        </span>
                        <div style={{ color: '#e4e7eb', fontWeight: 600 }}>
                          {favorite.marque || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span style={{
                          display: 'block',
                          color: 'rgba(228, 231, 235, 0.5)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                          fontFamily: '"Roboto Mono", monospace'
                        }}>
                          Prix
                        </span>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#00ff9d',
                          fontFamily: '"Rajdhani", sans-serif'
                        }}>
                          {favorite.prix ? `${favorite.prix}€` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span style={{
                          display: 'block',
                          color: 'rgba(228, 231, 235, 0.5)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                          fontFamily: '"Roboto Mono", monospace'
                        }}>
                          Taille
                        </span>
                        <div style={{ color: '#e4e7eb', fontWeight: 600 }}>
                          {favorite.taille || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span style={{
                          display: 'block',
                          color: 'rgba(228, 231, 235, 0.5)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                          fontFamily: '"Roboto Mono", monospace'
                        }}>
                          Genre
                        </span>
                        <div style={{ color: '#e4e7eb', fontWeight: 600 }}>
                          {favorite.genre || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {favorite.categorie && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span style={{
                          display: 'block',
                          color: 'rgba(228, 231, 235, 0.5)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '4px',
                          fontFamily: '"Roboto Mono", monospace'
                        }}>
                          Catégorie
                        </span>
                        <div style={{ color: '#e4e7eb', fontWeight: 600 }}>
                          {favorite.categorie}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {favorite.url && (
                      <a
                        href={favorite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'rgba(0, 184, 255, 0.1)',
                          color: '#00b8ff',
                          textDecoration: 'none',
                          borderRadius: '2px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          transition: 'all 0.2s',
                          border: '1px solid rgba(0, 184, 255, 0.3)',
                          fontFamily: '"Roboto Mono", monospace'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(0, 184, 255, 0.2)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(0, 184, 255, 0.1)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        VOIR
                      </a>
                    )}
                    <button
                      onClick={() => openEditModal(favorite)}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 255, 157, 0.1)';
                        e.target.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <Edit2 size={16} color="#00ff9d" />
                    </button>
                    <button
                      onClick={() => deleteFavorite(favorite.id)}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 71, 87, 0.1)',
                        border: '1px solid rgba(255, 71, 87, 0.3)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 71, 87, 0.2)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 71, 87, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <Trash2 size={16} color="#ff4757" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL - Identique au précédent mais avec style sombre */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(8px)'
        }}
        onClick={closeModal}>
          <div 
            className="card-dark"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '40px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00ff9d',
                fontFamily: '"Rajdhani", sans-serif',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                {editingFavorite ? 'Modifier' : 'Ajouter'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: 'rgba(228, 231, 235, 0.6)'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'rgba(228, 231, 235, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Roboto Mono", monospace'
                  }}>
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titre}
                    onChange={(e) => setFormData({...formData, titre: e.target.value})}
                    placeholder="Ex: Veste en jean vintage"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: 'rgba(228, 231, 235, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Roboto Mono", monospace'
                    }}>
                      Marque
                    </label>
                    <input
                      type="text"
                      value={formData.marque}
                      onChange={(e) => setFormData({...formData, marque: e.target.value})}
                      placeholder="Ex: Levi's"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: 'rgba(228, 231, 235, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Roboto Mono", monospace'
                    }}>
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix}
                      onChange={(e) => setFormData({...formData, prix: e.target.value})}
                      placeholder="Ex: 25.00"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: 'rgba(228, 231, 235, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Roboto Mono", monospace'
                    }}>
                      Taille
                    </label>
                    <input
                      type="text"
                      value={formData.taille}
                      onChange={(e) => setFormData({...formData, taille: e.target.value})}
                      placeholder="Ex: M, 38, L"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: 'rgba(228, 231, 235, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Roboto Mono", monospace'
                    }}>
                      Genre
                    </label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                      <option value="Enfant">Enfant</option>
                      <option value="Unisexe">Unisexe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'rgba(228, 231, 235, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Roboto Mono", monospace'
                  }}>
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.categorie}
                    onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                    placeholder="Ex: Vestes, Chaussures, Accessoires"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'rgba(228, 231, 235, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Roboto Mono", monospace'
                  }}>
                    URL Vinted
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://www.vinted.fr/..."
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(0, 255, 157, 0.05)',
                  borderRadius: '2px',
                  border: '1px solid rgba(0, 255, 157, 0.1)'
                }}>
                  <input
                    type="checkbox"
                    id="vendu"
                    checked={formData.vendu}
                    onChange={(e) => setFormData({...formData, vendu: e.target.checked})}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label 
                    htmlFor="vendu"
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: 600,
                      color: '#e4e7eb',
                      cursor: 'pointer'
                    }}
                  >
                    Marquer comme vendu
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <button
                    type="button"
                    className="btn-dark btn-secondary-dark"
                    onClick={closeModal}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-dark btn-primary-dark"
                    style={{ flex: 1 }}
                  >
                    {editingFavorite ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VintedFavoritesApp;