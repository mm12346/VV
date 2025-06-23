import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // e.g., 'border-indigo-500'
  className?: string; // Allow additional classes
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-indigo-500',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2', // loader-sm equivalent (20px), border-2 for thinner
    md: 'h-8 w-8 border-4', // Default
    lg: 'h-12 w-12 border-4', // loader-lg equivalent (48px)
  };

  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} border-slate-200 border-t-transparent ${color} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
};

export default LoadingSpinner;