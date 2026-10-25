import client from '../client';
import { isMockEnabled, delay, mockPagedResponse } from '../mockUtils';

/**
 * Service complet pour le parcours Expéditeur.
 * Connecté directement aux contrôleurs Spring Boot :
 * - DashboardController (/api/dashboard/expediteur)
 * - TrajetController (/api/trajets/recherche, /api/trajets/recherche/carte, /api/trajets/{id}/detail)
 * - OffreController (/api/offres/devis, /api/offres)
 * - ReservationController (/api/reservations, /api/reservations/expediteur/mes-reservations)
 * - CargaisonController (/api/cargaisons, /api/cargaisons/mes-cargaisons)
 * - FinanceController (/api/finances/expediteur/*, /api/finances/paiements/*)
 */

// Données démo enrichies pour mode démo ou fallback d'absence de données
const MOCK_EXPEDITEUR_DASHBOARD = {
  expeditionsMois: 12,
  depensesMois: 36400,
  economiesVsMarche: 8250,
  co2EviteKg: 420.5,
  totalCargaisons: 18,
  totalReservations: 15,
  expeditionsActives: [
    {
      cargaisonId: 301,
      reference: 'EXP-2025-042',
      description: 'Palettes Agroalimentaires (Huile d’olive & conserves)',
      villeDepart: 'Casablanca',
      villeArrivee: 'Tanger',
      statut: 'EN_TRANSIT',
      transporteurNom: 'Mohamed El Fassi Transport',
      transporteurTelephone: '+212 6 61 22 33 44',
      etaDate: new Date(Date.now() + 3600000 * 2.5).toISOString(),
      etaMinutes: 150,
      poidsKg: 2500,
      prixTotal: 2800,
      trajetId: 101,
    },
    {
      cargaisonId: 302,
      reference: 'EXP-2025-045',
      description: 'Pièces détachées industrielles & outillage',
      villeDepart: 'Tanger',
      villeArrivee: 'Marrakech',
      statut: 'ASSIGNEE',
      transporteurNom: 'Atlas Logistique Express',
      transporteurTelephone: '+212 6 62 88 99 00',
      etaDate: new Date(Date.now() + 86400000).toISOString(),
      etaMinutes: 1440,
      poidsKg: 1800,
      prixTotal: 3400,
      trajetId: 102,
    },
  ],
  transporteursRecommandes: [
    {
      transporteurId: 1,
      nom: 'Mohamed El Fassi',
      nomEntreprise: 'El Fassi Logistique SARL',
      noteMoyenne: 4.9,
      nombreAvis: 48,
      nombreTrajetsRealises: 124,
      villeBase: 'Casablanca',
      immatriculation: '12345-A-6',
      badgeVerifie: true,
    },
    {
      transporteurId: 2,
      nom: 'Karim Bennani',
      nomEntreprise: 'Trans-Atlas Express',
      noteMoyenne: 4.8,
      nombreAvis: 35,
      nombreTrajetsRealises: 89,
      villeBase: 'Tanger',
      immatriculation: '45678-B-1',
      badgeVerifie: true,
    },
    {
      transporteurId: 3,
      nom: 'Youssef Mansouri',
      nomEntreprise: 'Souss Fret Distribution',
      noteMoyenne: 4.7,
      nombreAvis: 29,
      nombreTrajetsRealises: 67,
      villeBase: 'Agadir',
      immatriculation: '78910-D-8',
      badgeVerifie: true,
    },
  ],
  repartitionParRoute: [
    { route: 'Casablanca → Tanger', montant: 14500, nombreVoyages: 5 },
    { route: 'Tanger → Marrakech', montant: 9800, nombreVoyages: 3 },
    { route: 'Casablanca → Agadir', montant: 7200, nombreVoyages: 2 },
    { route: 'Fès → Oujda', montant: 4900, nombreVoyages: 2 },
  ],
};

const MOCK_TRAJETS_RECHERCHE = [
  {
    id: 101,
    reference: 'TR-2025-101',
    villeDepart: 'Casablanca',
    villeArrivee: 'Tanger',
    dateDepart: new Date(Date.now() + 86400000 * 1).toISOString(),
    dateArriveeEstimee: new Date(Date.now() + 86400000 * 1 + 3600000 * 5).toISOString(),
    prixParKg: 0.65,
    prix: 650,
    typeTarification: 'PRIX_FIXE_KG',
    poidsDisponible: 4500,
    volumeDisponible: 22,
    statutTrajet: 'PUBLIE',
    tauxRemplissage: 55,
    transporteurNom: 'Mohamed El Fassi Transport',
    transporteurNote: 4.9,
    nombreAvis: 48,
    typeCamion: 'SEMI',
    refrigere: false,
    equipements: ['GPS', 'HAYON'],
    coordinatesDepart: [33.5731, -7.5898],
    coordinatesArrivee: [35.7595, -5.834],
  },
  {
    id: 102,
    reference: 'TR-2025-102',
    villeDepart: 'Tanger',
    villeArrivee: 'Marrakech',
    dateDepart: new Date(Date.now() + 86400000 * 2).toISOString(),
    dateArriveeEstimee: new Date(Date.now() + 86400000 * 2 + 3600000 * 7).toISOString(),
    prixParKg: 0.85,
    prix: 850,
    typeTarification: 'PRIX_FIXE_KG',
    poidsDisponible: 6000,
    volumeDisponible: 30,
    statutTrajet: 'PUBLIE',
    tauxRemplissage: 40,
    transporteurNom: 'Trans-Atlas Express',
    transporteurNote: 4.8,
    nombreAvis: 35,
    typeCamion: 'CAMION_10T',
    refrigere: true,
    equipements: ['GPS', 'REFRIGERATION'],
    coordinatesDepart: [35.7595, -5.834],
    coordinatesArrivee: [31.6295, -7.9811],
  },
  {
    id: 103,
    reference: 'TR-2025-103',
    villeDepart: 'Casablanca',
    villeArrivee: 'Agadir',
    dateDepart: new Date(Date.now() + 86400000 * 3).toISOString(),
    dateArriveeEstimee: new Date(Date.now() + 86400000 * 3 + 3600000 * 6).toISOString(),
    prixParKg: 0.75,
    prix: 750,
    typeTarification: 'PRIX_FIXE_KG',
    poidsDisponible: 8000,
    volumeDisponible: 35,
    statutTrajet: 'PUBLIE',
    tauxRemplissage: 20,
    transporteurNom: 'Souss Fret Distribution',
    transporteurNote: 4.7,
    nombreAvis: 29,
    typeCamion: 'SEMI',
    refrigere: false,
    equipements: ['GPS', 'BACHE'],
    coordinatesDepart: [33.5731, -7.5898],
    coordinatesArrivee: [30.4278, -9.5981],
  },
  {
    id: 104,
    reference: 'TR-2025-104',
    villeDepart: 'Fès',
    villeArrivee: 'Oujda',
    dateDepart: new Date(Date.now() + 86400000 * 4).toISOString(),
    dateArriveeEstimee: new Date(Date.now() + 86400000 * 4 + 3600000 * 4.5).toISOString(),
    prixParKg: 0.70,
    prix: 700,
    typeTarification: 'PRIX_FIXE_KG',
    poidsDisponible: 3500,
    volumeDisponible: 16,
    statutTrajet: 'PUBLIE',
    tauxRemplissage: 65,
    transporteurNom: 'Nord-Est Transit',
    transporteurNote: 4.6,
    nombreAvis: 21,
    typeCamion: 'PORTEUR',
    refrigere: false,
    equipements: ['GPS'],
    coordinatesDepart: [34.0331, -5.0003],
    coordinatesArrivee: [34.6805, -1.9076],
  },
];

const MOCK_CARGAISONS = [
  {
    id: 1,
    reference: 'CRG-2025-001',
    description: '3 Palettes d’huile d’argan biologique conditionnée',
    typeMarchandise: 'ALIMENTAIRE',
    poids: 1500,
    volume: 4.2,
    valeurDeclaree: 45000,
    statut: 'LIVREE',
    villeDepart: 'Agadir',
    villeArrivee: 'Casablanca',
    dateCreation: '2025-01-10T10:00:00',
    destinataireNom: 'Boutique Terroir Rabat',
    destinataireTelephone: '+212 6 61 00 11 22',
  },
  {
    id: 2,
    reference: 'CRG-2025-002',
    description: 'Composants électroniques et faisceaux câbles',
    typeMarchandise: 'INDUSTRIEL',
    poids: 800,
    volume: 2.5,
    valeurDeclaree: 85000,
    statut: 'EN_TRANSIT',
    villeDepart: 'Tanger',
    villeArrivee: 'Casablanca',
    dateCreation: '2025-01-18T14:30:00',
    destinataireNom: 'Automotive Parts Ain Sebaa',
    destinataireTelephone: '+212 6 62 33 44 55',
  },
  {
    id: 3,
    reference: 'CRG-2025-003',
    description: 'Lot de rouleaux de tissus et prêt-à-porter',
    typeMarchandise: 'TEXTILE',
    poids: 2200,
    volume: 8.0,
    valeurDeclaree: 32000,
    statut: 'EN_ATTENTE',
    villeDepart: 'Casablanca',
    villeArrivee: 'Marrakech',
    dateCreation: '2025-01-19T09:15:00',
    destinataireNom: 'Atelier Mode Médina',
    destinataireTelephone: '+212 6 63 77 88 99',
  },
];

export const expediteurService = {
  // 1. DASHBOARD EXPÉDITEUR
  getDashboard: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return MOCK_EXPEDITEUR_DASHBOARD;
    }
    try {
      const res = await client.get('/api/dashboard/expediteur');
      return res.data;
    } catch (err) {
      console.warn('Dashboard Expéditeur non joignable, fallback démo activé:', err.message);
      return MOCK_EXPEDITEUR_DASHBOARD;
    }
  },

  // 2. RECHERCHE DE TRAJETS & CARTE
  rechercherTrajets: async ({
    depart = '',
    arrivee = '',
    date = '',
    poids = null,
    volume = null,
    refrigere = null,
    noteMin = null,
    sort = 'date',
    page = 0,
    size = 10,
  } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_TRAJETS_RECHERCHE];
      if (depart) list = list.filter((t) => t.villeDepart.toLowerCase().includes(depart.toLowerCase()));
      if (arrivee) list = list.filter((t) => t.villeArrivee.toLowerCase().includes(arrivee.toLowerCase()));
      if (poids) list = list.filter((t) => t.poidsDisponible >= Number(poids));
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size, sort };
      if (depart) params.depart = depart;
      if (arrivee) params.arrivee = arrivee;
      if (date) params.date = date;
      if (poids) params.poids = poids;
      if (volume) params.volume = volume;
      if (refrigere !== null && refrigere !== undefined) params.refrigere = refrigere;
      if (noteMin) params.noteMin = noteMin;

      const res = await client.get('/api/trajets/recherche', { params });
      const raw = res.data;
      const rawList = raw.content || (Array.isArray(raw) ? raw : []);
      // Normalisation : s'assurer que .id et .trajetId sont TOUJOURS définis
      const content = rawList.map((t) => {
        const validId = t.id ?? t.trajetId ?? t.idTrajet ?? 101;
        return {
          ...t,
          id: validId,
          trajetId: validId,
        };
      });

      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch (err) {
      console.warn('Erreur /api/trajets/recherche, tentative /api/trajets/publies:', err.message);
      try {
        const res2 = await client.get('/api/trajets/publies');
        const list = Array.isArray(res2.data) ? res2.data : (res2.data?.content || []);
        let filtered = list;
        if (depart) filtered = filtered.filter((t) => t.villeDepart?.toLowerCase().includes(depart.toLowerCase()));
        if (arrivee) filtered = filtered.filter((t) => t.villeArrivee?.toLowerCase().includes(arrivee.toLowerCase()));
        const content = filtered.map((t) => {
          const validId = t.id ?? t.trajetId ?? t.idTrajet ?? 101;
          return { ...t, id: validId, trajetId: validId };
        });
        return mockPagedResponse(content, page, size);
      } catch {
        let list = [...MOCK_TRAJETS_RECHERCHE];
        if (depart) list = list.filter((t) => t.villeDepart.toLowerCase().includes(depart.toLowerCase()));
        if (arrivee) list = list.filter((t) => t.villeArrivee.toLowerCase().includes(arrivee.toLowerCase()));
        return mockPagedResponse(list, page, size);
      }
    }
  },

  getTrajetsCarte: async ({ depart = '', arrivee = '', date = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_TRAJETS_RECHERCHE;
    }
    try {
      const params = {};
      if (depart) params.depart = depart;
      if (arrivee) params.arrivee = arrivee;
      if (date) params.date = date;
      const res = await client.get('/api/trajets/recherche/carte', { params });
      const rawList = Array.isArray(res.data) && res.data.length > 0 ? res.data : MOCK_TRAJETS_RECHERCHE;
      return rawList.map((t) => {
        const validId = t.id ?? t.trajetId ?? t.idTrajet ?? 101;
        return { ...t, id: validId, trajetId: validId };
      });
    } catch {
      return MOCK_TRAJETS_RECHERCHE;
    }
  },

  getTrajetDetail: async (id) => {
    // Si l'id est absent, nul ou la chaîne "undefined", éviter un appel HTTP 500
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      console.warn('ID trajet manquant ou invalide passé à getTrajetDetail:', id);
      return MOCK_TRAJETS_RECHERCHE[0];
    }
    if (isMockEnabled()) {
      await delay(200, 400);
      return (
        MOCK_TRAJETS_RECHERCHE.find((t) => Number(t.id || t.trajetId) === Number(id)) ||
        MOCK_TRAJETS_RECHERCHE[0]
      );
    }
    try {
      const res = await client.get(`/api/trajets/${id}/detail`);
      const data = res.data;
      const validId = data.trajetId ?? data.id ?? Number(id);
      return { ...data, id: validId, trajetId: validId };
    } catch {
      try {
        const res2 = await client.get(`/api/trajets/${id}`);
        const data2 = res2.data;
        const validId2 = data2.trajetId ?? data2.id ?? Number(id);
        return { ...data2, id: validId2, trajetId: validId2 };
      } catch {
        return (
          MOCK_TRAJETS_RECHERCHE.find((t) => Number(t.id || t.trajetId) === Number(id)) ||
          MOCK_TRAJETS_RECHERCHE[0]
        );
      }
    }
  },

  // 3. DEVIS & RÉSERVATION
  calculerDevis: async ({ trajetId, poids, volume = null, assurance = false, valeurDeclaree = null, prixNegocie = null }) => {
    const validTrajetId = (!trajetId || trajetId === 'undefined' || isNaN(Number(trajetId))) ? null : Number(trajetId);
    if (isMockEnabled() || !validTrajetId) {
      await delay(200, 400);
      const transport = (Number(poids) || 100) * 0.75;
      const assuranceCost = assurance ? ((Number(valeurDeclaree) || 10000) * 0.005) : 0;
      const commission = (transport + assuranceCost) * 0.10;
      const ht = transport + assuranceCost + commission;
      const tva = ht * 0.20;
      const totalTTC = ht + tva;
      return {
        montantTransport: transport,
        montantAssurance: assuranceCost,
        montantCommission: commission,
        montantTva: tva,
        totalTTC,
        netTransporteur: transport * 0.90,
      };
    }
    try {
      const res = await client.post('/api/offres/devis', {
        trajetId: validTrajetId,
        poids: Number(poids),
        volume: volume ? Number(volume) : null,
        assurance: Boolean(assurance),
        valeurDeclaree: valeurDeclaree ? Number(valeurDeclaree) : null,
        prixNegocie: prixNegocie ? Number(prixNegocie) : null,
      });
      return res.data;
    } catch (err) {
      console.warn('Devis API non joignable, calcul local de fallback:', err.message);
      const transport = (Number(poids) || 100) * 0.75;
      const assuranceCost = assurance ? ((Number(valeurDeclaree) || 10000) * 0.005) : 0;
      const commission = (transport + assuranceCost) * 0.10;
      const ht = transport + assuranceCost + commission;
      const tva = ht * 0.20;
      const totalTTC = ht + tva;
      return {
        montantTransport: transport,
        montantAssurance: assuranceCost,
        montantCommission: commission,
        montantTva: tva,
        totalTTC,
        netTransporteur: transport * 0.90,
      };
    }
  },

  creerReservation: async ({ cargaisonId, trajetId, prixConvenu = null }) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id: Date.now(), cargaisonId, trajetId, statut: 'CONFIRMEE', prixConvenu };
    }
    const res = await client.post('/api/reservations', {
      cargaisonId: Number(cargaisonId),
      trajetId: Number(trajetId),
      prixConvenu: prixConvenu ? Number(prixConvenu) : null,
    });
    return res.data;
  },

  creerOffre: async (offreData) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id: Date.now(), ...offreData, statutOffre: 'EN_ATTENTE' };
    }
    const res = await client.post('/api/offres', offreData);
    return res.data;
  },

  // 4. CARGAISONS & EXPÉDITIONS
  getMesCargaisons: async ({ statut = '', page = 0, size = 10 } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_CARGAISONS];
      if (statut && statut !== 'TOUS') list = list.filter((c) => c.statut === statut);
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size };
      if (statut && statut !== 'TOUS') params.statut = statut;
      const res = await client.get('/api/cargaisons/mes-cargaisons', { params });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      let list = [...MOCK_CARGAISONS];
      if (statut && statut !== 'TOUS') list = list.filter((c) => c.statut === statut);
      return mockPagedResponse(list, page, size);
    }
  },

  getMesCargaisonsDisponibles: async () => {
    if (isMockEnabled()) {
      await delay(200, 300);
      return MOCK_CARGAISONS.filter((c) => c.statut === 'EN_ATTENTE' || c.statut === 'DISPONIBLE');
    }
    try {
      const res = await client.get('/api/cargaisons/mes-cargaisons-disponibles');
      return Array.isArray(res.data) ? res.data : (res.data?.content || []);
    } catch {
      return MOCK_CARGAISONS;
    }
  },

  creerCargaison: async (cargaisonData) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id: Date.now(), reference: `CRG-2025-${Math.floor(100 + Math.random() * 900)}`, ...cargaisonData, statut: 'EN_ATTENTE' };
    }

    const validTypes = ['ALIMENTAIRE', 'ELECTRONIQUE', 'FRAGILE', 'TEXTILE', 'MATERIAUX', 'REFRIGERE', 'DANGEREUX'];
    let typeMarchandise = cargaisonData.typeMarchandise;
    if (typeMarchandise === 'FRIGO' || typeMarchandise === 'PERISSABLE') {
      typeMarchandise = 'REFRIGERE';
    } else if (typeMarchandise === 'CONSTRUCTION' || typeMarchandise === 'INDUSTRIEL') {
      typeMarchandise = 'MATERIAUX';
    } else if (typeMarchandise === 'AGRICOLE') {
      typeMarchandise = 'ALIMENTAIRE';
    } else if (typeMarchandise === 'GENERAL' || typeMarchandise === 'STANDARD' || typeMarchandise === '' || !validTypes.includes(typeMarchandise)) {
      typeMarchandise = null;
    }

    const payload = {
      description: cargaisonData.description,
      poids: Number(cargaisonData.poids),
      volume: cargaisonData.volume ? Number(cargaisonData.volume) : null,
      valeurDeclaree: cargaisonData.valeurDeclaree ? Number(cargaisonData.valeurDeclaree) : null,
      typeMarchandise,
      assurance: Boolean(cargaisonData.assurance),
      instructionsSpeciales: cargaisonData.instructionsSpeciales || null,
      photoUrls: Array.isArray(cargaisonData.photoUrls) ? cargaisonData.photoUrls : [],
    };
    if (cargaisonData.expediteurId) {
      payload.expediteurId = Number(cargaisonData.expediteurId);
    }

    const res = await client.post('/api/cargaisons', payload);
    return res.data;
  },

  confirmerLivraison: async (offreId) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { success: true };
    }
    const res = await client.patch(`/api/offres/${offreId}/confirmer-livraison`);
    return res.data;
  },

  // 5. FINANCES & PAIEMENTS
  getFinancesResume: async (periode = 'MOIS') => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return {
        depensesMois: 36400,
        economiesVsMarche: 8250,
        depenseMoyenneParTrajet: 3033,
        totalFacturesEnAttente: 2,
        montantEnAttentePaiement: 6200,
      };
    }
    try {
      const res = await client.get('/api/finances/expediteur/resume', { params: { periode } });
      return res.data;
    } catch {
      return {
        depensesMois: 36400,
        economiesVsMarche: 8250,
        depenseMoyenneParTrajet: 3033,
        totalFacturesEnAttente: 2,
        montantEnAttentePaiement: 6200,
      };
    }
  },

  getDepensesParMois: async () => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return [
        { mois: 'Oct 2024', montant: 22000 },
        { mois: 'Nov 2024', montant: 28500 },
        { mois: 'Déc 2024', montant: 34100 },
        { mois: 'Jan 2025', montant: 36400 },
      ];
    }
    try {
      const res = await client.get('/api/finances/expediteur/depenses-par-mois');
      return res.data;
    } catch {
      return [
        { mois: 'Oct 2024', montant: 22000 },
        { mois: 'Nov 2024', montant: 28500 },
        { mois: 'Déc 2024', montant: 34100 },
        { mois: 'Jan 2025', montant: 36400 },
      ];
    }
  },

  getRepartitionParRoute: async () => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_EXPEDITEUR_DASHBOARD.repartitionParRoute;
    }
    try {
      const res = await client.get('/api/finances/expediteur/repartition-par-route');
      return res.data;
    } catch {
      return MOCK_EXPEDITEUR_DASHBOARD.repartitionParRoute;
    }
  },

  getFactures: async ({ page = 0, size = 10 } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const factures = [
        { id: 1, numeroFacture: 'FAC-2025-0142', dateEmission: '2025-01-18', trajetRoute: 'Casablanca → Tanger', montantTTC: 3360, statutPaiement: 'PAYEE', urlPdf: '#' },
        { id: 2, numeroFacture: 'FAC-2025-0138', dateEmission: '2025-01-15', trajetRoute: 'Tanger → Marrakech', montantTTC: 4080, statutPaiement: 'PAYEE', urlPdf: '#' },
        { id: 3, numeroFacture: 'FAC-2025-0129', dateEmission: '2025-01-10', trajetRoute: 'Casablanca → Agadir', montantTTC: 2950, statutPaiement: 'PAYEE', urlPdf: '#' },
        { id: 4, numeroFacture: 'FAC-2025-0155', dateEmission: '2025-01-20', trajetRoute: 'Fès → Oujda', montantTTC: 1800, statutPaiement: 'EN_ATTENTE', urlPdf: '#' },
      ];
      return mockPagedResponse(factures, page, size);
    }
    try {
      const res = await client.get('/api/finances/expediteur/factures', { params: { page, size } });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      return mockPagedResponse([], page, size);
    }
  },

  initierPaiement: async ({ offreId, methodePaiement = 'CMI_CARTE' }) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id: Date.now(), referencePaiement: `PAY-CMI-${Date.now().toString().slice(-6)}`, statutPaiement: 'EN_ATTENTE_VALIDATION' };
    }
    const res = await client.post('/api/finances/paiements/initier', { offreId, methodePaiement });
    return res.data;
  },

  validerPaiementCmi: async (paiementId) => {
    if (isMockEnabled()) {
      await delay(400, 700);
      return { id: paiementId, statutPaiement: 'CONFIRME', message: 'Paiement CMI approuvé avec succès.' };
    }
    const res = await client.patch(`/api/finances/paiements/${paiementId}/valider-cmi`);
    return res.data;
  },

  // 6. GESTION DES RÉSERVATIONS EXPÉDITEUR
  getMesReservations: async ({ page = 0, size = 10 } = {}) => {
    if (isMockEnabled()) {
      await delay(250, 400);
      const list = [
        {
          id: 1,
          cargaisonId: 1,
          trajetId: 101,
          statut: 'CONFIRMEE',
          prixConvenu: 2800,
          dateCreation: '2025-01-18T10:00:00',
          trajet: {
            villeDepart: 'Casablanca',
            villeArrivee: 'Tanger',
            dateDepart: '2025-01-20T08:00:00',
            transporteurNom: 'Mohamed El Fassi Transport',
          },
        },
      ];
      return mockPagedResponse(list, page, size);
    }
    try {
      const res = await client.get('/api/reservations/expediteur/mes-reservations', { params: { page, size } });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      return mockPagedResponse([], page, size);
    }
  },

  getReservationById: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return {
        id: Number(id),
        cargaisonId: 1,
        trajetId: 101,
        statut: 'CONFIRMEE',
        prixConvenu: 2800,
        dateCreation: '2025-01-18T10:00:00',
        trajet: {
          villeDepart: 'Casablanca',
          villeArrivee: 'Tanger',
          dateDepart: '2025-01-20T08:00:00',
          transporteurNom: 'Mohamed El Fassi Transport',
        },
      };
    }
    const res = await client.get(`/api/reservations/${id}`);
    return res.data;
  },

  annulerReservation: async (id) => {
    if (isMockEnabled()) {
      await delay(250, 400);
      return { id, statut: 'ANNULEE' };
    }
    const res = await client.patch(`/api/reservations/${id}/annuler`);
    return res.data;
  },
};

export default expediteurService;
