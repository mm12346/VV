import React from 'react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  small?: boolean; // For a more compact version
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
    title = "เกิดข้อผิดพลาด", 
    message, 
    small = false,
    className = "" 
}) => {
  return (
    <div 
      className={`bg-rose-50 border border-rose-200/80 text-rose-700 p-4 rounded-xl flex flex-col items-center justify-center text-center w-full ${small ? 'py-3' : 'py-6'} ${className}`}
      role="alert"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor" 
        className={`${small ? 'w-8 h-8' : 'w-12 h-12'} mb-2 text-rose-500`}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className={`font-bold ${small ? 'text-sm' : 'text-base'}`}>{title}</p>
      <p className={`text-xs ${small ? 'sm:text-xs' : 'sm:text-sm'} mt-1`}>{message}</p>
    </div>
  );
};

export default ErrorDisplay;