import React, { forwardRef } from 'react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      options = [],
      placeholder,
      className = '',
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`st-form-group ${className}`.trim()}>
        {label && (
          <label htmlFor={selectId} className={`st-label ${required ? 'required' : ''}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`st-select ${error ? 'error' : ''}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <span className="st-error-text">{error}</span>
        ) : helperText ? (
          <span className="st-helper-text">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
