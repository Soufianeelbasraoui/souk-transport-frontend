import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = false,
  label = null,
  color = '#1A3A5C',
  height = 8,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={className} style={{ width: '100%' }}>
      {(showLabel || label) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 4,
            color: '#718096',
          }}
        >
          <span>{label || 'Progression'}</span>
          <span style={{ fontWeight: 600, color: '#1A202C' }}>{percentage}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: '#E2E8F0',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: height / 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
