import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';
import Cookies from 'js-cookie';

const ExclusiveEditor = ({ exclusive = [], onChange }) => {
  // State for fetching exclusive categories
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // State for dropdown
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Ref for search input to maintain focus
  const searchInputRef = useRef(null);

  // Fetch available exclusive categories
  useEffect(() => {
    fetchAvailableCategories();
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  const fetchAvailableCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories?limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAvailableCategories(result.data || []);
        console.log(`✅ Loaded ${result.data?.length || 0} exclusive categories`);
      } else {
        console.error('Failed to fetch exclusive categories:', result.message);
        setAvailableCategories([]);
      }
    } catch (error) {
      console.error('Error fetching exclusive categories:', error);
      toast.error('Failed to load exclusive categories');
      setAvailableCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Remove category
  const removeCategory = (categorySlug) => {
    const newExclusive = exclusive.filter(slug => slug !== categorySlug);
    onChange(newExclusive);
    toast.success('Exclusive category removed successfully');
  };

  // Get category data from available categories by slug
  const getCategoryData = (categorySlug) => {
    return availableCategories.find(cat => cat.slug === categorySlug);
  };

  // Get category image URL
  const getCategoryImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return imageUrl;
  };

  // Get available categories for selection
  const getAvailableCategoriesForSelection = () => {
    if (searchValue.trim()) {
      return availableCategories.filter(category => 
        category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    return availableCategories;
  };

  // Handle category selection/deselection from dropdown
  const handleCategorySelect = (categorySlug) => {
    if (exclusive.includes(categorySlug)) {
      // If already selected, remove it
      const newExclusive = exclusive.filter(slug => slug !== categorySlug);
      onChange(newExclusive);
    } else {
      // If not selected, add it
      const newExclusive = [...exclusive, categorySlug];
      onChange(newExclusive);
    }
  };

  // Get formatted display text for selected categories count
  const getSelectedCategoriesText = () => {
    if (exclusive.length === 0) {
      return "Select morsebiz exclusive categories...";
    }
    return `${exclusive.length} categor${exclusive.length > 1 ? 'ies' : 'y'} selected`;
  };

  return (
    <div className="space-y-4">
      {/* Category Selection Dropdown */}
      <div className="space-y-2">
        <Label>Select Morsebiz Exclusive Categories</Label>
        
        <div className="relative">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-md border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <span className="truncate">{getSelectedCategoriesText()}</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-full rounded-md shadow-lg border" 
              align="start"
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50/50">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search exclusive categories..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70"
                  autoFocus
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setSearchValue('');
                    }
                  }}
                />
              </div>
              
              {/* Category List */}
              <div 
                className="max-h-60 overflow-auto" 
                onMouseDown={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              >
                {getAvailableCategoriesForSelection().length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No exclusive categories found.
                  </div>
                ) : (
                  getAvailableCategoriesForSelection().map((category) => {
                    const isSelected = exclusive.includes(category.slug);
                    return (
                    <DropdownMenuItem
                      key={category.slug}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCategorySelect(category.slug);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      className={`cursor-pointer p-2 ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {/* Category Image */}
                        {category.image && (
                          <img 
                            src={getCategoryImageUrl(category.image)} 
                            alt={category.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* Category Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{category.name}</div>
                          {category.slug && (
                            <div className="text-xs text-muted-foreground truncate">
                              {category.slug}
                            </div>
                          )}
                        </div>
                        
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Select
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selected Categories Display */}
      {exclusive.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Morsebiz Exclusive Categories ({exclusive.length})</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50/50">
            {exclusive.map((categorySlug) => {
              const categoryData = getCategoryData(categorySlug);
              
              if (!categoryData) {
                return (
                  <Badge key={categorySlug} variant="secondary" className="px-3 py-1.5">
                    <span className="mr-2">{categorySlug}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(categorySlug)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              }

              return (
                <div key={categorySlug} className="flex items-center gap-2 bg-white border rounded-md px-3 py-1.5 shadow-sm">
                  {categoryData.image && (
                    <img 
                      src={getCategoryImageUrl(categoryData.image)} 
                      alt={categoryData.name}
                      className="w-6 h-6 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm font-medium">{categoryData.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(categorySlug)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusiveEditor;
