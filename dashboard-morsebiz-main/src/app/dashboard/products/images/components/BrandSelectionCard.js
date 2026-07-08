import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FolderOpen, ChevronDown, X } from 'lucide-react';
import { BrandDropdownSkeleton } from './Skeletons';

const BrandSelectionCard = ({
  selectedBrand,
  brandsLoading,
  brands,
  brandSearchTerm,
  setBrandSearchTerm,
  showBrandDropdown,
  setShowBrandDropdown,
  handleBrandSelect,
  clearSelectedBrand
}) => {
  // Filter brands based on search term
  const filteredBrands = brands.filter(brand => {
    const brandName = brand?.title || '';
    return brandName.toLowerCase().includes(brandSearchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Select Brand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="brand-select">Choose a brand to view its part number folders</Label>
          
          {/* Custom Brand Dropdown with Search */}
          <div className="relative">
            <div
              className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer flex items-center justify-between"
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
            >
              <div className="flex items-center">
                {!selectedBrand ? (
                  <span className="text-muted-foreground">
                    {brandsLoading ? "Loading brands..." : "Select a brand..."}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{selectedBrand}</span>
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelectedBrand();
                      }}
                    />
                  </div>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>

            {/* Dropdown */}
            {showBrandDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search brands..."
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      className="pl-8 h-8"
                    />
                  </div>
                </div>
                
                {/* Brand List */}
                <div className="max-h-48 overflow-y-auto">
                  {brandsLoading ? (
                    <BrandDropdownSkeleton />
                  ) : filteredBrands.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {brandSearchTerm ? 'No brands found matching your search' : 'No brands available'}
                    </div>
                  ) : (
                    filteredBrands.map((brand) => {
                      const isSelected = selectedBrand === (brand?.title || '');
                      const brandTitle = brand?.title || 'Unknown Brand';
                      
                      return (
                        <div
                          key={brand._id || brand.title}
                          className={`p-3 cursor-pointer hover:bg-accent flex items-center gap-2 ${
                            isSelected ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleBrandSelect(brand)}
                        >
                          <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-primary border-primary' : 'border-input'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                          </div>
                          <div className="flex">
                            <span className="text-sm">{brandTitle}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandSelectionCard;