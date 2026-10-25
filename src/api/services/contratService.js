import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour les Contrats de transport et Signature électronique.
 * Connecté à ContratController de Spring Boot :
 * - GET  /api/contrats/{id}
 * - GET  /api/contrats/offre/{offreId}
 * - POST /api/contrats/{id}/signer
 * - GET  /api/contrats/{id}/pdf
 */

const MOCK_CONTRAT = {
  id: 1,
  offreId: 201,
  referenceContrat: 'CTR-2025-0089',
  dateCreation: new Date(Date.now() - 86400000 * 2).toISOString(),
  expediteurNom: 'Société Agro-Atlas SARL',
  transporteurNom: 'Mohamed El Fassi Transport',
  immatriculationCamion: '12345-A-6',
  villeDepart: 'Casablanca (Zone Industrielle)',
  villeArrivee: 'Tanger (Port Tanger Med)',
  marchandiseType: 'Palettes Agroalimentaires (Huile & Conserves)',
  poidsKg: 2500,
  prixTotalMAD: 3450,
  statut: 'SIGNE_PARTIELLEMENT',
  expediteurSigne: true,
  expediteurDateSignature: new Date(Date.now() - 3600000 * 5).toISOString(),
  transporteurSigne: false,
  transporteurDateSignature: null,
  conditionsGenerales: 'Conforme au Code de Commerce marocain et dahir relatif aux transports terrestres de marchandises. Responsabilité limitée aux termes de la police d’assurance fret contractée.',
};

export const contratService = {
  getContratById: async (id) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return { ...MOCK_CONTRAT, id: Number(id) };
    }
    try {
      const res = await client.get(`/api/contrats/${id}`);
      return res.data;
    } catch {
      return { ...MOCK_CONTRAT, id: Number(id) };
    }
  },

  getContratParOffre: async (offreId) => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return { ...MOCK_CONTRAT, offreId: Number(offreId) };
    }
    try {
      const res = await client.get(`/api/contrats/offre/${offreId}`);
      return res.data;
    } catch {
      return { ...MOCK_CONTRAT, offreId: Number(offreId) };
    }
  },

  signerContrat: async (id, { codePin = '1234', nomSignataire = '', acceptationCgv = true } = {}) => {
    if (isMockEnabled()) {
      await delay(300, 600);
      MOCK_CONTRAT.transporteurSigne = true;
      MOCK_CONTRAT.transporteurDateSignature = new Date().toISOString();
      MOCK_CONTRAT.statut = 'SIGNE';
      return { ...MOCK_CONTRAT };
    }
    const res = await client.post(`/api/contrats/${id}/signer`, {
      codePin,
      nomSignataire,
      acceptationCgv,
    });
    return res.data;
  },

  telechargerPdf: async (id) => {
    if (isMockEnabled()) {
      await delay(300, 500);
      const dummyPdfContent = `%PDF-1.4\n%Contrat SoukTransport #${id}\n1 0 obj<<>>endobj\ntrailer<<>>%%EOF`;
      return new Blob([dummyPdfContent], { type: 'application/pdf' });
    }
    const res = await client.get(`/api/contrats/${id}/pdf`, { responseType: 'blob' });
    return res.data;
  },
};

export default contratService;
