import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export const Breadcrumb = ({ items = [], showHome = true, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`st-breadcrumb ${className}`.trim()} aria-label="Fil d'Ariane">
      {showHome && (
        <div className="st-breadcrumb-item">
          <Link to="/" className="st-breadcrumb-link" title="Accueil">
            <FiHome size={14} />
          </Link>
          <FiChevronRight size={12} color="#A0AEC0" />
        </div>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="st-breadcrumb-item">
            {isLast || !item.path ? (
              <span className="st-breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.path} className="st-breadcrumb-link">
                {item.label}
              </Link>
            )}
            {!isLast && <FiChevronRight size={12} color="#A0AEC0" />}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
