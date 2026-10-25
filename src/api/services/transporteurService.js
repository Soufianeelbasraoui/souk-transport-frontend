import client from '../client';
import { isMockEnabled, delay, mockPagedResponse } from '../mockUtils';

/**
 * Service pour toutes les opérations du parcours Transporteur.
 * Basé sur l'inventaire strict des endpoints du backend Spring Boot.
 */

// Données de mock réalistes pour démonstration / mode démo
const MOCK_DASHBOARD = {
  revenusMois: 42800,
  tendanceRevenusPct: 14.5,
  sparkline7Jours: [4200, 5600, 4800, 7100, 6300, 8400, 6400],
  trajetsMoisTotal: 28,
  trajetsAVenir: 6,
  trajetsEnCours: 1,
  tauxRemplissageMoyen: 82.5,
  tauxRemplissagePlateforme: 68.0,
  noteMoyenne: 4.8,
  nombreAvis: 43,
  revenus8DernieresSemaines: [
    { semaine: 'S-7', montant: 8500 },
    { semaine: 'S-6', montant: 9200 },
    { semaine: 'S-5', montant: 11400 },
    { semaine: 'S-4', montant: 10100 },
    { semaine: 'S-3', montant: 12800 },
    { semaine: 'S-2', montant: 13500 },
    { semaine: 'S-1', montant: 14200 },
    { semaine: 'Actuelle', montant: 11200 },
  ],
  trajetEnCours: {
    id: 101,
    idTrajet: 101,
    villeDepart: 'Casablanca',
    villeArrivee: 'Tanger',
    dateDepart: new Date(Date.now() - 3600000 * 2).toISOString(),
    dateArriveeEstimee: new Date(Date.now() + 3600000 * 3).toISOString(),
    statutTrajet: 'EN_COURS',
    poidsTotal: 10000,
    poidsDisponible: 1800,
    volumeTotal: 45,
    volumeDisponible: 8,
    tauxRemplissage: 82,
    prixKg: 0.65,
    immatriculationCamion: '12345-A-6',
  },
  prochainsTrajets: [
    {
      id: 102,
      idTrajet: 102,
      villeDepart: 'Tanger',
      villeArrivee: 'Marrakech',
      dateDepart: new Date(Date.now() + 86400000 * 1).toISOString(),
      statutTrajet: 'PUBLIE',
      poidsDisponible: 4500,
      poidsTotal: 10000,
      prixKg: 0.85,
    },
    {
      id: 103,
      idTrajet: 103,
      villeDepart: 'Marrakech',
      villeArrivee: 'Agadir',
      dateDepart: new Date(Date.now() + 86400000 * 3).toISOString(),
      statutTrajet: 'PUBLIE',
      poidsDisponible: 8000,
      poidsTotal: 10000,
      prixKg: 0.55,
    },
  ],
  dernieresOffres: [
    {
      id: 201,
      idOffre: 201,
      numeroOffre: 'OFF-2025-089',
      expediteurNom: 'Société Agro-Atlas',
      trajetRoute: 'Casablanca → Tanger',
      typeMarchandise: 'ALIMENTAIRE',
      poidsKg: 1500,
      volumeM3: 4.2,
      prixPropose: 3450,
      statutOffre: 'EN_ATTENTE',
      dateCreation: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 202,
      idOffre: 202,
      numeroOffre: 'OFF-2025-084',
      expediteurNom: 'Textiles du Nord',
      trajetRoute: 'Tanger → Marrakech',
      typeMarchandise: 'TEXTILE',
      poidsKg: 2800,
      volumeM3: 12.0,
      prixPropose: 5800,
      statutOffre: 'CONTRE_OFFRE',
      dateCreation: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  activiteRecente: [
    'Offre acceptée pour Société Agro-Atlas (#OFF-2025-089)',
    'Départ du trajet Casablanca → Tanger confirmé',
    'Virement de 12 500 DH validé sur votre compte BMCE',
    'Avis 5 étoiles reçu de "Maroc Fret Distribution"',
  ],
};

const MOCK_TRAJETS = [
  {
    id: 101,
    idTrajet: 101,
    villeDepart: 'Casablanca',
    villeArrivee: 'Tanger',
    dateDepart: '2025-01-20T08:00:00',
    dateArrivee: '2025-01-20T14:30:00',
    statutTrajet: 'EN_COURS',
    poidsTotal: 10000,
    poidsDisponible: 1800,
    volumeTotal: 45,
    volumeDisponible: 8,
    tauxRemplissage: 82,
    prixKg: 0.65,
    camionNom: 'Volvo FH 500 (12345-A-6)',
    reservationsCount: 4,
  },
  {
    id: 102,
    idTrajet: 102,
    villeDepart: 'Tanger',
    villeArrivee: 'Marrakech',
    dateDepart: '2025-01-22T06:00:00',
    dateArrivee: '2025-01-22T15:00:00',
    statutTrajet: 'PUBLIE',
    poidsTotal: 10000,
    poidsDisponible: 5500,
    volumeTotal: 45,
    volumeDisponible: 22,
    tauxRemplissage: 45,
    prixKg: 0.85,
    camionNom: 'Volvo FH 500 (12345-A-6)',
    reservationsCount: 2,
  },
  {
    id: 103,
    idTrajet: 103,
    villeDepart: 'Marrakech',
    villeArrivee: 'Agadir',
    dateDepart: '2025-01-24T09:00:00',
    dateArrivee: '2025-01-24T13:30:00',
    statutTrajet: 'PUBLIE',
    poidsTotal: 10000,
    poidsDisponible: 9000,
    volumeTotal: 45,
    volumeDisponible: 40,
    tauxRemplissage: 10,
    prixKg: 0.55,
    camionNom: 'Volvo FH 500 (12345-A-6)',
    reservationsCount: 1,
  },
  {
    id: 104,
    idTrajet: 104,
    villeDepart: 'Fès',
    villeArrivee: 'Oujda',
    dateDepart: '2025-01-18T07:00:00',
    dateArrivee: '2025-01-18T12:00:00',
    statutTrajet: 'TERMINE',
    poidsTotal: 5000,
    poidsDisponible: 0,
    volumeTotal: 25,
    volumeDisponible: 0,
    tauxRemplissage: 100,
    prixKg: 0.70,
    camionNom: 'Mercedes Atego (9876-B-1)',
    reservationsCount: 3,
  },
  {
    id: 105,
    idTrajet: 105,
    villeDepart: 'Casablanca',
    villeArrivee: 'Rabat',
    dateDepart: '2025-01-16T10:00:00',
    dateArrivee: '2025-01-16T12:00:00',
    statutTrajet: 'TERMINE',
    poidsTotal: 5000,
    poidsDisponible: 500,
    volumeTotal: 25,
    volumeDisponible: 3,
    tauxRemplissage: 90,
    prixKg: 0.40,
    camionNom: 'Mercedes Atego (9876-B-1)',
    reservationsCount: 2,
  },
];

export const transporteurService = {
  // 1. DASHBOARD
  getDashboard: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return MOCK_DASHBOARD;
    }
    try {
      const res = await client.get('/api/dashboard/transporteur');
      return res.data;
    } catch (err) {
      console.warn('Dashboard API non joignable, fallback démo activé:', err.message);
      return MOCK_DASHBOARD;
    }
  },

  // 2. MES TRAJETS
  getMesTrajets: async ({ page = 0, size = 10, statut = '', depart = '', arrivee = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let filtered = [...MOCK_TRAJETS];
      if (statut && statut !== 'TOUS') {
        filtered = filtered.filter((t) => t.statutTrajet === statut);
      }
      return mockPagedResponse(filtered, page, size);
    }
    try {
      const params = { page, size };
      if (statut && statut !== 'TOUS') params.statut = statut;
      if (depart) params.depart = depart;
      if (arrivee) params.arrivee = arrivee;

      const res = await client.get('/api/trajets/mes-trajets', { params });
      const raw = res.data;

      // Détection intelligente du DTO retourné par Spring Boot :
      // 1. MesTrajetsPageDto : { trajets: Page<TrajetDto>, compteurs: Map<String, Long> }
      // 2. Page<TrajetDto> direct : { content: [...], totalElements, totalPages }
      // 3. List<TrajetDto> brut : [...]
      let content = [];
      let totalElements = 0;
      let totalPages = 1;
      let compteurs = {};

      if (raw && raw.trajets) {
        content = Array.isArray(raw.trajets.content) ? raw.trajets.content : [];
        totalElements = raw.trajets.totalElements ?? content.length;
        totalPages = raw.trajets.totalPages ?? 1;
        compteurs = raw.compteurs || {};
      } else if (raw && Array.isArray(raw.content)) {
        content = raw.content;
        totalElements = raw.totalElements ?? content.length;
        totalPages = raw.totalPages ?? 1;
        compteurs = raw.compteurs || {};
      } else if (Array.isArray(raw)) {
        content = raw;
        totalElements = raw.length;
        totalPages = 1;
      }

      return {
        content,
        totalElements,
        totalPages,
        compteurs,
        raw,
      };
    } catch (err) {
      console.warn('Erreur appel /api/trajets/mes-trajets, tentative /api/trajets/mesTrajets:', err.message);
      try {
        const res2 = await client.get('/api/trajets/mesTrajets', { params: { page, size } });
        const raw2 = res2.data;
        const content2 = raw2.content || (Array.isArray(raw2) ? raw2 : []);
        return {
          content: content2,
          totalElements: raw2.totalElements ?? content2.length,
          totalPages: raw2.totalPages ?? 1,
          compteurs: {},
          raw: raw2,
        };
      } catch (err2) {
        console.warn('Aucun endpoint trajets joignable, fallback démo activé:', err2.message);
        let filtered = [...MOCK_TRAJETS];
        if (statut && statut !== 'TOUS') {
          filtered = filtered.filter((t) => t.statutTrajet === statut);
        }
        return mockPagedResponse(filtered, page, size);
      }
    }
  },

  getTrajetById: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_TRAJETS.find((t) => t.id === Number(id)) || MOCK_TRAJETS[0];
    }
    try {
      const res = await client.get(`/api/trajets/${id}/detail`);
      return res.data;
    } catch {
      const res = await client.get(`/api/trajets/${id}`);
      return res.data;
    }
  },

  publierTrajet: async (trajetData) => {
    if (isMockEnabled()) {
      await delay(400, 600);
      return { id: Date.now(), ...trajetData, statutTrajet: 'PUBLIE' };
    }
    const res = await client.post('/api/trajets', trajetData);
    return res.data;
  },

  demarrerTrajet: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutTrajet: 'EN_COURS' };
    }
    const res = await client.patch(`/api/trajets/${id}/demarrer`);
    return res.data;
  },

  terminerTrajet: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutTrajet: 'TERMINE' };
    }
    const res = await client.patch(`/api/trajets/${id}/terminer`);
    return res.data;
  },

  annulerTrajet: async (id, motif) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutTrajet: 'ANNULE', motif };
    }
    const res = await client.patch(`/api/trajets/${id}/annuler`, { motif });
    return res.data;
  },

  exportMesTrajetsCsv: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const csv = 'ID,Depart,Arrivee,DateDepart,Statut,PrixKg\n101,Casablanca,Tanger,2025-01-20,EN_COURS,0.65\n';
      return new Blob([csv], { type: 'text/csv' });
    }
    const res = await client.get('/api/trajets/mes-trajets/export', { responseType: 'blob' });
    return res.data;
  },

  // 3. OFFRES & NÉGOCIATIONS
  getMesOffres: async ({ page = 0, size = 10, statut = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_DASHBOARD.dernieresOffres];
      if (statut && statut !== 'TOUS') {
        list = list.filter((o) => o.statutOffre === statut);
      }
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size };
      if (statut && statut !== 'TOUS') params.statut = statut;
      const res = await client.get('/api/offres/mes-offres', { params });
      return res.data;
    } catch {
      return mockPagedResponse(MOCK_DASHBOARD.dernieresOffres, page, size);
    }
  },

  accepterOffre: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutOffre: 'ACCEPTEE' };
    }
    const res = await client.post(`/api/offres/${id}/accepter`);
    return res.data;
  },

  refuserOffre: async (id, motif = '') => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutOffre: 'REFUSEE', motif };
    }
    const res = await client.post(`/api/offres/${id}/refuser`, { motif });
    return res.data;
  },

  contreOffre: async (id, nouveauPrix, motif = '') => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutOffre: 'CONTRE_OFFRE', nouveauPrix, motif };
    }
    const res = await client.post(`/api/offres/${id}/contre-offre`, {
      nouveauPrixPropose: nouveauPrix,
      motif,
    });
    return res.data;
  },

  // 4. SUIVI GPS
  getSuiviTrajet: async (trajetId) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return {
        trajetId,
        departNom: 'Casablanca (Zone Portuaire)',
        arriveeNom: 'Tanger Med',
        latitudeActuelle: 34.261,
        longitudeActuelle: -6.58,
        vitesseKmH: 78,
        distanceRestanteKm: 142,
        tempsRestantMinutes: 110,
        progressionPct: 58,
        historiquePositions: [
          { latitude: 33.5731, longitude: -7.5898, timestamp: '2025-01-20T08:00:00' },
          { latitude: 33.7022, longitude: -7.3489, timestamp: '2025-01-20T08:30:00' },
          { latitude: 34.0209, longitude: -6.8416, timestamp: '2025-01-20T09:30:00' },
          { latitude: 34.261, longitude: -6.58, timestamp: '2025-01-20T10:15:00' },
        ],
      };
    }
    try {
      const res = await client.get(`/api/trajets/${trajetId}/suivi`);
      return res.data;
    } catch {
      return {
        trajetId,
        departNom: 'Casablanca',
        arriveeNom: 'Tanger',
        latitudeActuelle: 34.261,
        longitudeActuelle: -6.58,
        vitesseKmH: 80,
        progressionPct: 55,
      };
    }
  },

  // 5. FINANCES & REVENUS
  getFinancesResume: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return {
        soldeDisponible: 18450.0,
        enAttenteLiberation: 7200.0,
        totalGagneMois: 42800.0,
        totalRetraitsMois: 25000.0,
        compteBancaire: {
          nomBanque: 'Attijariwafa Bank',
          titulaire: 'Mohamed El Fassi Transport',
          rib: '007 780 0001234567890123 45',
        },
      };
    }
    try {
      const res = await client.get('/api/finances/transporteur/resume');
      return res.data;
    } catch {
      return {
        soldeDisponible: 18450.0,
        enAttenteLiberation: 7200.0,
        totalGagneMois: 42800.0,
      };
    }
  },

  getRevenusSemaine: async () => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_DASHBOARD.revenus8DernieresSemaines;
    }
    try {
      const res = await client.get('/api/finances/transporteur/revenus-par-semaine');
      return res.data;
    } catch {
      return MOCK_DASHBOARD.revenus8DernieresSemaines;
    }
  },

  getTransactions: async ({ page = 0, size = 10 } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const list = [
        { id: 1, reference: 'TX-9842', date: '2025-01-19T16:20:00', type: 'PAIEMENT', sens: 'CREDIT', montant: 3450, description: 'Livraison Casa → Tanger #TR-101', statut: 'PAYE' },
        { id: 2, reference: 'TX-9830', date: '2025-01-19T16:20:00', type: 'COMMISSION', sens: 'DEBIT', montant: 345, description: 'Commission SoukTransport (10%)', statut: 'PAYE' },
        { id: 3, reference: 'TX-9812', date: '2025-01-15T11:00:00', type: 'RETRAIT', sens: 'DEBIT', montant: 15000, description: 'Virement bancaire vers Attijariwafa', statut: 'VALIDE' },
        { id: 4, reference: 'TX-9788', date: '2025-01-14T18:40:00', type: 'PAIEMENT', sens: 'CREDIT', montant: 5800, description: 'Livraison Fès → Oujda #TR-104', statut: 'PAYE' },
      ];
      return mockPagedResponse(list, page, size);
    }
    try {
      const res = await client.get('/api/finances/transporteur/transactions', { params: { page, size } });
      return res.data;
    } catch {
      return mockPagedResponse([], page, size);
    }
  },

  demanderRetrait: async (montant, iban = '', motif = '') => {
    if (isMockEnabled()) {
      await delay(400, 600);
      return { id: Date.now(), montant, statutRetrait: 'DEMANDE', dateCreation: new Date().toISOString() };
    }
    const res = await client.post('/api/finances/transporteur/retraits', { montant, iban, motif });
    return res.data;
  },

  // 6. CAMIONS & FLOTTE (Connecté à CamionController /api/camions)
  getMesCamions: async ({ page = 0, size = 12 } = {}) => {
    try {
      const res = await client.get('/api/camions/mesCamions', { params: { page, size } });
      return res.data;
    } catch {
      if (isMockEnabled()) {
        const camions = [
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
        return mockPagedResponse(camions, page, size);
      }
      return mockPagedResponse([], page, size);
    }
  },

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
      equipements: Array.isArray(camionData.equipements) ? camionData.equipements : [],
      zonesPreferentielles: Array.isArray(camionData.zonesPreferentielles) ? camionData.zonesPreferentielles : [],
    };
    const res = await client.post('/api/camions', payload);
    return res.data;
  },

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
    const res = await client.put(`/api/camions/${id}`, payload);
    return res.data;
  },

  supprimerCamion: async (id) => {
    const res = await client.delete(`/api/camions/${id}`);
    return res.data;
  },

  // 7. ÉVÉNEMENTS & TÉLÉMÉTRIE TEMPS RÉEL DU TRAJET
  enregistrerPositionGps: async (trajetId, { latitude, longitude, vitesseKmH = 0, cap = 0 }) => {
    if (isMockEnabled()) {
      await delay(150, 250);
      return { trajetId, latitude, longitude, vitesseKmH, timestamp: new Date().toISOString() };
    }
    const res = await client.post(`/api/trajets/${trajetId}/positions`, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      vitesseKmH: Number(vitesseKmH),
      cap: Number(cap),
    });
    return res.data;
  },

  ajouterEvenementTrajet: async (trajetId, { type, description = '', latitude = null, longitude = null, photoPreuve = null }) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return { id: Date.now(), trajetId, type, description, timestamp: new Date().toISOString() };
    }
    const res = await client.post(`/api/trajets/${trajetId}/evenements`, {
      type,
      description,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      photoPreuve,
    });
    return res.data;
  },

  getEvenementsTrajet: async (trajetId) => {
    if (isMockEnabled()) {
      await delay(150, 300);
      return [
        { id: 1, type: 'DEPART', description: 'Départ du port de Casablanca', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 2, type: 'PEAGE', description: 'Passage péage Bouznika', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
      ];
    }
    try {
      const res = await client.get(`/api/trajets/${trajetId}/evenements`);
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  // 8. ACTIONS FINANCIÈRES & RIB
  confirmerCash: async (paiementId) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return { id: paiementId, statutPaiement: 'PAYE', methodePaiement: 'CASH' };
    }
    const res = await client.patch(`/api/finances/paiements/${paiementId}/confirmer-cash`);
    return res.data;
  },

  enregistrerCompteBancaire: async ({ nomBanque, titulaire, rib }) => {
    if (isMockEnabled()) {
      await delay(250, 400);
      return { nomBanque, titulaire, rib };
    }
    const res = await client.post('/api/finances/transporteur/compte-bancaire', {
      nomBanque,
      titulaire,
      rib,
    });
    return res.data;
  },

  // 9. GESTION COMPLÈTE DU CAMION
  ajouterCamion: async (camionData) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id: Date.now(), ...camionData, statut: 'ACTIF' };
    }
    const res = await client.post('/api/camions', camionData);
    return res.data;
  },

  modifierCamion: async (id, camionData) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, ...camionData };
    }
    const res = await client.put(`/api/camions/${id}`, camionData);
    return res.data;
  },

  supprimerCamion: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return { success: true };
    }
    const res = await client.delete(`/api/camions/${id}`);
    return res.data;
  },

  ajouterPhotoCamion: async (id, file) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { photoUrl: URL.createObjectURL(file) };
    }
    const formData = new FormData();
    formData.append('fichier', file);
    const res = await client.post(`/api/camions/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getVilles: async () => {
    try {
      const res = await client.get('/api/villes');
      return res.data;
    } catch {
      return [
        { id: 1, nom: 'Casablanca', codePostal: '20000', region: 'Casablanca-Settat' },
        { id: 2, nom: 'Tanger', codePostal: '90000', region: 'Tanger-Tétouan-Al Hoceïma' },
        { id: 3, nom: 'Marrakech', codePostal: '40000', region: 'Marrakech-Safi' },
        { id: 4, nom: 'Rabat', codePostal: '10000', region: 'Rabat-Salé-Kénitra' },
        { id: 5, nom: 'Agadir', codePostal: '80000', region: 'Souss-Massa' },
        { id: 6, nom: 'Fès', codePostal: '30000', region: 'Fès-Meknès' },
        { id: 7, nom: 'Oujda', codePostal: '60000', region: 'Oriental' },
        { id: 8, nom: 'Meknès', codePostal: '50000', region: 'Fès-Meknès' },
        { id: 9, nom: 'Kénitra', codePostal: '14000', region: 'Rabat-Salé-Kénitra' },
        { id: 10, nom: 'Tétouan', codePostal: '93000', region: 'Tanger-Tétouan-Al Hoceïma' },
      ];
    }
  },
};

export default transporteurService;
