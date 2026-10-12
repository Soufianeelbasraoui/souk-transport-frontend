/**
 * @file Contrats d'interfaces de services (JSDoc)
 * Chaque domaine définit les signatures attendues par les composants frontend.
 * Les implémentations 'real' et 'mock' doivent respecter ces signatures.
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 * @property {boolean} [rememberMe]
 */

/**
 * @typedef {Object} ExpediteurRegistration
 * @property {string} nom
 * @property {string} prenom
 * @property {string} email
 * @property {string} password
 * @property {string} telephone
 * @property {string} ville
 * @property {string} nomEntreprise
 * @property {string} adresseEntreprise
 */

/**
 * @typedef {Object} TransporteurRegistration
 * @property {string} nom
 * @property {string} prenom
 * @property {string} email
 * @property {string} password
 * @property {string} telephone
 * @property {string} ville
 * @property {string} cin
 * @property {string} numeroPermis
 * @property {string} ice
 * @property {string} nomEntreprise
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string|null} token
 * @property {string|null} [refreshToken]
 * @property {number} [userId]
 * @property {string} [email]
 * @property {'ADMIN'|'TRANSPORTEUR'|'EXPEDITEUR'} [role]
 * @property {string} [nom]
 * @property {string} [prenom]
 */

export const DOMAIN_SERVICES = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  TRAJET: 'trajet',
  OFFRE: 'offre',
  CAMION: 'camion',
  FINANCE: 'finance',
  ADMIN: 'admin',
  GPS: 'gps',
  LITIGE: 'litige',
  VERIFICATION: 'verification',
};
