import React from 'react';
import { FiInbox } from 'react-icons/fi';

export const EmptyState = ({
  icon = null,
  title = 'Aucune donnée disponible',
  description = 'Il n’y a aucun élément à afficher pour le moment.',
  action = null,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#F0F2F5',
          color: '#718096',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          marginBottom: 16,
        }}
      >
        {icon || <FiInbox />}
      </div>
      <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#1A202C' }}>
        {title}
      </h4>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#718096', maxWidth: 380 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
