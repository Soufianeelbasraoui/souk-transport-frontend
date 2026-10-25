import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour la gestion des formules d'abonnements et quotas transporteur.
 * Connecté à AbonnementController de Spring Boot :
 * - GET  /api/abonnements/plans
 * - POST /api/abonnements
 * - GET  /api/abonnements/mon-abonnement
 */

const MOCK_PLANS = [
  {
    id: 1,
    code: 'STANDARD',
    nom: 'Formule Standard',
    description: 'Idéal pour les transporteurs indépendants et artisans.',
    prixMad: 0,
    trajetsActifsMax: 5,
    tauxCommission: 0.10,
    supportPrioritaire: false,
    analyticsAvances: false,
    actif: true,
  },
  {
    id: 2,
    code: 'PRO',
    nom: 'Formule Pro',
    description: 'Pour les flottes moyennes recherchant plus de volume et commission réduite.',
    prixMad: 499,
    trajetsActifsMax: 25,
    tauxCommission: 0.07,
    supportPrioritaire: true,
    analyticsAvances: true,
    actif: true,
  },
  {
    id: 3,
    code: 'FLOTTE',
    nom: 'Formule Entreprise & Flotte',
    description: 'Volume illimité, commission minimale à 5% et gestionnaire de compte dédié.',
    prixMad: 1299,
    trajetsActifsMax: 999,
    tauxCommission: 0.05,
    supportPrioritaire: true,
    analyticsAvances: true,
    actif: true,
  },
];

let MOCK_MON_ABONNEMENT = {
  id: 1,
  userId: 1,
  userEmail: 'transporteur@souktransport.ma',
  plan: MOCK_PLANS[1], // PRO
  debut: new Date(Date.now() - 86400000 * 15).toISOString(),
  fin: new Date(Date.now() + 86400000 * 15).toISOString(),
  statut: 'ACTIF',
  renouvellementAuto: true,
  createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
};

export const abonnementService = {
  getPlans: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_PLANS;
    }
    try {
      const res = await client.get('/api/abonnements/plans');
      return Array.isArray(res.data) && res.data.length > 0 ? res.data : MOCK_PLANS;
    } catch {
      return MOCK_PLANS;
    }
  },

  getMonAbonnement: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_MON_ABONNEMENT;
    }
    try {
      const res = await client.get('/api/abonnements/mon-abonnement');
      return res.data;
    } catch {
      return MOCK_MON_ABONNEMENT;
    }
  },

  souscrirePlan: async (planCode) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const plan = MOCK_PLANS.find((p) => p.code === planCode) || MOCK_PLANS[1];
      MOCK_MON_ABONNEMENT = {
        ...MOCK_MON_ABONNEMENT,
        plan,
        debut: new Date().toISOString(),
        fin: new Date(Date.now() + 86400000 * 30).toISOString(),
        statut: 'ACTIF',
      };
      return MOCK_MON_ABONNEMENT;
    }
    const res = await client.post('/api/abonnements', { planCode });
    return res.data;
  },
};

export default abonnementService;
