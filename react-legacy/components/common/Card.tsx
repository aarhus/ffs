
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 md:p-6 border-b border-border ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 md:p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 md:p-6 border-t border-border ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return <h3 className={`text-lg font-semibold text-foreground ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
};
