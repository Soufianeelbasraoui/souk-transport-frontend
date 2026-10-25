import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour le téléchargement PDF et archive ZIP des factures certifiées.
 * Connecté à FactureController de Spring Boot :
 * - GET  /api/factures/{id}/pdf
 * - POST /api/factures/telecharger-selection
 */

export const factureService = {
  telechargerFacturePdf: async (id) => {
    if (isMockEnabled()) {
      await delay(250, 400);
      const dummy = `%PDF-1.4\n%Facture SoukTransport #${id}\n1 0 obj<<>>endobj\ntrailer<<>>%%EOF`;
      return new Blob([dummy], { type: 'application/pdf' });
    }
    const res = await client.get(`/api/factures/${id}/pdf`, { responseType: 'blob' });
    return res.data;
  },

  telechargerFacturesZip: async (factureIds) => {
    if (isMockEnabled()) {
      await delay(350, 600);
      const dummy = `PK\x03\x04FacturesZipArchive`;
      return new Blob([dummy], { type: 'application/zip' });
    }
    const res = await client.post('/api/factures/telecharger-selection', factureIds, {
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * Helper pour déclencher le téléchargement d'un Blob dans le navigateur
   */
  declencherTelechargement: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default factureService;
