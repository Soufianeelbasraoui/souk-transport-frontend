import client from '../client';
import { isMockEnabled, delay } from '../mockUtils';

/**
 * Service API pour le Moteur d'estimation de tarification dynamique.
 * Connecté à TarificationController de Spring Boot :
 * - POST /api/tarification/estimer
 */

export const VALID_TYPES_MARCHANDISE = [
  'ALIMENTAIRE',
  'REFRIGERE',
  'MATERIAUX',
  'TEXTILE',
  'ELECTRONIQUE',
  'FRAGILE',
  'DANGEREUX',
];

export const tarificationService = {
  estimerTarif: async ({
    villeDepart,
    villeArrivee,
    poids = 1000,
    volume = 5,
    typeMarchandise = null,
    dateDepart = null,
    retourAVide = false,
  }) => {
    // Sanitisation du type de marchandise pour correspondre rigoureusement à l'enum TypeMarchandise du backend Spring Boot
    let sanitizedType = typeMarchandise || null;
    if (sanitizedType === 'FRIGO' || sanitizedType === 'PERISSABLE') {
      sanitizedType = 'REFRIGERE';
    } else if (sanitizedType === 'GENERAL' || sanitizedType === 'STANDARD' || sanitizedType === '' || !VALID_TYPES_MARCHANDISE.includes(sanitizedType)) {
      sanitizedType = null;
    }

    if (isMockEnabled()) {
      await delay(250, 450);
      const dist = 320; // km approximatif
      const basePrix = (Number(poids) || 1000) * 0.70 + dist * 3.5;
      const min = Math.round(basePrix * 0.85);
      const conseill = Math.round(basePrix);
      const max = Math.round(basePrix * 1.25);
      return {
        estimationMin: min,
        estimationConseillee: conseill,
        estimationMax: max,
        detailsCalcul: {
          distanceKm: dist,
          prixCarburantEstime: Math.round(dist * 2.2),
          fraisPeageEstimes: 120,
          majorationFrigo: sanitizedType === 'REFRIGERE' ? 1.25 : 1.0,
          remiseRetourAVide: retourAVide ? 0.75 : 1.0,
        },
      };
    }
    try {
      const payload = {
        villeDepart,
        villeArrivee,
        poids: Number(poids) || 1000,
        volume: volume ? Number(volume) : null,
        typeMarchandise: sanitizedType,
        dateDepart: dateDepart || null,
        retourAVide: Boolean(retourAVide),
      };

      const res = await client.post('/api/tarification/estimer', payload);
      return res.data;
    } catch (err) {
      console.warn('API tarification non joignable, estimation locale:', err.message);
      const dist = 320;
      const basePrix = (Number(poids) || 1000) * 0.70 + dist * 3.5;
      return {
        estimationMin: Math.round(basePrix * 0.85),
        estimationConseillee: Math.round(basePrix),
        estimationMax: Math.round(basePrix * 1.25),
        detailsCalcul: {
          distanceKm: dist,
          prixCarburantEstime: Math.round(dist * 2.2),
          fraisPeageEstimes: 120,
        },
      };
    }
  },
};

export default tarificationService;
