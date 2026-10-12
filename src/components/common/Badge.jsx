import React from 'react';
import { getStatusMeta } from '../../utils/statusMap';

/**
 * Badge de statut ou tag.
 * @param {string} [status] Code d'un statut backend (utilise automatiquement statusMap)
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'neutral'} [variant]
 * @param {boolean} [showIcon=true] Affiche ou non l'icône associée
 * @param {React.ReactNode} [children]
 */
export const Badge = ({
  status,
  variant,
  showIcon = true,
  className = '',
  style = {},
  children,
}) => {
  if (status) {
    const meta = getStatusMeta(status);
    const Icon = meta.icon;
    const finalVariant = variant || meta.variant || 'neutral';

    return (
      <span
        className={`st-badge st-badge-${finalVariant} ${className}`.trim()}
        style={{
          color: meta.color,
          backgroundColor: meta.bg,
          ...style,
        }}
      >
        {showIcon && Icon && <Icon size={12} />}
        <span>{children || meta.label}</span>
      </span>
    );
  }

  const finalVariant = variant || 'neutral';

  return (
    <span className={`st-badge st-badge-${finalVariant} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
};

export default Badge;
