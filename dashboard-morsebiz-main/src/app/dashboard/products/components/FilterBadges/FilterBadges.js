'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FilterBadges({ filters, onFilterChange, onClearFilters, exclusiveCategories = [] }) {
  // Check if there are any active filters
  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  // Get display name for exclusive category
  const getExclusiveCategoryName = (slug) => {
    const category = exclusiveCategories.find(cat => cat.slug === slug || cat._id === slug);
    return category ? category.name : slug;
  };

  // Remove a specific filter value
  const removeFilter = (filterKey, valueToRemove) => {
    const currentValue = filters[filterKey];
    
    if (!currentValue) return;

    // Handle comma-separated values for checkbox filters
    if (currentValue.includes(',')) {
      const values = currentValue.split(',').filter(v => v !== valueToRemove);
      const newValue = values.length > 0 ? values.join(',') : '';
      onFilterChange({ [filterKey]: newValue });
    } else {
      // Single value filter
      onFilterChange({ [filterKey]: '' });
    }
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mb-4">
      <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Active Filters ({getActiveFiltersCount()}):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;

              // Handle comma-separated values for checkbox filters
              const values = value.includes(',') ? value.split(',') : [value];

              return values.map((val, index) => (
                <Badge
                  key={`${key}-${val}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <span className="capitalize text-xs font-medium">{key}:</span>
                  <span className="text-xs">
                    {key === 'exclusiveCategory' ? getExclusiveCategoryName(val) : val}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeFilter(key, val)}
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" />
                  </Button>
                </Badge>
              ));
            })}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-1 text-xs"
        >
          <X className="h-3 w-3" />
          Clear All
        </Button>
      </div>
    </div>
  );
}