import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour la gestion des transporteurs favoris et recommandations intelligentes.
 * Aligné sur FavoriController Spring Boot :
 * - POST   /api/favoris/{transporteurId}
 * - DELETE /api/favoris/{transporteurId}
 * - GET    /api/favoris
 * - GET    /api/transporteurs/recommandes
 */

const MOCK_FAVORIS = [
  {
    id: 1,
    transporteurId: 1,
    nom: 'Mohamed El Fassi',
    entreprise: 'El Fassi Logistique SARL',
    telephone: '+212 6 61 22 33 44',
    villeBase: 'Casablanca',
    noteMoyenne: 4.9,
    nombreAvis: 48,
    nombreTrajetsRealises: 124,
    badgeVerifie: true,
    camionPrincipal: 'Volvo FH 500 (Semi-remorque)',
    equipements: ['GPS', 'HAYON', 'BACHE'],
    dateAjout: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 2,
    transporteurId: 2,
    nom: 'Karim Bennani',
    entreprise: 'Trans-Atlas Express',
    telephone: '+212 6 62 88 99 00',
    villeBase: 'Tanger',
    noteMoyenne: 4.8,
    nombreAvis: 35,
    nombreTrajetsRealises: 89,
    badgeVerifie: true,
    camionPrincipal: 'Mercedes-Benz Actros 1845',
    equipements: ['GPS', 'FRIGO', 'DOUBLE_EQUIPAGE'],
    dateAjout: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const MOCK_RECOMMANDES = [
  {
    id: 3,
    transporteurId: 3,
    nom: 'Youssef Mansouri',
    entreprise: 'Souss Fret Distribution',
    telephone: '+212 6 63 44 55 66',
    villeBase: 'Agadir',
    noteMoyenne: 4.7,
    nombreAvis: 29,
    nombreTrajetsRealises: 67,
    badgeVerifie: true,
    camionPrincipal: 'Scania R450',
    tauxPonctualite: 98,
    specialite: 'Primeurs & Frigo Sud-Maroc',
  },
  {
    id: 4,
    transporteurId: 4,
    nom: 'Adil Tazi',
    entreprise: 'Nord-Est Transit Logistique',
    telephone: '+212 6 64 77 88 99',
    villeBase: 'Fès',
    noteMoyenne: 4.8,
    nombreAvis: 42,
    nombreTrajetsRealises: 95,
    badgeVerifie: true,
    camionPrincipal: 'MAN TGX 18.480',
    tauxPonctualite: 96,
    specialite: 'Textile & Fret Général',
  },
];

export const favoriService = {
  getMesFavoris: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_FAVORIS;
    }
    try {
      const res = await client.get('/api/favoris');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn('API /api/favoris non joignable, fallback démo:', err.message);
      return MOCK_FAVORIS;
    }
  },

  getTransporteursRecommandes: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_RECOMMANDES;
    }
    try {
      const res = await client.get('/api/transporteurs/recommandes');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return MOCK_RECOMMANDES;
    }
  },

  ajouterFavori: async (transporteurId) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      const exist = MOCK_FAVORIS.find((f) => f.transporteurId === Number(transporteurId));
      if (!exist) {
        MOCK_FAVORIS.push({
          id: Date.now(),
          transporteurId: Number(transporteurId),
          nom: 'Transporteur Partenaire',
          entreprise: 'Transport SARL',
          villeBase: 'Maroc',
          noteMoyenne: 4.8,
          badgeVerifie: true,
          dateAjout: new Date().toISOString(),
        });
      }
      return { success: true };
    }
    const res = await client.post(`/api/favoris/${transporteurId}`);
    return res.data;
  },

  supprimerFavori: async (transporteurId) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      const idx = MOCK_FAVORIS.findIndex((f) => f.transporteurId === Number(transporteurId));
      if (idx !== -1) MOCK_FAVORIS.splice(idx, 1);
      return { message: 'Transporteur retiré des favoris.' };
    }
    const res = await client.delete(`/api/favoris/${transporteurId}`);
    return res.data;
  },
};

export default favoriService;
