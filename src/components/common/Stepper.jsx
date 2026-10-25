import React from 'react';
import { FiCheck } from 'react-icons/fi';

export const Stepper = ({
  steps = [],
  currentStep = 0,
  onStepClick = null,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;
        const isClickable = onStepClick && isCompleted;

        return (
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: isClickable ? 'pointer' : 'default',
              }}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: isCompleted
                    ? '#2E7D32'
                    : isCurrent
                    ? '#1A3A5C'
                    : '#E2E8F0',
                  color: isPending ? '#718096' : '#FFFFFF',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(26, 58, 92, 0.15)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isCompleted ? <FiCheck size={14} /> : index + 1}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isCurrent ? 600 : 500,
                    color: isCurrent ? '#1A202C' : isCompleted ? '#2E7D32' : '#718096',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {typeof step === 'string' ? step : step.title}
                </span>
                {step.subtitle && (
                  <span style={{ fontSize: 10, color: '#A0AEC0' }}>
                    {step.subtitle}
                  </span>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isCompleted ? '#2E7D32' : '#E2E8F0',
                  margin: '0 12px',
                  transition: 'background-color 0.2s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
