

import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
  return (
    <div className="text-center py-12 md:py-16 px-6">
      <div className="mx-auto w-fit text-muted-foreground">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-12 h-12' })}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {action && (
        <div className="mt-6">
          <button 
            onClick={action.onClick}
            className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};
