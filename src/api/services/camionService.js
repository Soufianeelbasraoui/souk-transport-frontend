import client from '../client';
import { isMockEnabled, delay, mockPagedResponse } from '../mockUtils';

/**
 * Service API pour la gestion complète des camions et de la flotte.
 * Aligné directement sur CamionController Spring Boot :
 * - GET    /api/camions/mesCamions
 * - GET    /api/camions/types
 * - GET    /api/camions/{id}
 * - POST   /api/camions
 * - PUT    /api/camions/{id}
 * - DELETE /api/camions/{id}
 * - PATCH  /api/camions/{id}/equipements
 * - PATCH  /api/camions/{id}/zones
 * - POST   /api/camions/{id}/photos
 */

export const TYPE_CAMIONS_LABELS = {
  FOURGON: 'Fourgon (1.5t)',
  CAMION_3T: 'Camionnette 3.5t',
  CAMION_5T: 'Porteur 5t',
  CAMION_10T: 'Porteur 10t',
  CAMION_15T: 'Porteur 15t',
  CAMION_20T: 'Porteur 20t',
  PLATEAU: 'Plateau',
  BENNE: 'Benne',
  FRIGORIFIQUE: 'Frigorifique',
  CITERNE: 'Citerne',
  PORTE_CONTENEUR: 'Porte-conteneur',
  PORTE_VOITURES: 'Porte-voitures',
  SEMI: 'Semi-remorque (38t-40t)',
};

export const EQUIPEMENTS_LABELS = {
  HAYON: 'Hayon élévateur',
  REFRIGERATION: 'Groupe frigorifique (-20°C / +4°C)',
  GPS: 'Traceur GPS connecté',
  BACHE: 'Bâche coulissante (Rideaux)',
};

const MOCK_CAMIONS_FALLBACK = [
  {
    id: 1,
    marque: 'Volvo',
    modele: 'FH 500 Globetrotter',
    immatriculation: '12345-A-6',
    type: 'SEMI',
    typeCamion: 'SEMI',
    annee: 2022,
    capacite: 24000,
    chargeUtileKg: 24000,
    volumeCapacite: 85,
    volumeM3: 85,
    disponible: true,
    equipements: ['GPS', 'HAYON', 'BACHE'],
    zonesPreferentielles: ['Casablanca-Settat', 'Tanger-Tétouan-Al Hoceïma', 'Marrakech-Safi'],
  },
  {
    id: 2,
    marque: 'Mercedes-Benz',
    modele: 'Atego 1224',
    immatriculation: '9876-B-1',
    type: 'CAMION_10T',
    typeCamion: 'CAMION_10T',
    annee: 2020,
    capacite: 10000,
    chargeUtileKg: 10000,
    volumeCapacite: 42,
    volumeM3: 42,
    disponible: true,
    equipements: ['GPS', 'REFRIGERATION'],
    zonesPreferentielles: ['Fès-Meknès', 'Oriental', 'Rabat-Salé-Kénitra'],
  },
];

export const camionService = {
  /**
   * Récupère la liste des types de camions supportés par le backend
   */
  getTypesCamion: async () => {
    if (isMockEnabled()) {
      return Object.keys(TYPE_CAMIONS_LABELS);
    }
    try {
      const res = await client.get('/api/camions/types');
      return Array.isArray(res.data) ? res.data : Object.keys(TYPE_CAMIONS_LABELS);
    } catch (err) {
      console.warn('API /api/camions/types fallback:', err.message);
      return Object.keys(TYPE_CAMIONS_LABELS);
    }
  },

  /**
   * Récupère les camions du transporteur connecté depuis la base de données
   */
  getMesCamions: async ({ page = 0, size = 12 } = {}) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return mockPagedResponse(MOCK_CAMIONS_FALLBACK, page, size);
    }
    try {
      const res = await client.get('/api/camions/mesCamions', { params: { page, size } });
      const data = res.data;
      if (Array.isArray(data)) {
        return {
          content: data,
          totalElements: data.length,
          totalPages: 1,
        };
      }
      return data;
    } catch (err) {
      console.warn('API /api/camions/mesCamions erreur, tentative fallback:', err.message);
      return mockPagedResponse(MOCK_CAMIONS_FALLBACK, page, size);
    }
  },

  /**
   * Consulte le détail d'un camion spécifique par ID
   */
  consulterCamion: async (id) => {
    if (isMockEnabled()) {
      await delay(150, 250);
      return MOCK_CAMIONS_FALLBACK.find((c) => c.id === Number(id)) || MOCK_CAMIONS_FALLBACK[0];
    }
    const res = await client.get(`/api/camions/${id}`);
    return res.data;
  },

  /**
   * Crée un nouveau camion dans la base de données (Spring Boot POST /api/camions)
   */
  ajouterCamion: async (camionData) => {
    const payload = {
      marque: camionData.marque?.trim(),
      modele: camionData.modele?.trim(),
      type: camionData.type || camionData.typeCamion || 'SEMI',
      immatriculation: camionData.immatriculation?.trim().toUpperCase(),
      capacite: Number(camionData.capacite ?? camionData.chargeUtileKg ?? 20000),
      volumeCapacite: Number(camionData.volumeCapacite ?? camionData.volumeM3 ?? 60),
      annee: camionData.annee ? Number(camionData.annee) : new Date().getFullYear(),
      photoPrincipale: camionData.photoPrincipale || null,
      disponible: camionData.disponible !== undefined ? camionData.disponible : true,
      transporteurId: camionData.transporteurId ? Number(camionData.transporteurId) : null,
      equipements: Array.isArray(camionData.equipements) ? camionData.equipements : [],
      zonesPreferentielles: Array.isArray(camionData.zonesPreferentielles) ? camionData.zonesPreferentielles : [],
    };

    if (isMockEnabled()) {
      await delay(300, 500);
      const newCamion = {
        id: Date.now(),
        ...payload,
        chargeUtileKg: payload.capacite,
        volumeM3: payload.volumeCapacite,
        typeCamion: payload.type,
      };
      MOCK_CAMIONS_FALLBACK.push(newCamion);
      return newCamion;
    }

    const res = await client.post('/api/camions', payload);
    return res.data;
  },

  /**
   * Met à jour un camion existant dans la base de données (PUT /api/camions/{id})
   */
  modifierCamion: async (id, camionData) => {
    const payload = {
      marque: camionData.marque?.trim(),
      modele: camionData.modele?.trim(),
      type: camionData.type || camionData.typeCamion || 'SEMI',
      immatriculation: camionData.immatriculation?.trim().toUpperCase(),
      capacite: Number(camionData.capacite ?? camionData.chargeUtileKg ?? 20000),
      volumeCapacite: Number(camionData.volumeCapacite ?? camionData.volumeM3 ?? 60),
      annee: camionData.annee ? Number(camionData.annee) : null,
      photoPrincipale: camionData.photoPrincipale || null,
      disponible: camionData.disponible !== undefined ? camionData.disponible : true,
      equipements: Array.isArray(camionData.equipements) ? camionData.equipements : [],
      zonesPreferentielles: Array.isArray(camionData.zonesPreferentielles) ? camionData.zonesPreferentielles : [],
    };

    if (isMockEnabled()) {
      await delay(250, 400);
      const idx = MOCK_CAMIONS_FALLBACK.findIndex((c) => c.id === Number(id));
      if (idx !== -1) {
        MOCK_CAMIONS_FALLBACK[idx] = { ...MOCK_CAMIONS_FALLBACK[idx], ...payload };
        return MOCK_CAMIONS_FALLBACK[idx];
      }
      return payload;
    }

    const res = await client.put(`/api/camions/${id}`, payload);
    return res.data;
  },

  /**
   * Supprime un camion de la flotte (DELETE /api/camions/{id})
   */
  supprimerCamion: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      const idx = MOCK_CAMIONS_FALLBACK.findIndex((c) => c.id === Number(id));
      if (idx !== -1) MOCK_CAMIONS_FALLBACK.splice(idx, 1);
      return { success: true };
    }
    const res = await client.delete(`/api/camions/${id}`);
    return res.data;
  },

  /**
   * Met à jour les équipements d'un camion (PATCH /api/camions/{id}/equipements)
   */
  modifierEquipements: async (id, equipements) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      return { id, equipements };
    }
    const res = await client.patch(`/api/camions/${id}/equipements`, equipements);
    return res.data;
  },

  /**
   * Met à jour les zones de desserte d'un camion (PATCH /api/camions/{id}/zones)
   */
  modifierZones: async (id, zones) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      return { id, zones };
    }
    const res = await client.patch(`/api/camions/${id}/zones`, zones);
    return res.data;
  },

  /**
   * Ajoute une photo à la galerie du camion (POST /api/camions/{id}/photos)
   */
  ajouterPhoto: async (id, photoUrl) => {
    if (isMockEnabled()) {
      await delay(200, 300);
      return { id, photoUrl };
    }
    const res = await client.post(`/api/camions/${id}/photos`, { url: photoUrl });
    return res.data;
  },
};

export default camionService;
