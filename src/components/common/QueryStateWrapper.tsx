import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

interface QueryStateWrapperProps<T = unknown> {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  data?: T | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  emptyActionTo?: string;
  onRetry?: () => void;
  loadingMessage?: string;
  fullHeight?: boolean;
  children: React.ReactNode | ((data: T) => React.ReactNode);
}

export function QueryStateWrapper<T = unknown>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyActionText,
  emptyActionTo,
  onRetry,
  loadingMessage,
  fullHeight = false,
  children,
}: QueryStateWrapperProps<T>) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} fullHeight={fullHeight} />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || 'Failed to fetch requested data.'}
        onRetry={onRetry}
        fullHeight={fullHeight}
      />
    );
  }

  const checkEmpty =
    isEmpty !== undefined
      ? isEmpty
      : Array.isArray(data)
      ? data.length === 0
      : data === null || data === undefined;

  if (checkEmpty && (emptyTitle || emptyDescription)) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        actionTo={emptyActionTo}
        fullHeight={fullHeight}
      />
    );
  }

  if (typeof children === 'function' && data !== undefined && data !== null) {
    return <>{children(data)}</>;
  }

  return <>{children}</>;
}

export default QueryStateWrapper;
