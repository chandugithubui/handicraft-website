import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullHeight = false,
}) => {
  const spinnerSizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  }[size];

  const minHeightStyle = fullHeight ? { minHeight: '60vh' } : { minHeight: '160px' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-4 text-center w-100"
      style={minHeightStyle}
      role="status"
      aria-live="polite"
    >
      <div
        className={`spinner-border text-primary ${spinnerSizeClass}`}
        style={{
          width: size === 'lg' ? '3rem' : size === 'md' ? '2rem' : '1rem',
          height: size === 'lg' ? '3rem' : size === 'md' ? '2rem' : '1rem',
          borderWidth: '0.2em',
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted mb-0 fw-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
