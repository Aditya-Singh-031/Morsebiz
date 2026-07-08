'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * CounterCardSkeleton Component
 * Loading skeleton for CounterCard component
 */
const CounterCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-card rounded-xl p-5 border border-border ${className}`}>
      <div className="flex flex-col">
        {/* Counter number skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="p-2 rounded-xl border border-border">
            <Skeleton className="w-4 h-4" />
          </div>
        </div>
        {/* Label skeleton */}
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};

export default CounterCardSkeleton;