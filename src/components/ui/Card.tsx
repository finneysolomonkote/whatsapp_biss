import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      className={`glass-card rounded-2xl border border-gray-800 ${
        hover ? 'hover:shadow-glow transition-all cursor-pointer hover:-translate-y-1' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`px-6 py-4 border-b border-gray-800 ${className}`}>{children}</div>;
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`px-6 py-4 border-t border-gray-800 ${className}`}>{children}</div>;
};
