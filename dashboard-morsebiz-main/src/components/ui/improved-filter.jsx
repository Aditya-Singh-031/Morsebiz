'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const FilterSection = ({ title, items, selectedItems, onSelectionChange, searchable = true, height = "h-48" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredItems = searchable 
    ? items.filter(item => 
        String(item).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const handleItemToggle = (item) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(selected => selected !== item)
      : [...selectedItems, item];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-foreground mb-2">{title}</h3>
      
      {searchable && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={`Search ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm border-border focus:border-primary"
          />
        </div>
      )}
      
      <ScrollArea className={`${height} w-full border border-border/30 rounded-md`}>
        <div className="space-y-1.5 p-3">
          {filteredItems.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center space-x-2.5">
              <Checkbox
                id={`${title}-${item}-${index}`}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => handleItemToggle(item)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`${title}-${item}-${index}`}
                className="text-sm font-normal text-foreground cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </label>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No {title.toLowerCase()} found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export function ImprovedFilter({ 
  filters, 
  onFiltersChange, 
  filterOptions = {},
  onClearAll,
  children 
}) {
  const { brands = [], categories = [], countries = [] } = filterOptions;
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedStockAvailability, setSelectedStockAvailability] = useState([]);

  const statusOptions = ['Active', 'Inactive'];
  const stockAvailabilityOptions = ['In Stock', 'Out of Stock', 'Low Stock'];

  // Function to apply filters when Apply button is clicked
  const handleApplyFilters = () => {
    const newFilters = {
      brand: selectedBrands.length > 0 ? selectedBrands : [],
      category: selectedCategories.length > 0 ? selectedCategories : [],
      country: selectedCountries.length > 0 ? selectedCountries : [],
      status: selectedStatus.length > 0 ? selectedStatus.map(s => s === 'Active' ? 'Y' : 'N') : [],
      stockAvailability: selectedStockAvailability.length > 0 ? selectedStockAvailability : []
    };
    
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSelectedStatus([]);
    setSelectedStockAvailability([]);
    onClearAll();
  };

  const getTotalActiveFilters = () => {
    return selectedBrands.length + selectedCategories.length + selectedCountries.length + selectedStatus.length + selectedStockAvailability.length;
  };

    const getActiveFiltersBadges = () => {
    const badges = [];
    
    selectedBrands.forEach(brand => badges.push({ type: 'Brand', value: brand }));
    selectedCategories.forEach(category => badges.push({ type: 'Category', value: category }));
    selectedCountries.forEach(country => badges.push({ type: 'Country', value: country }));
    selectedStatus.forEach(status => badges.push({ type: 'Status', value: status }));
    selectedStockAvailability.forEach(stock => badges.push({ type: 'Stock', value: stock }));
    
    return badges;
  };

  const removeFilter = (type, value) => {
    switch (type) {
      case 'Brand':
        setSelectedBrands(prev => prev.filter(item => item !== value));
        break;
      case 'Category':
        setSelectedCategories(prev => prev.filter(item => item !== value));
        break;
      case 'Country':
        setSelectedCountries(prev => prev.filter(item => item !== value));
        break;
      case 'Status':
        setSelectedStatus(prev => prev.filter(item => item !== value));
        break;
      case 'Stock':
        setSelectedStockAvailability(prev => prev.filter(item => item !== value));
        break;
    }
  };

  return (
    <div className="space-y-4">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          {children}
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex h-[90vh] w-[95vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col gap-0 border border-border bg-background shadow-lg sm:rounded-xl overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-border p-6 bg-background">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Filters hai ye
              </Dialog.Title>
              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted rounded-md">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </Dialog.Close>
              </div>
            </div>
            
            {/* Active Filters Summary - Fixed below header */}
            {getTotalActiveFilters() > 0 && (
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-foreground">Active Filters ({getTotalActiveFilters()})</h3>
                  <div className="flex flex-wrap gap-2">
                    {getActiveFiltersBadges().map((filter, index) => (
                      <Badge
                        key={`${filter.type}-${filter.value}-${index}`}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors rounded-lg"
                      >
                        <span className="text-xs font-medium">{filter.type}: {filter.value}</span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => removeFilter(filter.type, filter.value)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Filter Sections */}
                <div className="space-y-4">
                  {/* Brand Filter */}
                  {brands.length > 0 && (
                    <div className="p-4 border border-border rounded-xl bg-card shadow-sm">
                      <FilterSection
                        title="Brand"
                        items={[...new Set(brands)]}
                        selectedItems={selectedBrands}
                        onSelectionChange={setSelectedBrands}
                        searchable={true}
                        height="h-48"
                      />
                    </div>
                  )}

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="p-4 border border-border rounded-xl bg-card shadow-sm">
                      <FilterSection
                        title="Category"
                        items={[...new Set(categories)]}
                        selectedItems={selectedCategories}
                        onSelectionChange={setSelectedCategories}
                        searchable={true}
                        height="h-48"
                      />
                    </div>
                  )}

                  {/* Country of Origin Filter */}
                  {countries.length > 0 && (
                    <div className="p-4 border border-border rounded-xl bg-card shadow-sm">
                      <FilterSection
                        title="Country of Origin"
                        items={[...new Set(countries)]}
                        selectedItems={selectedCountries}
                        onSelectionChange={setSelectedCountries}
                        searchable={false}
                        height="h-48"
                      />
                    </div>
                  )}

                  {/* Live Status Filter */}
                  <div className="p-4 border border-border rounded-xl bg-card shadow-sm">
                    <FilterSection
                      title="Live Status"
                      items={statusOptions}
                      selectedItems={selectedStatus}
                      onSelectionChange={setSelectedStatus}
                      searchable={false}
                      height="h-48"
                    />
                  </div>

                  {/* Stock Availability Filter */}
                  <div className="p-4 border border-border rounded-xl bg-card shadow-sm">
                    <FilterSection
                      title="Stock Availability"
                      items={stockAvailabilityOptions}
                      selectedItems={selectedStockAvailability}
                      onSelectionChange={setSelectedStockAvailability}
                      searchable={false}
                      height="h-48"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed/Sticky */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border bg-background z-10">
              <Button 
                onClick={handleClearAll} 
                variant="outline" 
                className="flex-1 border-border hover:bg-muted rounded-lg"
              >
                Clear All
              </Button>
              <Dialog.Close asChild>
                <Button 
                  onClick={handleApplyFilters}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                >
                  Apply Filters
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}