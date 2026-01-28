import React from 'react';

/**
 * Reusable loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner ('sm', 'md', 'lg')
 * @param {string} props.color - Color of spinner
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'text-primary-600', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${color} ${className}`}>
      <div className="sr-only">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;