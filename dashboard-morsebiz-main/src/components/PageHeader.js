'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick, 
  children, 
  className,
  titleClassName,
  subtitleClassName
}) => {
  return (
    <div className="w-full ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground cursor-pointer" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                "text-lg sm:text-xl font-bold text-foreground truncate",
                "leading-tight",
                titleClassName
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "mt-1 text-xs sm:text-sm text-muted-foreground truncate",
                  subtitleClassName
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {children && (
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
  );
};

export default PageHeader;