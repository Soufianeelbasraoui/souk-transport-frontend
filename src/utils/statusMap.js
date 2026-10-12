import React from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertTriangle,
  FiTruck,
  FiPackage,
  FiShield,
  FiDollarSign,
  FiUserCheck,
  FiUserX,
  FiPlay,
  FiArchive,
} from 'react-icons/fi';

/**
 * Dictionnaire complet des statuts et types du backend SoukTransport.
 * Fournit pour chaque enum :
 * - label : libellé français clair
 * - variant : type de couleur ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'neutral')
 * - color : couleur hex texte/bordure
 * - bg : couleur hex de fond léger (pill/badge)
 * - icon : composant React d'icône
 */

export const statusMap = {
  // StatutTrajet
  BROUILLON: {
    label: 'Brouillon',
    variant: 'neutral',
    color: '#718096',
    bg: '#EDF2F7',
    icon: FiArchive,
  },
  PUBLIE: {
    label: 'Publié',
    variant: 'primary',
    color: '#1A3A5C',
    bg: '#E2E8F0',
    icon: FiCheckCircle,
  },
  COMPLET: {
    label: 'Complet',
    variant: 'info',
    color: '#2B6CB0',
    bg: '#EBF8FF',
    icon: FiTruck,
  },
  EN_COURS: {
    label: 'En cours',
    variant: 'warning',
    color: '#D69E2E',
    bg: '#FEFCBF',
    icon: FiPlay,
  },
  TERMINE: {
    label: 'Terminé',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },
  ANNULE: {
    label: 'Annulé',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiXCircle,
  },

  // StatutOffre
  EN_ATTENTE: {
    label: 'En attente',
    variant: 'warning',
    color: '#B7791F',
    bg: '#FEFCBF',
    icon: FiClock,
  },
  CONTRE_OFFRE: {
    label: 'Contre-offre',
    variant: 'secondary',
    color: '#F57C00',
    bg: '#FFF3E0',
    icon: FiDollarSign,
  },
  ACCEPTEE: {
    label: 'Acceptée',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },
  REFUSEE: {
    label: 'Refusée',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiXCircle,
  },
  EXPIREE: {
    label: 'Expirée',
    variant: 'neutral',
    color: '#718096',
    bg: '#EDF2F7',
    icon: FiClock,
  },

  // StatutReservation
  ANNULEE: {
    label: 'Annulée',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiXCircle,
  },

  // StatutCargaison
  SOUMISE: {
    label: 'Soumise',
    variant: 'neutral',
    color: '#4A5568',
    bg: '#EDF2F7',
    icon: FiPackage,
  },
  EN_ATTENTE_PAIEMENT: {
    label: 'En attente de paiement',
    variant: 'warning',
    color: '#DD6B20',
    bg: '#FEEBC8',
    icon: FiDollarSign,
  },
  EN_TRANSIT: {
    label: 'En transit',
    variant: 'primary',
    color: '#1A3A5C',
    bg: '#E2E8F0',
    icon: FiTruck,
  },
  LIVREE: {
    label: 'Livrée',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },

  // StatutPaiement
  PAYE: {
    label: 'Payé',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },
  LIBERE: {
    label: 'Fonds libérés',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },
  REMBOURSE: {
    label: 'Remboursé',
    variant: 'neutral',
    color: '#4A5568',
    bg: '#EDF2F7',
    icon: FiDollarSign,
  },
  LITIGE: {
    label: 'En litige',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiAlertTriangle,
  },

  // StatutUser
  ACTIF: {
    label: 'Actif',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiUserCheck,
  },
  SUSPENDU: {
    label: 'Suspendu',
    variant: 'warning',
    color: '#C05621',
    bg: '#FEEBC8',
    icon: FiAlertTriangle,
  },
  BANNI: {
    label: 'Banni',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiUserX,
  },

  // StatutVerification & Document
  APPROUVE: {
    label: 'Approuvé',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiShield,
  },
  VALIDE: {
    label: 'Validé',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiShield,
  },
  REJETE: {
    label: 'Rejeté',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiXCircle,
  },

  // StatutLitige
  OUVERT: {
    label: 'Ouvert',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiAlertTriangle,
  },
  RESOLU: {
    label: 'Résolu',
    variant: 'success',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: FiCheckCircle,
  },

  // Rôles
  TRANSPORTEUR: {
    label: 'Transporteur',
    variant: 'primary',
    color: '#1A3A5C',
    bg: '#E2E8F0',
    icon: FiTruck,
  },
  EXPEDITEUR: {
    label: 'Expéditeur',
    variant: 'secondary',
    color: '#F57C00',
    bg: '#FFF3E0',
    icon: FiPackage,
  },
  ADMIN: {
    label: 'Administrateur',
    variant: 'danger',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: FiShield,
  },

  // TypeCamion
  FOURGON: { label: 'Fourgon (jusqu’à 1,5t)', variant: 'neutral' },
  CAMION_3T: { label: 'Camion 3,5t', variant: 'neutral' },
  CAMION_5T: { label: 'Camion 5t', variant: 'neutral' },
  CAMION_10T: { label: 'Porteur 10t', variant: 'neutral' },
  CAMION_15T: { label: 'Porteur 15t', variant: 'neutral' },
  CAMION_20T: { label: 'Porteur 20t', variant: 'neutral' },
  PLATEAU: { label: 'Plateau', variant: 'neutral' },
  BENNE: { label: 'Benne', variant: 'neutral' },
  FRIGORIFIQUE: { label: 'Frigorifique', variant: 'neutral' },
  CITERNE: { label: 'Citerne', variant: 'neutral' },
  PORTE_CONTENEUR: { label: 'Porte-conteneur', variant: 'neutral' },
  PORTE_VOITURES: { label: 'Porte-voitures', variant: 'neutral' },
  SEMI: { label: 'Semi-remorque (38t-40t)', variant: 'neutral' },

  // Equipement
  HAYON: { label: 'Hayon élévateur' },
  REFRIGERATION: { label: 'Groupe frigorifique' },
  GPS: { label: 'Traceur GPS actif' },
  BACHE: { label: 'Bâché' },

  // TypeMarchandise
  ALIMENTAIRE: { label: 'Alimentaire' },
  ELECTRONIQUE: { label: 'Électronique & High-Tech' },
  FRAGILE: { label: 'Fragile' },
  TEXTILE: { label: 'Textile & Habillement' },
  MATERIAUX: { label: 'Matériaux de construction' },
  REFRIGERE: { label: 'Produits frais / Réfrigérés' },
  DANGEREUX: { label: 'Matières dangereuses (ADR)' },

  // MethodePaiement
  CMI: { label: 'Carte Bancaire (CMI)' },
  VIREMENT: { label: 'Virement bancaire' },
  CASH: { label: 'Espèces à la livraison' },
};

/**
 * Récupère les métadonnées d'un statut donné
 * @param {string} key
 * @returns {{ label: string, variant: string, color?: string, bg?: string, icon?: any }}
 */
export const getStatusMeta = (key) => {
  if (!key) {
    return {
      label: '-',
      variant: 'neutral',
      color: '#718096',
      bg: '#EDF2F7',
    };
  }
  return (
    statusMap[key] || {
      label: key.replace(/_/g, ' '),
      variant: 'neutral',
      color: '#718096',
      bg: '#EDF2F7',
    }
  );
};
