import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      icon = null,
      rightElement = null,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`st-form-group ${className}`.trim()}>
        {label && (
          <label htmlFor={inputId} className={`st-label ${required ? 'required' : ''}`}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: 12,
                color: '#718096',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`st-input ${error ? 'error' : ''}`}
            style={{
              paddingLeft: icon ? 36 : 12,
              paddingRight: rightElement ? 40 : 12,
            }}
            {...props}
          />
          {rightElement && (
            <div
              style={{
                position: 'absolute',
                right: 10,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <span className="st-error-text">{error}</span>
        ) : helperText ? (
          <span className="st-helper-text">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
