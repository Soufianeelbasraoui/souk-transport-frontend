import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour le Chat et la Messagerie instantanée.
 * Aligné sur ChatController Spring Boot :
 * - GET   /api/conversations
 * - GET   /api/conversations/{id}
 * - POST  /api/conversations/offre/{offreId}
 * - GET   /api/conversations/{id}/messages
 * - POST  /api/conversations/{id}/messages
 * - PATCH /api/conversations/{id}/lu
 */

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    offreId: 201,
    titre: 'Transport Casablanca → Tanger (Société Agro-Atlas)',
    interlocuteurNom: 'Mohamed El Fassi Transport',
    interlocuteurRole: 'TRANSPORTEUR',
    dernierMessage: 'Le camion sera sur le quai de chargement demain à 08h30.',
    dernierMessageDate: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    nonLusCount: 1,
  },
  {
    id: 2,
    offreId: 202,
    titre: 'Cargaison Textiles Tanger → Marrakech',
    interlocuteurNom: 'Sara Alami (Textiles du Nord)',
    interlocuteurRole: 'EXPEDITEUR',
    dernierMessage: 'Pouvez-vous nous confirmer la présence du hayon élévateur ?',
    dernierMessageDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    nonLusCount: 0,
  },
];

const MOCK_MESSAGES = {
  1: [
    {
      id: 101,
      conversationId: 1,
      expediteurNom: 'Société Agro-Atlas',
      contenu: 'Bonjour Mohamed, nous avons 3 palettes prêtes pour Tanger.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      estMoi: false,
    },
    {
      id: 102,
      conversationId: 1,
      expediteurNom: 'Moi',
      contenu: 'Parfait, le semi-remorque est déjà programmé avec bâche sécurisée.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      estMoi: true,
    },
    {
      id: 103,
      conversationId: 1,
      expediteurNom: 'Société Agro-Atlas',
      contenu: 'Le camion sera sur le quai de chargement demain à 08h30.',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      estMoi: false,
    },
  ],
  2: [
    {
      id: 201,
      conversationId: 2,
      expediteurNom: 'Moi',
      contenu: 'Bonjour Sara, nous avons bien pris note de votre demande d’expédition.',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      estMoi: true,
    },
    {
      id: 202,
      conversationId: 2,
      expediteurNom: 'Sara Alami',
      contenu: 'Pouvez-vous nous confirmer la présence du hayon élévateur ?',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      estMoi: false,
    },
  ],
};

export const chatService = {
  getMesConversations: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_CONVERSATIONS;
    }
    try {
      const res = await client.get('/api/conversations');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn('API conversations non joignable, fallback démo activé:', err.message);
      return MOCK_CONVERSATIONS;
    }
  },

  getConversationById: async (id) => {
    if (isMockEnabled()) {
      await delay(150, 250);
      return MOCK_CONVERSATIONS.find((c) => c.id === Number(id)) || MOCK_CONVERSATIONS[0];
    }
    try {
      const res = await client.get(`/api/conversations/${id}`);
      return res.data;
    } catch {
      return MOCK_CONVERSATIONS.find((c) => c.id === Number(id)) || MOCK_CONVERSATIONS[0];
    }
  },

  ouvrirConversationParOffre: async (offreId) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      const exist = MOCK_CONVERSATIONS.find((c) => c.offreId === Number(offreId));
      if (exist) return exist;
      const created = {
        id: Date.now(),
        offreId: Number(offreId),
        titre: `Discussion Offre #${offreId}`,
        interlocuteurNom: 'Interlocuteur SoukTransport',
        interlocuteurRole: 'TRANSPORTEUR',
        dernierMessage: 'Conversation initiée.',
        dernierMessageDate: new Date().toISOString(),
        nonLusCount: 0,
      };
      MOCK_CONVERSATIONS.unshift(created);
      return created;
    }
    const res = await client.post(`/api/conversations/offre/${offreId}`);
    return res.data;
  },

  getMessages: async (conversationId, page = 0, size = 50) => {
    if (isMockEnabled()) {
      await delay(150, 300);
      const list = MOCK_MESSAGES[conversationId] || [];
      return {
        content: list,
        totalElements: list.length,
        totalPages: 1,
      };
    }
    try {
      const res = await client.get(`/api/conversations/${conversationId}/messages`, {
        params: { page, size },
      });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch {
      const list = MOCK_MESSAGES[conversationId] || [];
      return { content: list, totalElements: list.length, totalPages: 1 };
    }
  },

  envoyerMessage: async (conversationId, contenu) => {
    if (isMockEnabled()) {
      await delay(150, 250);
      const msg = {
        id: Date.now(),
        conversationId: Number(conversationId),
        expediteurNom: 'Moi',
        contenu,
        createdAt: new Date().toISOString(),
        estMoi: true,
      };
      if (!MOCK_MESSAGES[conversationId]) {
        MOCK_MESSAGES[conversationId] = [];
      }
      MOCK_MESSAGES[conversationId].push(msg);
      return msg;
    }
    const res = await client.post(`/api/conversations/${conversationId}/messages`, { contenu });
    return res.data;
  },

  marquerCommeLu: async (conversationId) => {
    if (isMockEnabled()) {
      const conv = MOCK_CONVERSATIONS.find((c) => c.id === Number(conversationId));
      if (conv) conv.nonLusCount = 0;
      return { message: 'Conversation marquée comme lue.' };
    }
    try {
      const res = await client.patch(`/api/conversations/${conversationId}/lu`);
      return res.data;
    } catch {
      return { message: 'Conversation marquée comme lue.' };
    }
  },
};

export default chatService;
