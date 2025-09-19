import React from 'react';

interface ImageCardSkeletonProps {
  className?: string;
}

const ImageCardSkeleton: React.FC<ImageCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`card-mobile overflow-hidden ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-encibra-gray-100 dark:border-encibra-gray-700">
        <div className="flex items-center space-x-3">
          {/* Avatar skeleton */}
          <div className="w-10 h-10 rounded-full bg-encibra-gray-200 dark:bg-encibra-gray-700 animate-pulse"></div>
          <div>
            {/* Username skeleton */}
            <div className="h-4 w-24 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse mb-1"></div>
            {/* Time skeleton */}
            <div className="h-3 w-16 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="relative">
          {/* Menu button skeleton */}
          <div className="w-8 h-8 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Image skeleton */}
      <div className="relative">
        <div className="w-full aspect-square bg-encibra-gray-200 dark:bg-encibra-gray-700 animate-pulse"></div>
      </div>

      {/* Actions skeleton */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            {/* Like button skeleton */}
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
              <div className="w-6 h-4 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Comment button skeleton */}
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
              <div className="w-6 h-4 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Download button skeleton */}
            <div className="w-8 h-8 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Comments section skeleton */}
        <div className="space-y-2 mb-3">
          {/* Comment 1 */}
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded-full bg-encibra-gray-200 dark:bg-encibra-gray-700 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 w-32 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Comment 2 */}
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded-full bg-encibra-gray-200 dark:bg-encibra-gray-700 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 w-28 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Comment input skeleton */}
        <div className="flex items-center space-x-2 pt-3 border-t border-encibra-gray-100 dark:border-encibra-gray-700">
          <div className="w-6 h-6 rounded-full bg-encibra-gray-200 dark:bg-encibra-gray-700 animate-pulse flex-shrink-0"></div>
          <div className="flex-1 flex items-center space-x-2">
            <div className="flex-1 h-8 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-encibra-gray-200 dark:bg-encibra-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCardSkeleton;
