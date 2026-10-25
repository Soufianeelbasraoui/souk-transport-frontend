import React from 'react';
import { CgSpinner } from 'react-icons/cg';

/**
 * Bouton universel pour l'application connectée SoukTransport.
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {boolean} [isLoading=false]
 * @param {React.ReactNode} [icon]
 * @param {React.ReactNode} children
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon = null,
  disabled = false,
  className = '',
  children,
  type = 'button',
  onClick,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'st-btn-sm' : size === 'lg' ? 'st-btn-lg' : '';
  const variantClass = `st-btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`st-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <CgSpinner className="st-spinner animate-spin" size={16} />
      ) : icon ? (
        <span className="st-btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
