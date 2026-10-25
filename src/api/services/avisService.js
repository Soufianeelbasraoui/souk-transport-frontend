import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour la réputation et les avis clients.
 * Connecté à AvisController de Spring Boot :
 * - POST /api/avis
 * - GET  /api/avis/transporteur/{id}
 * - GET  /api/avis/mes-avis
 */

const MOCK_AVIS = [
  {
    id: 1,
    transporteurId: 1,
    cargaisonId: 301,
    auteurNom: 'Sara Alami (Société Agro-Atlas)',
    noteGlobale: 5,
    notePonctualite: 5,
    noteSoinMarchandise: 5,
    noteCommunication: 5,
    commentaire: 'Excellente prestation pour nos fûts d’huile. Chauffeur très ponctuel et camion parfaitement équipé avec hayon.',
    trajetRoute: 'Casablanca → Tanger',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    transporteurId: 1,
    cargaisonId: 304,
    auteurNom: 'Hassan Tazi (Textiles du Nord)',
    noteGlobale: 4.5,
    notePonctualite: 4,
    noteSoinMarchandise: 5,
    noteCommunication: 4.5,
    commentaire: 'Très bon service. Livraison arrivée en parfait état à Tanger Med.',
    trajetRoute: 'Fès → Tanger',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 3,
    transporteurId: 1,
    cargaisonId: 308,
    auteurNom: 'Maroc Fret Distribution',
    noteGlobale: 5,
    notePonctualite: 5,
    noteSoinMarchandise: 5,
    noteCommunication: 5,
    commentaire: 'Partenaire de confiance. Trajets réguliers sans aucun incident.',
    trajetRoute: 'Casablanca → Marrakech',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const avisService = {
  getAvisParTransporteur: async (transporteurId) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_AVIS;
    }
    try {
      const res = await client.get(`/api/avis/transporteur/${transporteurId}`);
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return MOCK_AVIS;
    }
  },

  getMesAvis: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_AVIS;
    }
    try {
      const res = await client.get('/api/avis/mes-avis');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return MOCK_AVIS;
    }
  },

  creerAvis: async ({ cargaisonId, transporteurId, noteGlobale, notePonctualite, noteSoinMarchandise, noteCommunication, commentaire }) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const newAvis = {
        id: Date.now(),
        transporteurId: Number(transporteurId),
        cargaisonId: Number(cargaisonId),
        auteurNom: 'Moi (Expéditeur vérifié)',
        noteGlobale: Number(noteGlobale),
        notePonctualite: Number(notePonctualite || noteGlobale),
        noteSoinMarchandise: Number(noteSoinMarchandise || noteGlobale),
        noteCommunication: Number(noteCommunication || noteGlobale),
        commentaire,
        trajetRoute: 'Trajet certifié',
        createdAt: new Date().toISOString(),
      };
      MOCK_AVIS.unshift(newAvis);
      return newAvis;
    }
    const res = await client.post('/api/avis', {
      cargaisonId: Number(cargaisonId),
      transporteurId: Number(transporteurId),
      noteGlobale: Number(noteGlobale),
      notePonctualite: notePonctualite ? Number(notePonctualite) : undefined,
      noteSoinMarchandise: noteSoinMarchandise ? Number(noteSoinMarchandise) : undefined,
      noteCommunication: noteCommunication ? Number(noteCommunication) : undefined,
      commentaire,
    });
    return res.data;
  },
};

export default avisService;
