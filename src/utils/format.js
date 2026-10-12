/**
 * Utilitaires de formatage standardisés pour l'application SoukTransport.
 * Conforme aux règles d'affichage B2B :
 * - Nombres : 1 247
 * - Monnaie : 1 200 DH
 * - Dates : 15 janvier 2025
 */

/**
 * Formate un nombre avec séparateur d'espace (ex: 1 247)
 * @param {number|string} value
 * @returns {string}
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0';
  return new Intl.NumberFormat('fr-FR').format(Number(value)).replace(/\u202F/g, ' ');
};

/**
 * Formate un montant en Dirhams marocains (ex: 1 200 DH)
 * @param {number|string} amount
 * @param {boolean} [includeDecimals=false]
 * @returns {string}
 */
export const formatCurrency = (amount, includeDecimals = false) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0 DH';
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num).replace(/\u202F/g, ' ');
  return `${formatted} DH`;
};

/**
 * Formate une date en format français complet (ex: 15 janvier 2025)
 * @param {string|Date} dateStr
 * @param {Object} [options]
 * @returns {string}
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    
    const defaultOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(date);
  } catch {
    return String(dateStr);
  }
};

/**
 * Formate une date et heure (ex: 15 janvier 2025 à 14:30)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    const datePart = formatDate(date);
    const timePart = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
    return `${datePart} à ${timePart}`;
  } catch {
    return String(dateStr);
  }
};

/**
 * Formate une date courte (ex: 15/01/2025)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  } catch {
    return String(dateStr);
  }
};

/**
 * Formate un poids en kg ou tonnes (ex: 850 kg ou 3,5 t)
 * @param {number|string} kg
 * @returns {string}
 */
export const formatWeight = (kg) => {
  if (kg === null || kg === undefined || isNaN(Number(kg))) return '0 kg';
  const val = Number(kg);
  if (val >= 1000) {
    const tonnes = (val / 1000).toFixed(1).replace('.0', '').replace('.', ',');
    return `${tonnes} t`;
  }
  return `${formatNumber(val)} kg`;
};

/**
 * Formate un volume en m³ (ex: 12,5 m³)
 * @param {number|string} m3
 * @returns {string}
 */
export const formatVolume = (m3) => {
  if (m3 === null || m3 === undefined || isNaN(Number(m3))) return '0 m³';
  const val = Number(m3);
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(val)} m³`;
};

/**
 * Formate un pourcentage (ex: 78 %)
 * @param {number|string} pct
 * @returns {string}
 */
export const formatPercent = (pct) => {
  if (pct === null || pct === undefined || isNaN(Number(pct))) return '0 %';
  const val = Math.round(Number(pct));
  return `${val} %`;
};

/**
 * Formate un temps relatif (ex: "il y a 2h", "hier", "dans 3 jours")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    
    if (diffSec < 60) return "À l'instant";
    if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
    if (diffSec < 172800) return 'Hier';
    return formatDateShort(date);
  } catch {
    return '';
  }
};
