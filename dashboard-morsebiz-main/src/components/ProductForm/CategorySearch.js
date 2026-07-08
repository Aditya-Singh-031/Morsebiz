'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CategoryService from '@/services/categoryService';

// CategorySearch Component
const CategorySearch = ({ onCategorySelect, selectedCategories = [], onCategoryAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await CategoryService.getCategories({
        page: 1,
        limit: 100, // Get more categories for better search
        search: '' // Get all categories initially
      });
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Refresh categories when onCategoryAdded is called
  useEffect(() => {
    if (onCategoryAdded) {
      fetchCategories();
      // Clear search input after category is added
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [onCategoryAdded]);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      setShowDropdown(false);
      return;
    }

    const filtered = categories.filter(category => {
      // Handle both string and object formats - prioritize title field for API data
      const categoryName = typeof category === 'object' ? (category.title || category.label || category.value || category.name) : category;
      return categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredCategories(filtered);
    setShowDropdown(true);
  }, [searchTerm, categories]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('Category selected:', category);
    
    // Check if category is already selected
    const categoryName = typeof category === 'object' ? (category.title || category.name) : category;
    const isAlreadySelected = selectedCategories.some(selected => {
      const selectedName = typeof selected === 'object' ? (selected.title || selected.name) : selected;
      return selectedName === categoryName;
    });

    if (isAlreadySelected) {
      return;
    }

    onCategorySelect(category);
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim()) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              <span className="text-sm text-gray-500 ml-2">Loading categories...</span>
            </div>
          ) : error ? (
            <div className="p-3 text-center text-red-500 text-sm">
              {error}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No categories found
            </div>
          ) : (
            filteredCategories.map((category, index) => {
              const categoryName = typeof category === 'object' ? (category.title || category.name) : category;
              const categoryLogo = typeof category === 'object' ? category.logo : '';
              
              return (
                <button
                  key={index}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                >
                  {/* Category Logo */}
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded border overflow-hidden flex-shrink-0">
                    {categoryLogo ? (
                      <img
                        src={categoryLogo}
                        alt={categoryName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full ${categoryLogo ? 'hidden' : 'flex'} items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase`}
                      style={{ fontSize: '10px' }}
                    >
                      {categoryName.charAt(0)}
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {categoryName}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// AddCategoryDialog Component
const AddCategoryDialog = ({ onAddCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    visibility: 'public'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create category using CategoryService
      const categoryData = {
        title: formData.title.trim(),
        slug: formData.title.trim().toLowerCase().replace(/\s+/g, '-'),
        logo: '',
        visibility: formData.visibility,
        lang: {
          en: formData.title.trim(),
          ar: '',
          es: '',
          pt: ''
        }
      };

      const response = await CategoryService.createCategory(categoryData);
      
      if (response.success) {
        // Call the parent function with the new category
        onAddCategory(response.data);
        
        // Reset form and close dialog
        setFormData({
          title: '',
          visibility: 'public'
        });
        setIsOpen(false);
        
        toast.success('Category added successfully');
      } else {
        toast.error(response.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a new category that will be available for all products.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Category Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Oxygen Sensors"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CategorySearch, AddCategoryDialog };
export default CategorySearch;