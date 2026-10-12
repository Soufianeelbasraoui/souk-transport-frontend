import React from 'react';

export const Card = ({
  title,
  subtitle,
  actions = null,
  hoverable = false,
  className = '',
  children,
  style = {},
  ...props
}) => {
  return (
    <div
      className={`st-card ${hoverable ? 'st-card-hover' : ''} ${className}`.trim()}
      style={style}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="st-card-header">
          <div>
            {title && <h3 className="st-card-title">{title}</h3>}
            {subtitle && <p className="st-card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="st-card-actions">{actions}</div>}
        </div>
      )}
      <div className="st-card-body">{children}</div>
    </div>
  );
};

export default Card;
