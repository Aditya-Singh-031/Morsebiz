'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductsHeader({ 
  searchValue, 
  onSearchChange, 
  onAddProduct,
  filtersComponent,
  hideAddButton = false,
  hideSearch = false,
  title = "Products Management",
  mobileTitle = "Products",
  addButtonText = "Add Product",
  showBackButton = false,
  onBackClick = null,
  backButtonText = "Back"
}) {
  const router = useRouter();

  const handleGoBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct();
    } else {
      router.push('/dashboard/products/add');
    }
  };

  return (
    <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0">
          {/* Left Section - Back Button and Title */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="h-8 w-auto px-2 hover:bg-muted flex-shrink-0"
                title={backButtonText}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden lg:inline ml-1 text-xs">{backButtonText}</span>
              </Button>
            )}
            {!showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="h-8 w-8 p-0 hover:bg-muted flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-sm sm:text-base lg:text-xl font-bold truncate min-w-0">
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{mobileTitle}</span>
            </h1>
          </div>

          {/* Right Section - Filters and Add Button (Search hidden on mobile) */}
          <div className="flex items-center gap-1 justify-end">
            {/* Search - Only visible on larger screens */}
            {!hideSearch && (
              <div className="relative hidden sm:block w-24 md:w-32 lg:w-40">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 text-xs sm:text-sm h-9"
                />
              </div>
            )}

            {/* Filters Component */}
            {filtersComponent && (
              <div className="flex items-center flex-shrink-0">
                {filtersComponent}
              </div>
            )}

            {/* Add Product Button */}
            {!hideAddButton && (
              <Button 
                onClick={handleAddProduct} 
                className="h-8 sm:h-9 w-auto px-2 text-xs flex-shrink-0"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">{addButtonText}</span>
                <span className="sm:hidden ml-1">Add</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Row - Full width on small screens */}
        {!hideSearch && (
          <div className="block sm:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-sm h-9 pl-10 w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}