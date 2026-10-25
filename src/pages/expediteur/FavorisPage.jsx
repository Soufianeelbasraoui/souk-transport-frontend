import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHeart,
  FiStar,
  FiTruck,
  FiPhone,
  FiCheckCircle,
  FiMessageSquare,
  FiSearch,
  FiTrash2,
  FiAward,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import favoriService from '../../api/services/favoriService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const FavorisPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favoris'); // 'favoris' | 'recommandes'
  const [favoris, setFavoris] = useState([]);
  const [recommandes, setRecommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [favData, recData] = await Promise.all([
        favoriService.getMesFavoris(),
        favoriService.getTransporteursRecommandes(),
      ]);
      setFavoris(favData);
      setRecommandes(recData);
    } catch {
      toast.error('Erreur lors du chargement des transporteurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveFavori = async (transporteurId) => {
    try {
      await favoriService.supprimerFavori(transporteurId);
      setFavoris((prev) => prev.filter((f) => f.transporteurId !== transporteurId));
      toast.info('Transporteur retiré de vos favoris.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleAddFavori = async (transporteur) => {
    try {
      await favoriService.ajouterFavori(transporteur.transporteurId || transporteur.id);
      setFavoris((prev) => [
        ...prev,
        {
          ...transporteur,
          transporteurId: transporteur.transporteurId || transporteur.id,
          dateAjout: new Date().toISOString(),
        },
      ]);
      toast.success(`${transporteur.nom} ajouté à vos favoris !`);
    } catch {
      toast.error("Erreur lors de l'ajout aux favoris.");
    }
  };

  const currentList = activeTab === 'favoris' ? favoris : recommandes;
  const filteredList = currentList.filter(
    (item) =>
      (item.nom || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.entreprise || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.villeBase || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C', margin: '0 0 6px 0' }}>
            Transporteurs Favoris & Recommandés
          </h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
            Accédez en priorité à vos partenaires de confiance et découvrez les transporteurs les plus fiables du réseau.
          </p>
        </div>

        {/* RECHERCHE */}
        <div style={{ position: 'relative', width: '280px' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#A0AEC0' }} />
          <input
            type="text"
            placeholder="Filtrer par nom, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #CBD5E0',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('favoris')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'favoris' ? '#1A3A5C' : '#718096',
            borderBottom: activeTab === 'favoris' ? '3px solid #1A3A5C' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FiHeart color={activeTab === 'favoris' ? '#E53E3E' : '#718096'} />
          Mes Favoris ({favoris.length})
        </button>

        <button
          onClick={() => setActiveTab('recommandes')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'recommandes' ? '#1A3A5C' : '#718096',
            borderBottom: activeTab === 'recommandes' ? '3px solid #1A3A5C' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FiAward color={activeTab === 'recommandes' ? '#D69E2E' : '#718096'} />
          Recommandés pour vous ({recommandes.length})
        </button>
      </div>

      {/* GRILLE DES TRANSPORTEURS */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Chargement des transporteurs...</div>
      ) : filteredList.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <FiTruck size={42} color="#A0AEC0" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#2D3748', margin: '0 0 6px 0' }}>Aucun transporteur trouvé</h3>
          <p style={{ color: '#718096', margin: '0 0 16px 0' }}>
            {activeTab === 'favoris'
              ? "Vous n'avez pas encore ajouté de transporteur à vos favoris."
              : 'Aucune recommandation pour le moment.'}
          </p>
          {activeTab === 'favoris' && (
            <Button variant="primary" onClick={() => setActiveTab('recommandes')}>
              Découvrir les transporteurs recommandés
            </Button>
          )}
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredList.map((t) => {
            const isFav = favoris.some((f) => f.transporteurId === (t.transporteurId || t.id));
            return (
              <Card key={t.transporteurId || t.id} style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                {/* EN-TÊTE CARTE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#1A3A5C',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}>
                      {(t.nom || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1A202C' }}>
                        {t.nom}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
                        {t.entreprise || 'Transporteur Partenaire'}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'favoris' ? (
                    <button
                      onClick={() => handleRemoveFavori(t.transporteurId)}
                      title="Retirer des favoris"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', padding: '4px' }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => (isFav ? handleRemoveFavori(t.transporteurId || t.id) : handleAddFavori(t))}
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#E53E3E' : '#CBD5E0', padding: '4px' }}
                    >
                      <FiHeart size={20} fill={isFav ? '#E53E3E' : 'none'} />
                    </button>
                  )}
                </div>

                {/* STATS & BADGES */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FEFCBF',
                    color: '#975A16',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    <FiStar fill="#D69E2E" color="#D69E2E" size={12} /> {t.noteMoyenne || 4.8} ({t.nombreAvis || 32} avis)
                  </span>

                  <Badge variant="success">
                    <FiCheckCircle style={{ marginRight: 4 }} /> Vérifié KYC
                  </Badge>

                  <span style={{
                    backgroundColor: '#EDF2F7',
                    color: '#4A5568',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                  }}>
                    📍 {t.villeBase || 'Casablanca'}
                  </span>
                </div>

                {/* INFOS VÉHICULE & FLOTTE */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#4A5568',
                  marginBottom: '16px',
                  flex: 1,
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Camion :</strong> {t.camionPrincipal || 'Semi-remorque bâché'}
                  </div>
                  <div>
                    <strong>Missions réussies :</strong> {t.nombreTrajetsRealises || 60}+ livraisons
                  </div>
                </div>

                {/* BOUTONS D'ACTION */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ flex: 1, gap: 6 }}
                    onClick={() => navigate(`/chat`)}
                  >
                    <FiMessageSquare /> Contacter
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1, gap: 6 }}
                    onClick={() => navigate('/expediteur/trajets')}
                  >
                    <FiTruck /> Voir Trajets
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavorisPage;
