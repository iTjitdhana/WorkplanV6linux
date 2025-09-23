import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  rows = 5, 
  height = "h-4", 
  className = "" 
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className={`${height} bg-gray-200 rounded w-3/4`}></div>
            <div className={`${height} bg-gray-200 rounded w-1/2`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeletonLoader: React.FC<{ columns?: number; rows?: number }> = ({ 
  columns = 4, 
  rows = 8 
}) => {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            {Array.from({ length: columns }, (_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;




