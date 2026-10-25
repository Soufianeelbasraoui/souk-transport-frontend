import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  actions = null,
  maxWidth = 560,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="st-modal-overlay" onClick={onClose}>
      <div
        className="st-modal"
        style={{ width: maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="st-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A202C' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#718096' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="st-btn st-btn-ghost st-btn-sm"
            style={{ padding: 6, borderRadius: '50%' }}
            aria-label="Fermer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="st-modal-body">{children}</div>

        {actions && <div className="st-modal-footer">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
