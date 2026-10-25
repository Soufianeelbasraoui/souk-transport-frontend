import client, { getStoredToken } from '../client';
import { isMockEnabled, delay, mockPagedResponse } from '../mockUtils';

/**
 * Service API Notifications aligné sur NotificationController de Spring Boot :
 * - GET   /api/notifications (avec filtre lues, pageable)
 * - GET   /api/notifications/non-lues/count
 * - PATCH /api/notifications/{id}/lire
 * - PATCH /api/notifications/lire-tout
 * - GET   /api/notifications/stream (SSE temps réel)
 */

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'OFFRE_RECUE',
    titre: 'Nouvelle offre reçue',
    contenu: 'Un expéditeur a proposé 2 400 DH pour le transport Tanger → Casablanca.',
    lien: '/transporteur/reservations',
    lue: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    type: 'PAIEMENT_RECU',
    titre: 'Paiement confirmé',
    contenu: 'Le paiement de 4 800 DH pour la cargaison #CRG-89 a été validé via CMI.',
    lien: '/expediteur/paiements',
    lue: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 3,
    type: 'OFFRE_ACCEPTEE',
    titre: 'Offre acceptée',
    contenu: 'Le transporteur Trans-Atlas Express a validé votre demande de fret.',
    lien: '/expediteur/cargaisons',
    lue: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 4,
    type: 'DOCUMENT_EXPIRE',
    titre: 'Rappel administratif',
    contenu: 'Votre police d’assurance fret arrive à échéance dans 15 jours.',
    lien: '/transporteur/camions',
    lue: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const notificationService = {
  /**
   * Récupère la liste paginée des notifications
   */
  getNotifications: async ({ page = 0, size = 15, lues = null } = {}) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      let list = [...MOCK_NOTIFICATIONS];
      if (lues !== null && lues !== undefined) {
        list = list.filter((n) => n.lue === lues);
      }
      return mockPagedResponse(list, page, size);
    }

    try {
      const params = { page, size };
      if (lues !== null && lues !== undefined) {
        params.lues = lues;
      }
      const res = await client.get('/api/notifications', { params });
      const raw = res.data;
      const content = raw.content || (Array.isArray(raw) ? raw : []);
      return {
        content,
        totalElements: raw.totalElements ?? content.length,
        totalPages: raw.totalPages ?? 1,
      };
    } catch (err) {
      console.warn('API notifications non joignable, fallback local:', err.message);
      let list = [...MOCK_NOTIFICATIONS];
      if (lues !== null && lues !== undefined) {
        list = list.filter((n) => n.lue === lues);
      }
      return mockPagedResponse(list, page, size);
    }
  },

  /**
   * Obtient le nombre de notifications non lues
   */
  getNonLuesCount: async () => {
    if (isMockEnabled()) {
      await delay(100, 200);
      return MOCK_NOTIFICATIONS.filter((n) => !n.lue).length;
    }

    try {
      const res = await client.get('/api/notifications/non-lues/count');
      return res.data?.count ?? 0;
    } catch (err) {
      console.warn('API non-lues/count non joignable:', err.message);
      return MOCK_NOTIFICATIONS.filter((n) => !n.lue).length;
    }
  },

  /**
   * Marque une notification spécifique comme lue
   */
  marquerCommeLue: async (id) => {
    if (isMockEnabled()) {
      await delay(150, 300);
      const notif = MOCK_NOTIFICATIONS.find((n) => n.id === Number(id));
      if (notif) notif.lue = true;
      return notif || { id, lue: true };
    }

    try {
      const res = await client.patch(`/api/notifications/${id}/lire`);
      return res.data;
    } catch (err) {
      console.warn('API marquerCommeLue échoué:', err.message);
      return { id, lue: true };
    }
  },

  /**
   * Marque toutes les notifications comme lues
   */
  marquerToutCommeLu: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      MOCK_NOTIFICATIONS.forEach((n) => {
        n.lue = true;
      });
      return { message: 'Toutes les notifications ont été marquées comme lues.' };
    }

    try {
      const res = await client.patch('/api/notifications/lire-tout');
      return res.data;
    } catch (err) {
      console.warn('API marquerToutCommeLu échoué:', err.message);
      return { message: 'Toutes les notifications marquées comme lues' };
    }
  },

  /**
   * Souscription au flux SSE (/api/notifications/stream)
   * Utilise fetch + ReadableStream pour transmettre le header Authorization Bearer JWT
   */
  subscribeToSseStream: (onNotification, onError) => {
    const token = getStoredToken();
    if (!token) return () => {};

    const controller = new AbortController();
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const streamUrl = `${baseURL}/api/notifications/stream`;

    let active = true;

    const connect = async () => {
      try {
        const response = await fetch(streamUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} sur stream notifications`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // Conserve le fragment incomplet

          for (const block of lines) {
            if (!block.trim()) continue;

            const eventMatch = block.match(/event:(.+)/);
            const dataMatch = block.match(/data:(.+)/);

            const eventName = eventMatch ? eventMatch[1].trim() : 'message';
            const dataStr = dataMatch ? dataMatch[1].trim() : '';

            if (eventName === 'NOTIFICATION' && dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                onNotification(parsed);
              } catch (e) {
                console.error('Erreur parsing SSE notification:', e);
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.debug('Connexion SSE fermée ou échouée:', err.message);
          if (onError) onError(err);
        }
      }
    };

    connect();

    return () => {
      active = false;
      controller.abort();
    };
  },
};

export default notificationService;
