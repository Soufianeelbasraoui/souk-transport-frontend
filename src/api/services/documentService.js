import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour la gestion documentaire et KYC Transporteur.
 * Connecté à DocumentController et FichierController de Spring Boot :
 * - POST /api/fichiers/upload
 * - POST /api/documents
 * - GET  /api/documents/mes-documents
 */

const MOCK_DOCUMENTS = [
  {
    id: 1,
    typeDocument: 'CIN',
    nomFichier: 'cin_recto_verso_elfassi.pdf',
    statut: 'VALIDE',
    dateUpload: '2024-10-15T09:30:00',
    dateExpiration: '2029-10-15',
    url: '#',
  },
  {
    id: 2,
    typeDocument: 'PERMIS',
    nomFichier: 'permis_conduire_ec.pdf',
    statut: 'VALIDE',
    dateUpload: '2024-10-15T09:35:00',
    dateExpiration: '2028-05-20',
    url: '#',
  },
  {
    id: 3,
    typeDocument: 'RC',
    nomFichier: 'registre_commerce_casablanca.pdf',
    statut: 'VALIDE',
    dateUpload: '2024-10-16T11:00:00',
    dateExpiration: null,
    url: '#',
  },
  {
    id: 4,
    typeDocument: 'ASSURANCE',
    nomFichier: 'police_assurance_marchandises_2025.pdf',
    statut: 'EN_ATTENTE',
    dateUpload: '2025-01-10T14:20:00',
    dateExpiration: '2026-01-09',
    url: '#',
  },
];

export const documentService = {
  getMesDocuments: async () => {
    if (isMockEnabled()) {
      await delay(200, 350);
      return MOCK_DOCUMENTS;
    }
    try {
      const res = await client.get('/api/documents/mes-documents');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return MOCK_DOCUMENTS;
    }
  },

  uploadFichier: async (file) => {
    if (isMockEnabled()) {
      await delay(300, 600);
      return {
        nomFichier: file.name,
        url: URL.createObjectURL(file),
        tailleOctets: file.size,
      };
    }
    const formData = new FormData();
    formData.append('fichier', file);
    const res = await client.post('/api/fichiers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  enregistrerDocument: async ({ typeDocument, nomFichier, urlFichier, dateExpiration = null }) => {
    if (isMockEnabled()) {
      await delay(200, 400);
      const newDoc = {
        id: Date.now(),
        typeDocument,
        nomFichier,
        statut: 'EN_ATTENTE',
        dateUpload: new Date().toISOString(),
        dateExpiration,
        url: urlFichier,
      };
      MOCK_DOCUMENTS.push(newDoc);
      return newDoc;
    }
    const res = await client.post('/api/documents', {
      typeDocument,
      nomFichier,
      urlFichier,
      dateExpiration,
    });
    return res.data;
  },
};

export default documentService;
