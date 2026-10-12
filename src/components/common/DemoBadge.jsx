import React from 'react';
import { isMockEnabled } from '../../api/mockUtils';

/**
 * Badge discret "DÉMO" affiché sur les écrans ou composants utilisant des mocks.
 */
export const DemoBadge = ({ force = false, className = '' }) => {
  if (!force && !isMockEnabled()) return null;

  return (
    <span
      className={`st-badge-demo ${className}`.trim()}
      title="Cette vue utilise des données simulées (mode démonstration)"
    >
      Démo
    </span>
  );
};

export default DemoBadge;
