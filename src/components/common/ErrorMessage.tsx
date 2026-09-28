import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading the data. Please try again.',
  onRetry,
  fullHeight = false,
}) => {
  const minHeightStyle = fullHeight ? { minHeight: '60vh' } : { minHeight: '160px' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-4 text-center w-100"
      style={minHeightStyle}
      role="alert"
    >
      <div
        className="rounded-circle bg-danger bg-opacity-10 p-3 mb-3 d-inline-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px' }}
      >
        <FiAlertCircle size={28} className="text-danger" />
      </div>
      <h5 className="fw-semibold text-dark mb-1">{title}</h5>
      <p className="text-muted mb-3" style={{ maxWidth: '480px' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
        >
          <FiRefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
