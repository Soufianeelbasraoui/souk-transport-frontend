import client from '../client';
import { isMockEnabled, delay, mockPagedResponse } from '../mockUtils';

/**
 * Service API pour le parcours Administrateur.
 * Aligné sur les contrôleurs réels Spring Boot :
 * - DashboardController (/api/dashboard/admin)
 * - AdminUserController (/api/admin/utilisateurs)
 * - AdminVerificationController (/api/admin/verifications, /api/admin/documents)
 * - AdminLitigeController (/api/admin/litiges)
 * - AdminAnalyticsController (/api/admin/analytics)
 */

// Données démo enrichies pour mode démo ou fallback d'absence de données en base
const MOCK_ADMIN_DASHBOARD = {
  totalUtilisateurs: 184,
  utilisateursActifs: 142,
  trajetsPublies: 68,
  totalCargaisons: 112,
  totalReservations: 94,
  gmvMois: 485000,
  revenusCommissions: 48500,
  revenusAbonnements: 12400,
  litigesOuverts: 2,
  alertesTransporteursAVerifier: 4,
  alertesLitigesATraiter: 2,
  nps: 4.8,
  transactions30Jours: [
    { date: 'J-6', volume: 68000, commission: 6800 },
    { date: 'J-5', volume: 74000, commission: 7400 },
    { date: 'J-4', volume: 82000, commission: 8200 },
    { date: 'J-3', volume: 79000, commission: 7900 },
    { date: 'J-2', volume: 91000, commission: 9100 },
    { date: 'J-1', volume: 88000, commission: 8800 },
    { date: 'Aujourd’hui', volume: 96000, commission: 9600 },
  ],
  top10Routes: [
    { route: 'Casablanca → Tanger', volumeMad: 185000, nombreTrajets: 28 },
    { route: 'Tanger → Marrakech', volumeMad: 124000, nombreTrajets: 18 },
    { route: 'Casablanca → Agadir', volumeMad: 92000, nombreTrajets: 14 },
    { route: 'Fès → Oujda', volumeMad: 54000, nombreTrajets: 10 },
    { route: 'Rabat → Marrakech', volumeMad: 30000, nombreTrajets: 6 },
  ],
  fluxActivite: [
    'Nouveau transporteur inscrit : Atlas Fret Express (Dossier CIN en attente)',
    'Paiement CMI validé : 4 200 DH pour le trajet TR-101 (Casablanca → Tanger)',
    'Trajet clôturé avec succès : Marrakech → Agadir par Trans-Atlas Express',
    'Litige résolu par médiation : #LIT-0042 (Remboursement partiel validé)',
  ],
};

const MOCK_ADMIN_USERS = [
  {
    id: 1,
    nom: 'El Fassi',
    prenom: 'Mohamed',
    email: 'mohamed.elfassi@transport.ma',
    telephone: '+212 6 61 22 33 44',
    ville: 'Casablanca',
    role: 'TRANSPORTEUR',
    statutUser: 'ACTIF',
    notesAdmin: 'Transporteur fiable, flotte de 3 camions semi-remorques.',
    createdAt: '2024-10-15T09:00:00',
  },
  {
    id: 2,
    nom: 'Bennani',
    prenom: 'Karim',
    email: 'karim.bennani@atlasfret.ma',
    telephone: '+212 6 62 88 99 00',
    ville: 'Tanger',
    role: 'TRANSPORTEUR',
    statutUser: 'EN_ATTENTE_VERIFICATION',
    notesAdmin: 'Dossier déposé le 18/01, vérification RC requise.',
    createdAt: '2025-01-18T14:30:00',
  },
  {
    id: 3,
    nom: 'Alami',
    prenom: 'Sara',
    email: 'sara.alami@agro-atlas.ma',
    telephone: '+212 6 63 11 22 33',
    ville: 'Marrakech',
    role: 'EXPEDITEUR',
    statutUser: 'ACTIF',
    notesAdmin: 'Entreprise agroalimentaire, expéditions régulières d’huile d’argan.',
    createdAt: '2024-11-02T11:20:00',
  },
  {
    id: 4,
    nom: 'Tazi',
    prenom: 'Hassan',
    email: 'hassan.tazi@textile-nord.ma',
    telephone: '+212 6 64 55 66 77',
    ville: 'Fès',
    role: 'EXPEDITEUR',
    statutUser: 'ACTIF',
    notesAdmin: 'Client grand compte, expéditions vers Tanger Med.',
    createdAt: '2024-12-05T16:00:00',
  },
  {
    id: 5,
    nom: 'Chraibi',
    prenom: 'Omar',
    email: 'omar.chraibi@expressfret.ma',
    telephone: '+212 6 65 99 88 77',
    ville: 'Agadir',
    role: 'TRANSPORTEUR',
    statutUser: 'SUSPENDU',
    motifSuspension: 'Retard récurrent et litige non résolu sur cargaison primeur.',
    notesAdmin: 'Compte suspendu temporairement.',
    createdAt: '2024-09-10T10:15:00',
  },
];

const MOCK_VERIFICATIONS = [
  {
    id: 1,
    transporteurId: 2,
    transporteurNom: 'Karim Bennani',
    transporteurEmail: 'karim.bennani@atlasfret.ma',
    transporteurTelephone: '+212 6 62 88 99 00',
    transporteurEntreprise: 'Atlas Fret SARL',
    statut: 'EN_ATTENTE',
    soumisLe: new Date(Date.now() - 3600000 * 36).toISOString(),
    ancienneteJours: 1,
    notesInternes: 'Entreprise de transport basée à la zone franche de Tanger.',
    documents: [
      { id: 101, typeDocument: 'CIN', nomFichier: 'cin_recto_verso.pdf', statut: 'VALIDE', url: '#' },
      { id: 102, typeDocument: 'ICE', nomFichier: 'attestation_ice_maroc.pdf', statut: 'EN_ATTENTE', url: '#' },
      { id: 103, typeDocument: 'RC', nomFichier: 'registre_commerce_tanger.pdf', statut: 'EN_ATTENTE', url: '#' },
      { id: 104, typeDocument: 'ASSURANCE', nomFichier: 'police_assurance_fret.pdf', statut: 'EN_ATTENTE', url: '#' },
    ],
  },
  {
    id: 2,
    transporteurId: 6,
    transporteurNom: 'Youssef El Amrani',
    transporteurEmail: 'youssef@transnord.ma',
    transporteurTelephone: '+212 6 70 12 34 56',
    transporteurEntreprise: 'Trans-Nord Distribution',
    statut: 'EN_ATTENTE',
    soumisLe: new Date(Date.now() - 86400000 * 3).toISOString(),
    ancienneteJours: 3,
    notesInternes: 'Flotte de 2 porteurs 10T.',
    documents: [
      { id: 105, typeDocument: 'CIN', nomFichier: 'cin_amrani.pdf', statut: 'VALIDE', url: '#' },
      { id: 106, typeDocument: 'PERMIS', nomFichier: 'permis_conduire_ec.pdf', statut: 'VALIDE', url: '#' },
      { id: 107, typeDocument: 'CARTE_GRISE', nomFichier: 'carte_grise_volvo.pdf', statut: 'EN_ATTENTE', url: '#' },
    ],
  },
];

const MOCK_LITIGES = [
  {
    id: 1,
    reference: 'LIT-2025-001',
    offreId: 201,
    ouvertParNom: 'Société Agro-Atlas (Sara Alami)',
    motif: 'Marchandise endommagée durant le transport',
    description: '3 fûts d’huile d’argan renversés et abîmés lors du déchargement à Casablanca. Constat établi avec le chauffeur.',
    statut: 'OUVERT',
    urgent: true,
    montantEnJeu: 12500,
    preuves: ['constat_avarie_signe.pdf', 'photo_futs_endommages.jpg'],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    messages: [
      { id: 1, auteurNom: 'Sara Alami', contenu: 'Bonjour, les fûts sont arrivés perforés. Nous demandons le remboursement du préjudice.', createdAt: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: 2, auteurNom: 'Mohamed El Fassi', contenu: 'Le sanglage a été vérifié au départ de Marrakech. Le déchargement a été effectué par l’équipe du client.', createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
    ],
  },
  {
    id: 2,
    reference: 'LIT-2025-002',
    offreId: 204,
    ouvertParNom: 'Textiles du Nord',
    motif: 'Retard de livraison supérieur à 24h sans notification',
    description: 'Livraison prévue à Tanger Med le 15/01 à 08h00, arrivée réelle le 16/01 à 14h00, entraînant une pénalité conteneur.',
    statut: 'EN_COURS',
    urgent: false,
    montantEnJeu: 4800,
    preuves: ['bon_livraison_horodate.pdf'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      { id: 3, auteurNom: 'Textiles du Nord', contenu: 'Nous demandons une réduction de 50% sur le fret en raison de la perte du créneau d’embarquement.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    ],
  },
];

const MOCK_ANALYTICS = {
  gmv: 4850000,
  revenuNet: 485000,
  transactionMoyenne: 3650,
  tauxCompletion: 96.8,
  churnPct: 2.1,
  nps: 4.8,
  volumeParRegion: [
    { region: 'Casablanca-Settat', volumeMad: 1950000, pourcentage: 40.2 },
    { region: 'Tanger-Tétouan-Al Hoceïma', volumeMad: 1420000, pourcentage: 29.3 },
    { region: 'Marrakech-Safi', volumeMad: 680000, pourcentage: 14.0 },
    { region: 'Souss-Massa', volumeMad: 450000, pourcentage: 9.3 },
    { region: 'Fès-Meknès & Oriental', volumeMad: 350000, pourcentage: 7.2 },
  ],
  evolutionRevenus12Mois: [
    { mois: 'Août', volume: 320000, commission: 32000 },
    { mois: 'Sept', volume: 380000, commission: 38000 },
    { mois: 'Oct', volume: 410000, commission: 41000 },
    { mois: 'Nov', volume: 440000, commission: 44000 },
    { mois: 'Déc', volume: 465000, commission: 46500 },
    { mois: 'Jan', volume: 485000, commission: 48500 },
  ],
  croissanceUtilisateurs: [
    { mois: 'Août', transporteurs: 45, individus: 60 },
    { mois: 'Sept', transporteurs: 58, individus: 78 },
    { mois: 'Oct', transporteurs: 72, individus: 95 },
    { mois: 'Nov', transporteurs: 89, individus: 118 },
    { mois: 'Déc', transporteurs: 104, individus: 142 },
    { mois: 'Jan', transporteurs: 124, individus: 168 },
  ],
};

export const adminService = {
  // 1. DASHBOARD ADMIN
  getDashboard: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return MOCK_ADMIN_DASHBOARD;
    }
    try {
      const res = await client.get('/api/dashboard/admin');
      return res.data;
    } catch (err) {
      console.warn('Dashboard Admin API non joignable, fallback démo activé:', err.message);
      return MOCK_ADMIN_DASHBOARD;
    }
  },

  // 2. GESTION DES UTILISATEURS
  getUsers: async ({ page = 0, size = 10, role = '', statut = '', search = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_ADMIN_USERS];
      if (role && role !== 'TOUS') list = list.filter((u) => u.role === role);
      if (statut && statut !== 'TOUS') list = list.filter((u) => u.statutUser === statut);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((u) => u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.ville.toLowerCase().includes(q));
      }
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size };
      if (role && role !== 'TOUS') params.role = role;
      if (statut && statut !== 'TOUS') params.statut = statut;
      if (search) params.recherche = search;

      const res = await client.get('/api/admin/utilisateurs', { params });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      let list = [...MOCK_ADMIN_USERS];
      if (role && role !== 'TOUS') list = list.filter((u) => u.role === role);
      if (statut && statut !== 'TOUS') list = list.filter((u) => u.statutUser === statut);
      return mockPagedResponse(list, page, size);
    }
  },

  getUserDetail: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_ADMIN_USERS.find((u) => u.id === Number(id)) || MOCK_ADMIN_USERS[0];
    }
    const res = await client.get(`/api/admin/utilisateurs/${id}`);
    return res.data;
  },

  suspendreUser: async (id, motif) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutUser: 'SUSPENDU', motifSuspension: motif };
    }
    const res = await client.patch(`/api/admin/utilisateurs/${id}/suspendre`, { motif });
    return res.data;
  },

  reactiverUser: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutUser: 'ACTIF' };
    }
    const res = await client.patch(`/api/admin/utilisateurs/${id}/reactiver`);
    return res.data;
  },

  bannirUser: async (id, motif) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statutUser: 'BANNI', motifSuspension: motif };
    }
    const res = await client.patch(`/api/admin/utilisateurs/${id}/bannir`, { motif });
    return res.data;
  },

  updateNotesAdmin: async (id, notesAdmin) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, notesAdmin };
    }
    const res = await client.put(`/api/admin/utilisateurs/${id}/notes`, { notesAdmin });
    return res.data;
  },

  exportUsersCsv: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const csv = 'ID,Nom,Prenom,Email,Role,Statut,Ville\n1,El Fassi,Mohamed,mohamed@transport.ma,TRANSPORTEUR,ACTIF,Casablanca\n';
      return new Blob([csv], { type: 'text/csv' });
    }
    const res = await client.get('/api/admin/utilisateurs/export', { responseType: 'blob' });
    return res.data;
  },

  // 3. FILE DE VÉRIFICATION DOCUMENTAIRE (FIFO)
  getVerifications: async ({ page = 0, size = 10, statut = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_VERIFICATIONS];
      if (statut && statut !== 'TOUS') list = list.filter((v) => v.statut === statut);
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size };
      if (statut && statut !== 'TOUS') params.statut = statut;
      const res = await client.get('/api/admin/verifications', { params });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      return mockPagedResponse(MOCK_VERIFICATIONS, page, size);
    }
  },

  getVerificationById: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_VERIFICATIONS.find((v) => v.id === Number(id)) || MOCK_VERIFICATIONS[0];
    }
    const res = await client.get(`/api/admin/verifications/${id}`);
    return res.data;
  },

  approuverVerification: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statut: 'APPROUVE' };
    }
    const res = await client.patch(`/api/admin/verifications/${id}/approuver`);
    return res.data;
  },

  rejeterVerification: async (id, { motifRejet, messageRejet }) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statut: 'REJETE', motifRejet, messageRejet };
    }
    const res = await client.patch(`/api/admin/verifications/${id}/rejeter`, { motifRejet, messageRejet });
    return res.data;
  },

  validerDocument: async (docId) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return { id: docId, statut: 'VALIDE' };
    }
    const res = await client.patch(`/api/admin/documents/${docId}/valider`);
    return res.data;
  },

  rejeterDocument: async (docId, motif) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return { id: docId, statut: 'REJETE', motif };
    }
    const res = await client.patch(`/api/admin/documents/${docId}/rejeter`, { motif });
    return res.data;
  },

  // 4. GESTION DES LITIGES & MÉDIATION
  getLitiges: async ({ page = 0, size = 10, statut = '' } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      let list = [...MOCK_LITIGES];
      if (statut && statut !== 'TOUS') list = list.filter((l) => l.statut === statut);
      return mockPagedResponse(list, page, size);
    }
    try {
      const params = { page, size };
      if (statut && statut !== 'TOUS') params.statut = statut;
      const res = await client.get('/api/admin/litiges', { params });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      return mockPagedResponse(MOCK_LITIGES, page, size);
    }
  },

  getLitigeById: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      return MOCK_LITIGES.find((l) => l.id === Number(id)) || MOCK_LITIGES[0];
    }
    const res = await client.get(`/api/admin/litiges/${id}`);
    return res.data;
  },

  prendreEnChargeLitige: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return { id, statut: 'EN_COURS' };
    }
    const res = await client.patch(`/api/admin/litiges/${id}/prendre-en-charge`);
    return res.data;
  },

  rendreDecisionLitige: async (id, { decision, montantRembourse, noteAdmin }) => {
    if (isMockEnabled()) {
      await delay(400, 600);
      return { id, statut: 'RESOLU', decision, montantRembourse, noteAdmin };
    }
    const res = await client.post(`/api/admin/litiges/${id}/decision`, {
      decision,
      montantRembourse: montantRembourse ? Number(montantRembourse) : null,
      noteAdmin,
    });
    return res.data;
  },

  // 5. ANALYTICS & VOLUMES RÉGIONAUX
  getAnalytics: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      return MOCK_ANALYTICS;
    }
    try {
      const res = await client.get('/api/admin/analytics');
      return res.data;
    } catch {
      return MOCK_ANALYTICS;
    }
  },

  exportAnalyticsCsv: async () => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const csv = 'Region,VolumeMAD,PartPourcent\nCasablanca-Settat,1950000,40.2\nTanger-Tetouan,1420000,29.3\n';
      return new Blob([csv], { type: 'text/csv' });
    }
    const res = await client.get('/api/admin/analytics/export', { responseType: 'blob' });
    return res.data;
  },
};

export default adminService;
