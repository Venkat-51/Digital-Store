import React from 'react';
import { PackageSearch, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from './Button';

// ── Empty State ──
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
      {icon ?? <PackageSearch size={32} />}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>}
    {action && (
      <Button variant="primary" size="md" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

// ── Error State ──
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mb-6 text-danger-500">
      <ServerCrash size={32} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
    {onRetry && (
      <Button variant="outline" size="md" leftIcon={<RefreshCw size={16} />} onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
