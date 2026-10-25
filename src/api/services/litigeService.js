import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour la déclaration et gestion des Litiges / Réclamations.
 * Connecté à LitigeController de Spring Boot :
 * - POST /api/litiges
 * - POST /api/litiges/{id}/preuves
 * - POST /api/litiges/{id}/messages
 * - GET  /api/litiges/mes-litiges
 * - GET  /api/litiges/{id}
 */

const MOCK_MES_LITIGES = [
  {
    id: 1,
    reference: 'LIT-2025-001',
    offreId: 201,
    motif: 'Marchandise endommagée durant le transport',
    description: '3 fûts d’huile d’argan renversés et abîmés lors du déchargement à Casablanca. Constat établi avec le chauffeur.',
    statut: 'OUVERT',
    urgent: true,
    montantEnJeu: 12500,
    preuves: ['constat_avarie_signe.pdf', 'photo_futs_endommages.jpg'],
    ouvertParNom: 'Société Agro-Atlas',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    messages: [
      {
        id: 1,
        auteurNom: 'Société Agro-Atlas',
        contenu: 'Bonjour, les fûts sont arrivés perforés. Nous demandons le remboursement du préjudice.',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        estMoi: false,
      },
      {
        id: 2,
        auteurNom: 'Mohamed El Fassi Transport',
        contenu: 'Le sanglage a été vérifié au départ de Marrakech. Le déchargement a été effectué par l’équipe du client.',
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        estMoi: true,
      },
    ],
  },
];

export const litigeService = {
  getMesLitiges: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_MES_LITIGES;
    }
    try {
      const res = await client.get('/api/litiges/mes-litiges');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn('API /api/litiges/mes-litiges non joignable, fallback démo:', err.message);
      return MOCK_MES_LITIGES;
    }
  },

  getDetailLitige: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_MES_LITIGES.find((l) => l.id === Number(id)) || MOCK_MES_LITIGES[0];
    }
    try {
      const res = await client.get(`/api/litiges/${id}`);
      return res.data;
    } catch {
      return MOCK_MES_LITIGES.find((l) => l.id === Number(id)) || MOCK_MES_LITIGES[0];
    }
  },

  creerLitige: async ({ offreId, motif, description, montantEnJeu, urgent = false }) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const created = {
        id: Date.now(),
        reference: `LIT-2025-${Math.floor(100 + Math.random() * 900)}`,
        offreId: Number(offreId),
        motif,
        description,
        montantEnJeu: Number(montantEnJeu) || 0,
        statut: 'OUVERT',
        urgent,
        preuves: [],
        messages: [
          {
            id: Date.now(),
            auteurNom: 'Moi',
            contenu: description,
            createdAt: new Date().toISOString(),
            estMoi: true,
          },
        ],
        createdAt: new Date().toISOString(),
      };
      MOCK_MES_LITIGES.unshift(created);
      return created;
    }
    const res = await client.post('/api/litiges', {
      offreId: Number(offreId),
      motif,
      description,
      montantEnJeu: montantEnJeu ? Number(montantEnJeu) : null,
      urgent,
    });
    return res.data;
  },

  ajouterMessage: async (litigeId, contenu) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      const msg = {
        id: Date.now(),
        auteurNom: 'Moi',
        contenu,
        createdAt: new Date().toISOString(),
        estMoi: true,
      };
      const litige = MOCK_MES_LITIGES.find((l) => l.id === Number(litigeId));
      if (litige) {
        if (!litige.messages) litige.messages = [];
        litige.messages.push(msg);
      }
      return msg;
    }
    const res = await client.post(`/api/litiges/${litigeId}/messages`, { contenu });
    return res.data;
  },

  ajouterPreuve: async (litigeId, file) => {
    if (isMockEnabled()) {
      await delay(400, 700);
      const litige = MOCK_MES_LITIGES.find((l) => l.id === Number(litigeId));
      if (litige) {
        if (!litige.preuves) litige.preuves = [];
        litige.preuves.push(file.name || 'preuve_jointe.pdf');
      }
      return { success: true, nomFichier: file.name };
    }
    const formData = new FormData();
    formData.append('fichier', file);
    const res = await client.post(`/api/litiges/${litigeId}/preuves`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default litigeService;
