import React from 'react';

const LoadingSkeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  count = 1,
  className = '' 
}) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'title':
        return 'h-8 w-3/4 rounded-md mb-4';
      case 'avatar':
        return 'h-12 w-12 rounded-full';
      case 'card':
        return 'h-[300px] w-full rounded-2xl'; // Simple placeholder
      default:
        return 'h-4 w-full rounded';
    }
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-slate-200 ${getSkeletonClass()} ${className}`}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  ));

  return <>{skeletons}</>;
};

export default LoadingSkeleton;
