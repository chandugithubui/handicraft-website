import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  actionTo?: string;
  onAction?: () => void;
  fullHeight?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No items found',
  description = 'There are currently no items available to display.',
  actionText,
  actionTo,
  onAction,
  fullHeight = false,
}) => {
  const minHeightStyle = fullHeight ? { minHeight: '60vh' } : { minHeight: '200px' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-4 text-center w-100"
      style={minHeightStyle}
    >
      <div
        className="rounded-circle bg-light p-3 mb-3 d-inline-flex align-items-center justify-content-center text-muted"
        style={{ width: '70px', height: '70px' }}
      >
        {icon || <FiInbox size={32} />}
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      {description && (
        <p className="text-muted mb-4" style={{ maxWidth: '420px' }}>
          {description}
        </p>
      )}
      {actionText && actionTo && (
        <Link to={actionTo} className="btn btn-primary px-4 py-2 rounded-pill fw-medium">
          {actionText}
        </Link>
      )}
      {actionText && !actionTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary px-4 py-2 rounded-pill fw-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
