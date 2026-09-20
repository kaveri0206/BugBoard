import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClass} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}