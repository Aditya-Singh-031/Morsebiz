'use client';

import React from 'react';

const PageHeaderSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="min-w-0 flex-1">
            {/* Title skeleton */}
            <div className="h-6 sm:h-7 bg-muted rounded-md w-32 sm:w-40 animate-pulse"></div>
            {/* Subtitle skeleton */}
            <div className="mt-2 h-4 bg-muted rounded-md w-48 sm:w-56 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeaderSkeleton;