'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Parse group brands function (similar to website implementation)
const parseGroupBrands = (groupBrandString) => {
  if (!groupBrandString || typeof groupBrandString !== 'string') return [];
  
  const match = groupBrandString.match(/\((.*?)\)/);
  if (!match) return [];
  
  return match[1].split(',').map(brand => brand.trim()).filter(Boolean);
};

export default function ProductsFilters({
  filters,
  onFilterChange,
  onClearFilters,
  brands = [],
  categories = [],
  models = [],
  countries = [],
  exclusiveCategories = [],
  showExclusiveFilter = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [exclusiveCategorySearch, setExclusiveCategorySearch] = useState('');
  const [tempFilters, setTempFilters] = useState(filters);

  // Update filter logic to handle multiple selections and group brands
  const handleFilterUpdate = (key, value, checked) => {
    if (key === 'stock') {
      // Handle stock quantity as single value
      setTempFilters({ ...tempFilters, [key]: value });
      return;
    }

    // Handle checkbox filters (multiple selections)
    const currentValues = tempFilters[key] ? tempFilters[key].split(',').filter(v => v !== '') : [];
    let newValues;

    if (value === 'all') {
      // If "All" is selected, clear all selections
      newValues = [];
    } else {
      // Check if this is a group brand (contains brackets)
      const isGroupBrand = value.includes('(') && value.includes(')');
      
      if (isGroupBrand) {
        // Handle group brand selection
        const componentBrands = parseGroupBrands(value);
        const lowercaseComponentBrands = componentBrands.map(brand => brand.toLowerCase());
        const lowercaseCurrentValues = currentValues.map(v => v.toLowerCase());
        
        // Check if all component brands are already selected
        const allComponentsSelected = lowercaseComponentBrands.length > 0 && 
          lowercaseComponentBrands.every(comp => lowercaseCurrentValues.includes(comp));
        
        if (allComponentsSelected) {
          // If all components are selected, deselect them
          newValues = currentValues.filter(v => 
            !lowercaseComponentBrands.includes(v.toLowerCase())
          );
        } else {
          // If not all components are selected, select all of them
          const valuesToAdd = componentBrands.filter(comp => 
            !lowercaseCurrentValues.includes(comp.toLowerCase())
          );
          newValues = [...currentValues, ...valuesToAdd];
        }
      } else {
        // Handle individual brand selection
        const lowercaseValue = value.toLowerCase();
        const lowercaseCurrentValues = currentValues.map(v => v.toLowerCase());
        
        if (checked) {
          // Add value if checked and not already present
          if (!lowercaseCurrentValues.includes(lowercaseValue)) {
            newValues = [...currentValues, value];
          } else {
            newValues = currentValues;
          }
        } else {
          // Remove value if unchecked
          newValues = currentValues.filter(v => v.toLowerCase() !== lowercaseValue);
        }
      }
    }

    // Remove duplicates and filter out empty values
    newValues = Array.from(new Set(newValues.filter(Boolean)));

    // Convert array back to comma-separated string (empty string if no selections)
    const filterValue = newValues.length > 0 ? newValues.join(',') : '';
    setTempFilters({ ...tempFilters, [key]: filterValue });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Apply filters function
  const applyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  // Clear filters function
  const clearFilters = () => {
    const clearedFilters = {};
    Object.keys(tempFilters).forEach(key => {
      clearedFilters[key] = '';
    });
    setTempFilters(clearedFilters);
  };

  // Reset tempFilters when dialog opens
  const handleDialogOpen = (open) => {
    if (open) {
      setTempFilters(filters);
    }
    setIsOpen(open);
  };

  // Filter brands based on search
  const filteredBrands = brands.filter(brand => {
    const brandValue = typeof brand === 'object' ? brand.name || brand.value || String(brand) : String(brand);
    return brandValue.toLowerCase().includes(brandSearch.toLowerCase());
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    const categoryValue = typeof category === 'object' ? category.name || category.value || String(category) : String(category);
    return categoryValue.toLowerCase().includes(categorySearch.toLowerCase());
  });

  // Filter exclusive categories based on search
  const filteredExclusiveCategories = exclusiveCategories.filter(category => {
    const categoryValue = category.name || '';
    return categoryValue.toLowerCase().includes(exclusiveCategorySearch.toLowerCase());
  });

  return (
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto h-9 px-2 sm:px-3">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
            </DialogTitle>
            <DialogDescription>
              Select multiple options to filter your products
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-2">
              {/* Brand Filter */}
              <Card>
                <div className="px-3">
                  <CardTitle className="text-sm font-medium">Brand</CardTitle>
                </div>
                <CardContent className="px-3 pb-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="brand-all"
                      checked={!tempFilters.brand || tempFilters.brand === ''}
                      onCheckedChange={(checked) => handleFilterUpdate('brand', 'all', checked)}
                    />
                    <label htmlFor="brand-all" className="text-sm font-medium cursor-pointer">
                      All Brands
                    </label>
                  </div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="pl-10 border-border focus:border-primary"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-border/30 rounded-md p-3">
                    <div className="space-y-1.5">
                      {filteredBrands.map((brand, index) => {
                        // Ensure brand is a string and create unique key
                        const brandValue = typeof brand === 'object' ? brand.name || brand.value || String(brand) : String(brand);
                        const uniqueKey = `brand-${index}-${brandValue}`;
                        
                        // Check if this is a group brand
                        const isGroupBrand = brandValue.includes('(') && brandValue.includes(')');
                        
                        let isChecked = false;
                        if (isGroupBrand) {
                          // For group brands, check if all component brands are selected
                          const componentBrands = parseGroupBrands(brandValue);
                          const lowercaseComponentBrands = componentBrands.map(b => b.toLowerCase());
                          const currentBrandValues = tempFilters.brand ? tempFilters.brand.split(',').map(v => v.toLowerCase()) : [];
                          isChecked = lowercaseComponentBrands.length > 0 && 
                            lowercaseComponentBrands.every(comp => currentBrandValues.includes(comp));
                        } else {
                          // For individual brands, check if selected
                          const currentBrandValues = tempFilters.brand ? tempFilters.brand.split(',').map(v => v.toLowerCase()) : [];
                          isChecked = currentBrandValues.includes(brandValue.toLowerCase());
                        }
                        
                        return (
                          <div key={uniqueKey} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`brand-${index}-${brandValue}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => handleFilterUpdate('brand', brandValue, checked)}
                            />
                            <label htmlFor={`brand-${index}-${brandValue}`} className="text-sm cursor-pointer">
                              {brandValue}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Filter */}
              <Card>
                <CardHeader className="px-3">
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="category-all"
                      checked={!tempFilters.category || tempFilters.category === ''}
                      onCheckedChange={(checked) => handleFilterUpdate('category', 'all', checked)}
                    />
                    <label htmlFor="category-all" className="text-sm font-medium cursor-pointer">
                      All Categories
                    </label>
                  </div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-10 border-border focus:border-primary"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-border/30 rounded-md p-3">
                    <div className="space-y-1.5">
                      {filteredCategories.map((category, index) => {
                        // Ensure category is a string and create unique key
                        const categoryValue = typeof category === 'object' ? category.name || category.value || String(category) : String(category);
                        const uniqueKey = `category-${index}-${categoryValue}`;
                        const isChecked = tempFilters.category ? tempFilters.category.split(',').includes(categoryValue) : false;
                        return (
                          <div key={uniqueKey} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`category-${index}-${categoryValue}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => handleFilterUpdate('category', categoryValue, checked)}
                            />
                            <label htmlFor={`category-${index}-${categoryValue}`} className="text-sm cursor-pointer">
                              {categoryValue}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Country Filter */}
              <Card>
                <CardHeader className="px-3">
                  <CardTitle className="text-sm font-medium">Country</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="country-all"
                      checked={!tempFilters.country || tempFilters.country === ''}
                      onCheckedChange={(checked) => handleFilterUpdate('country', 'all', checked)}
                    />
                    <label htmlFor="country-all" className="text-sm font-medium cursor-pointer">
                      All Countries
                    </label>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-border/30 rounded-md p-3">
                    <div className="space-y-1.5">
                      {countries.map((country, index) => {
                        // Ensure country is a string and create unique key
                        const countryValue = typeof country === 'object' ? country.name || country.value || String(country) : String(country);
                        const uniqueKey = `country-${index}-${countryValue}`;
                        const isChecked = tempFilters.country ? tempFilters.country.split(',').includes(countryValue) : false;
                        return (
                          <div key={uniqueKey} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`country-${index}-${countryValue}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => handleFilterUpdate('country', countryValue, checked)}
                            />
                            <label htmlFor={`country-${index}-${countryValue}`} className="text-sm cursor-pointer">
                              {countryValue}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exclusive Category Filter - Only show if enabled */}
              {showExclusiveFilter && exclusiveCategories.length > 0 && (
                <Card>
                  <CardHeader className="px-3">
                    <CardTitle className="text-sm font-medium">Exclusive Category</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="exclusive-category-all"
                        checked={!tempFilters.exclusiveCategory || tempFilters.exclusiveCategory === ''}
                        onCheckedChange={(checked) => handleFilterUpdate('exclusiveCategory', 'all', checked)}
                      />
                      <label htmlFor="exclusive-category-all" className="text-sm font-medium cursor-pointer">
                        All Exclusive Categories
                      </label>
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search exclusive categories..."
                        value={exclusiveCategorySearch}
                        onChange={(e) => setExclusiveCategorySearch(e.target.value)}
                        className="pl-10 border-border focus:border-primary"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-border/30 rounded-md p-3">
                      <div className="space-y-1.5">
                        {filteredExclusiveCategories.map((category, index) => {
                          const categoryValue = category.slug || category._id;
                          const categoryName = category.name || categoryValue;
                          const uniqueKey = `exclusive-category-${index}-${categoryValue}`;
                          const isChecked = tempFilters.exclusiveCategory === categoryValue;
                          return (
                            <div key={uniqueKey} className="flex items-center space-x-2.5">
                              <Checkbox
                                id={`exclusive-category-${index}-${categoryValue}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  // Single selection for exclusive category
                                  setTempFilters({ ...tempFilters, exclusiveCategory: checked ? categoryValue : '' });
                                }}
                              />
                              <label htmlFor={`exclusive-category-${index}-${categoryValue}`} className="text-sm cursor-pointer">
                                {categoryName}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stock Availability Filter */}
              <Card>
                <CardHeader className="px-3">
                  <CardTitle className="text-sm font-medium">Stock Availability</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="stock-all"
                      checked={!tempFilters.stockavailable || tempFilters.stockavailable === ''}
                      onCheckedChange={(checked) => handleFilterUpdate('stockavailable', 'all', checked)}
                    />
                    <label htmlFor="stock-all" className="text-sm font-medium cursor-pointer">
                      All Products
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="stock-yes"
                        checked={tempFilters.stockavailable ? tempFilters.stockavailable.split(',').includes('Yes') : false}
                        onCheckedChange={(checked) => handleFilterUpdate('stockavailable', 'Yes', checked)}
                      />
                      <label htmlFor="stock-yes" className="text-sm cursor-pointer">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="stock-no"
                        checked={tempFilters.stockavailable ? tempFilters.stockavailable.split(',').includes('No') : false}
                        onCheckedChange={(checked) => handleFilterUpdate('stockavailable', 'No', checked)}
                      />
                      <label htmlFor="stock-no" className="text-sm cursor-pointer">
                        Out of Stock
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Status Filter */}
              <Card>
                <CardHeader className="px-3">
                  <CardTitle className="text-sm font-medium">Live Status</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="live-all"
                      checked={!tempFilters.liveStatus || tempFilters.liveStatus === ''}
                      onCheckedChange={(checked) => handleFilterUpdate('liveStatus', 'all', checked)}
                    />
                    <label htmlFor="live-all" className="text-sm font-medium cursor-pointer">
                      All Products
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="live-yes"
                        checked={tempFilters.liveStatus ? tempFilters.liveStatus.split(',').includes('Yes') : false}
                        onCheckedChange={(checked) => handleFilterUpdate('liveStatus', 'Yes', checked)}
                      />
                      <label htmlFor="live-yes" className="text-sm cursor-pointer">
                        Live
                      </label>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="live-no"
                        checked={tempFilters.liveStatus ? tempFilters.liveStatus.split(',').includes('No') : false}
                        onCheckedChange={(checked) => handleFilterUpdate('liveStatus', 'No', checked)}
                      />
                      <label htmlFor="live-no" className="text-sm cursor-pointer">
                        Draft
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}