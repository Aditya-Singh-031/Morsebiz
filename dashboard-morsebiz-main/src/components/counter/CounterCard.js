'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/numberFormatter';

/**
 * CounterCard Component
 * A reusable animated counter component for displaying statistics
 */
const CounterCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  useFormatter = true // New prop to control number formatting
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value && value > 0) {
      setIsAnimating(true);
      
      const startTime = Date.now();
      const startValue = 0;
      const endValue = parseInt(value) || 0;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400',
    gray: 'bg-muted border-border text-muted-foreground'
  };

  const iconColorClasses = {
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-green-500 dark:text-green-400',
    red: 'text-red-500 dark:text-red-400',
    yellow: 'text-yellow-500 dark:text-yellow-400',
    purple: 'text-purple-500 dark:text-purple-400',
    indigo: 'text-indigo-500 dark:text-indigo-400',
    pink: 'text-pink-500 dark:text-pink-400',
    gray: 'text-muted-foreground'
  };

  return (
    <div className={`
      relative overflow-hidden rounded-lg border-2 p-4 
      ${colorClasses[color] || colorClasses.blue}
      transition-all duration-300 hover:shadow-lg hover:scale-105
      ${className}
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-current"></div>
        <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-current"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon at top */}
        {icon && (
          <div className={`
            flex justify-start mb-3
          `}>
            <div className={`
              p-2 rounded-full bg-white/20
              ${iconColorClasses[color] || iconColorClasses.blue}
            `}>
              <div className="h-5 w-5 flex items-center justify-center">
                {icon}
              </div>
            </div>
          </div>
        )}
        
        {/* Title and Value - Left aligned */}
        <div className="text-left">
          <p className="text-xs font-medium opacity-80 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1">
            {prefix && (
              <span className="text-sm font-semibold opacity-70">
                {prefix}
              </span>
            )}
            <span className={`
              text-xl font-bold transition-all duration-300
              ${isAnimating ? 'scale-110' : 'scale-100'}
            `}>
              {useFormatter ? formatNumber(displayValue) : displayValue.toLocaleString()}
            </span>
            {suffix && (
              <span className="text-sm font-semibold opacity-70">
                {suffix}
              </span>
            )}
          </div>
        </div>
        
        {/* Animation Indicator */}
        {isAnimating && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-pulse rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default CounterCard;