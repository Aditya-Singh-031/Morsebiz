import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import config from '@/config/config';
import FileUploader from '@/components/FileUploader/FileUploader';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// BrandSearch Component
const BrandSearch = ({ onBrandSelect, selectedBrands = [], onBrandAdded, onBrandsLoaded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch brands from API
  const fetchBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/brands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setBrands(result.data);
        setFilteredBrands(result.data);
        
        // Pass loaded brands to parent component
        if (onBrandsLoaded) {
          onBrandsLoaded(result.data);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands. Please try again.');
      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Refresh brands when onBrandAdded is called
  useEffect(() => {
    if (onBrandAdded) {
      fetchBrands();
      // Clear search input after brand is added
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [onBrandAdded]);

  // Filter brands based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
      setShowDropdown(false);
      return;
    }

    const filtered = brands.filter(brand => {
      // Handle both string and object formats - prioritize title field for API data
      const brandName = typeof brand === 'object' ? (brand.title || brand.label || brand.value || brand.name) : brand;
      return brandName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredBrands(filtered);
    setShowDropdown(true);
  }, [searchTerm, brands]);

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    // Get brand name from object or string - prioritize title field for API data
    const brandName = typeof brand === 'object' ? (brand.title || brand.label || brand.value || brand.name) : brand;
    
    // Check if brand is already selected (check both composite and individual)
    const isAlreadySelected = selectedBrands.some(selectedBrand => {
      const selectedName = typeof selectedBrand === 'string' ? selectedBrand : selectedBrand.name;
      return selectedName === brandName;
    });

    // Also check if this brand is a component of any selected composite brand
    const isComponentOfSelected = selectedBrands.some(selectedBrand => {
      const selectedName = typeof selectedBrand === 'string' ? selectedBrand : selectedBrand.name;
      
      // Check if selected brand is composite and contains this brand as component
      const bracketMatch = selectedName.match(/^(.+?)\s*[\(\[\{]([^\)\]\}]+)[\)\]\}]$/);
      if (bracketMatch) {
        const componentsString = bracketMatch[2].trim();
        const components = componentsString.split(/[,;|]/).map(c => c.trim());
        return components.includes(brandName);
      }
      return false;
    });

    if (!isAlreadySelected && !isComponentOfSelected) {
      // Pass the complete brand object instead of just the name
      if (typeof brand === 'object') {
        console.log('Selecting brand object:', brand);
        onBrandSelect(brand);
      } else {
        console.log('Selecting brand string:', brand);
        onBrandSelect(brand);
      }
    }
    
    setSearchTerm('');
    setShowDropdown(false);
  };



  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
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
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-hidden" ref={dropdownRef}>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading brands...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : filteredBrands.length > 0 ? (
              <div className="max-h-48 overflow-y-auto">
                {filteredBrands.map((brand, index) => {
                  // Get brand name from object or string - prioritize title field for API data
                  const brandName = typeof brand === 'object' ? (brand.title || brand.label || brand.value || brand.name) : brand;
                  
                  const isSelected = selectedBrands.some(selectedBrand => 
                    (typeof selectedBrand === 'string' ? selectedBrand : selectedBrand.name) === brandName
                  );

                  // Generate brand logo URL with validation
                  const getBrandLogoUrl = (brand, brandName) => {
                    // If brand has logo field, use it directly
                    if (typeof brand === 'object' && brand.logo && typeof brand.logo === 'string') {
                      const logoUrl = brand.logo.trim();
                      // Check if it's already a full URL
                      if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
                        return logoUrl;
                      }
                      // If it's a relative path, construct full URL
                      if (logoUrl.startsWith('/')) {
                        return `${config.STORAGE_URL}${logoUrl}`;
                      }
                      // If it's just a filename, construct full path
                      return `${config.STORAGE_URL}/brands/${logoUrl}`;
                    }
                    
                    // Fallback to storage URL with brand name
                    return `${config.STORAGE_URL}/brands/${brandName.toLowerCase()}.png`;
                  };
                  
                  const brandLogoUrl = getBrandLogoUrl(brand, brandName);
                  
                  return (
                    <div
                      key={index}
                      className={`px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                      onClick={() => handleBrandSelect(brand)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded border overflow-hidden">
                          <img
                            src={brandLogoUrl}
                            alt={brandName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <span 
                            className="text-xs font-semibold text-gray-600 uppercase hidden"
                            style={{ fontSize: '10px' }}
                          >
                            {brandName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{brandName}</span>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No brands found for "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// AddBrandDialog Component
const AddBrandDialog = ({ isOpen, onClose, onSave, searchTerm = '' }) => {
  const [brandData, setBrandData] = useState({
    title: '',
    logo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill title with search term when dialog opens
  useEffect(() => {
    if (isOpen && searchTerm) {
      setBrandData(prev => ({
        ...prev,
        title: searchTerm
      }));
    }
  }, [isOpen, searchTerm]);

  const handleInputChange = (field, value) => {
    setBrandData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (fileUrl) => {
    setBrandData(prev => ({
      ...prev,
      logo: fileUrl
    }));
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!brandData.title.trim()) {
      alert('Brand title is required');
      return;
    }

    if (!brandData.logo.trim()) {
      alert('Brand logo is required');
      return;
    }

    setIsLoading(true);
    try {
      // Call the backend API to save the brand
      const response = await fetch(`${config.API_BASE_URL}/api/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('adminToken')}`
        },
        body: JSON.stringify({
          title: brandData.title.trim(),
          logo: brandData.logo.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save brand');
      }

      const result = await response.json();
      
      if (result.success) {
        // Call the onSave callback with the saved brand data
        // Pass both name and title for compatibility with ProductForm
        onSave({
          name: brandData.title.trim(),
          title: brandData.title.trim(),
          logo: brandData.logo.trim()
        });
        
        // Reset form
        setBrandData({ title: '', logo: '' });
        onClose();
      } else {
        throw new Error(result.message || 'Failed to save brand');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      alert(`Failed to save brand: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBrandData({ title: '', logo: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {searchTerm ? `Add "${searchTerm}" as New Brand` : 'Add New Brand'}
          </DialogTitle>
          <DialogDescription>
            Create a new brand by providing the brand title and uploading a logo. Both fields are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <Label htmlFor="brand-title">
              Title *
            </Label>
            <Input
              id="brand-title"
              value={brandData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter brand title"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="brand-logo">
              Logo *
            </Label>
            <FileUploader
              folderName="brands"
              onUploadSuccess={handleFileUpload}
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              disabled={isLoading}
              compact={true}
            />
            {brandData.logo && (
              <div className="mt-2 p-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">Uploaded: {brandData.logo.split('/').pop()}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isLoading || isUploading || !brandData.title.trim() || !brandData.logo.trim()}
          >
            {isLoading ? 'Saving...' : 'Save Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Export both components
export { BrandSearch };
export default AddBrandDialog;