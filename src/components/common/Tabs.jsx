import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 0,
        marginBottom: 20,
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange && onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#1A3A5C' : '#718096',
              borderBottom: isActive ? '2px solid #F57C00' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 10,
                  backgroundColor: isActive ? '#FFF3E0' : '#EDF2F7',
                  color: isActive ? '#F57C00' : '#718096',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
