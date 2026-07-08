'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X, AlertCircle } from 'lucide-react';
import ProductService from '@/services/productService';
import { getProductImageUrl } from '@/utils/imageUtils';
import ProductImageUploader from '@/components/SimpleImageUploader/ProductImageUploader';
import { BrandSearch } from './AddBrandDialog';
import AddAlternatePartDialog from './AddAlternatePartDialog';
import AddCompatibleVehicleDialog from './AddCompatibleVehicleDialog';
import { CategorySearch } from './CategorySearch';
import BadgeEditor from './BadgeEditor';
import ExclusiveEditor from './ExclusiveEditor';
import config from '@/config/config';

const ProductForm = ({ 
  product = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'add' // 'add' or 'edit'
}) => {
  const { user } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic product info
    partNumber: '',
    title: '',
    shortDescription: '',
    productDetailsfullDescription: '',
    
    // Brand and category
    brand: [],
    categoriesMain: [],
    
    // Pricing
    pricemin: '',
    pricemax: '',
    pricecurrency: 'USD',
    
    // Stock and availability
    stockavailable: 'Yes',
    
    // Lead time
    leadTimevalue: '',
    
    // Product details
    countyofOrigin: 'India',
    
    // Status and visibility
    liveStatus: 'Y',
    badges: [],
    exclusive: [],
    
    // Images and media
    partsimages: [],
    
    // Related products and specs
    alternateparts: [],
    compatiblevehicles: [],
    
    // Multi-language descriptions
    lang: {
      en: { productDetailsfullDescription: '' },
      ar: { productDetailsfullDescription: '' },
      es: { productDetailsfullDescription: '' },
      pt: { productDetailsfullDescription: '' },
      ru: { productDetailsfullDescription: '' },
      tr: { productDetailsfullDescription: '' }
    }
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic fields for arrays
  const [newBrand, setNewBrand] = useState({ name: '', logo: '' });
  const [newCategory, setNewCategory] = useState('');
  const [newAlternatePart, setNewAlternatePart] = useState('');
  const [newCompatibleVehicle, setNewCompatibleVehicle] = useState('');
  
  // Brand dialog state
  const [brandRefreshTrigger, setBrandRefreshTrigger] = useState(0);
  
  // Category dialog state
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        partNumber: product.partNumber || '',
        title: product.title || '',
        shortDescription: product.shortDescription || '',
        productDetailsfullDescription: product.productDetailsfullDescription || '',
        
        // Additional fields from API
        
        brand: Array.isArray(product.brand) ? product.brand : 
               (product.brand ? [product.brand] : []),
        categoriesMain: parseCategoriesMainField(product.categoriesMain),
        
        pricemin: product.pricemin || '',
        pricemax: product.pricemax || '',
        pricecurrency: product.pricecurrency ,
        
        stockavailable: product.stockavailable ,
        
        leadTimevalue: product.leadTimevalue || '',
        
        countyofOrigin: product.countyofOrigin ,
        
        liveStatus: product.liveStatus,
        badges: parseArrayField(product.badges),
        exclusive: parseArrayField(product.exclusive),
        
        partsimages: parseArrayField(product.partsimages),
        
        alternateparts: parseArrayField(product.alternateparts),
        compatiblevehicles: parseArrayField(product.compatiblevehicles),
        
        lang: {
          en: { productDetailsfullDescription: product.lang?.en?.productDetailsfullDescription || '' },
          ar: { productDetailsfullDescription: product.lang?.ar?.productDetailsfullDescription || '' },
          es: { productDetailsfullDescription: product.lang?.es?.productDetailsfullDescription || '' },
          pt: { productDetailsfullDescription: product.lang?.pt?.productDetailsfullDescription || '' },
          ru: { productDetailsfullDescription: product.lang?.ru?.productDetailsfullDescription || '' },
          tr: { productDetailsfullDescription: product.lang?.tr?.productDetailsfullDescription || '' }
        }
      });
    }
  }, [product, mode]);

  // Load filter options - removed unnecessary API calls as brands are loaded via search
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Only load what's actually needed - removed brands, categories, and countries filters
        // as they are not being used and brands are loaded via search functionality
        console.log('Filter options loading skipped - using search functionality instead');
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Helper function to parse array fields (updated for new badge format)
  const parseArrayField = (field) => {
    if (Array.isArray(field)) {
      // For badges, check if they're already migrated to slug format
      // If they're objects, extract the slug or convert to slug format
      return field.map(item => {
        // Handle badges that might be objects with slug property
        if (typeof item === 'object' && item !== null) {
          // If it has a slug property, it's likely a badge object
          if (item.slug) {
            return item.slug; // Return just the slug for new format
          }
          // For old badge format, convert to string
          if (item.label) {
            return item.label; // Will be migrated by script later
          }
          // For other objects, return as is
          return item;
        }
        return item;
      });
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'object' && item !== null && item.slug) {
              return item.slug;
            }
            return item;
          });
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return field === '[]' ? [] : [field];
      }
    }
    return [];
  };

  // Helper function to parse categoriesMain field
  const parseCategoriesMainField = (field) => {
    if (Array.isArray(field)) {
      // Check if it's already in the new format with title, slug, logo
      if (field.length > 0 && field[0] && typeof field[0] === 'object' && field[0].title) {
        return field;
      }
      // Check if it's in the old format with nested category arrays
      if (field.length > 0 && field[0] && typeof field[0] === 'object' && Array.isArray(field[0].category)) {
        // Convert old format to new format (extract first category name as title)
        return field.map(cat => {
          const categoryValue = cat.category && cat.category[0] ? cat.category[0] : 'Unknown Category';
          const categoryString = typeof categoryValue === 'string' ? categoryValue : String(categoryValue);
          return {
            title: categoryString,
            slug: categoryString.toLowerCase().replace(/\s+/g, '-'),
            logo: ''
          };
        });
      }
      // If it's a simple array of strings, convert to new format
      return field.map(cat => {
        const categoryString = typeof cat === 'string' ? cat : String(cat);
        return {
          title: categoryString,
          slug: categoryString.toLowerCase().replace(/\s+/g, '-'),
          logo: ''
        };
      });
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed.map(cat => {
            const categoryString = typeof cat === 'string' ? cat : String(cat);
            return {
              title: categoryString,
              slug: categoryString.toLowerCase().replace(/\s+/g, '-'),
              logo: ''
            };
          });
        }
      } catch {
        return field === '[]' ? [] : [{
          title: field,
          slug: field.toLowerCase().replace(/\s+/g, '-'),
          logo: ''
        }];
      }
    }
    return [];
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle language-specific description changes
  const handleLangChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      lang: {
        ...prev.lang,
        [lang]: {
          ...prev.lang[lang],
          productDetailsfullDescription: value
        }
      }
    }));
  };

  // Add brand
  const addBrand = (brandData) => {
    console.log('addBrand called with:', brandData);
    if (brandData && (brandData.name || brandData.title) && (brandData.name?.trim() || brandData.title?.trim())) {
      const brandName = brandData.name || brandData.title || brandData.displayName;
      
      // Check if this brand is already selected to prevent duplicates
      const isAlreadySelected = formData.brand.some(existingBrand => {
        const existingName = typeof existingBrand === 'object' ? 
          (existingBrand.name || existingBrand.title || existingBrand.displayName) : existingBrand;
        return existingName && existingName.toLowerCase() === brandName.toLowerCase();
      });

      if (isAlreadySelected) {
        console.log('Brand already selected, skipping:', brandName);
        return;
      }
      
      const newBrand = { 
        name: brandName.trim(), 
        slug: brandData.slug || brandName.toLowerCase().replace(/\s+/g, '-'),
        logo: brandData.logo || '' 
      };
      console.log('Adding brand with logo:', newBrand);
      setFormData(prev => ({
        ...prev,
        brand: [...prev.brand, newBrand]
      }));
    }
  };

  // Enhanced dynamic brand expansion function - handles any brand with brackets and comma-separated values
  const expandDynamicBrand = (brandName) => {
    // Enhanced regex to handle various bracket formats and separators
    const bracketMatch = brandName.match(/^(.+?)\s*[\(\[\{]([^\)\]\}]+)[\)\]\}]$/);
    
    if (bracketMatch) {
      const mainBrandName = bracketMatch[1].trim();
      const subBrandsString = bracketMatch[2].trim();
      
      // Split by comma, semicolon, or pipe and create brand objects
      const separators = /[,;|]/;
      const subBrands = subBrandsString.split(separators)
        .map(subBrand => subBrand.trim())
        .filter(subBrand => subBrand.length > 0) // Remove empty strings
        .map(subBrand => {
          // Generate proper logo URL for component brands
          const componentSlug = subBrand.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          const logoUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${componentSlug}.png`;
          
          return {
            name: subBrand,
            slug: componentSlug,
            logo: logoUrl
          };
        });
      
      console.log(`Expanded composite brand "${brandName}":`, {
        mainBrand: mainBrandName,
        components: subBrands.map(b => ({ name: b.name, logo: b.logo }))
      });
      
      return {
        isExpansion: true,
        mainBrand: mainBrandName,
        expandedBrands: subBrands,
        fullBrandName: brandName // Keep the original full name
      };
    }
    
    return {
      isExpansion: false,
      mainBrand: brandName,
      expandedBrands: [],
      fullBrandName: brandName
    };
  };

  // Get effective selected brands including component brands from composite brands
  const getEffectiveSelectedBrands = () => {
    const effectiveBrands = [...formData.brand];
    
    // For each composite brand, add its components to the effective selection
    formData.brand.forEach(brand => {
      const brandName = typeof brand === 'object' ? brand.name : brand;
      const expansion = expandDynamicBrand(brandName);
      
      if (expansion.isExpansion) {
        // Add all component brands to effective selection
        expansion.expandedBrands.forEach(componentBrand => {
          // Check if component is not already in the list
          const isAlreadyInList = effectiveBrands.some(existingBrand => {
            const existingName = typeof existingBrand === 'object' ? existingBrand.name : existingBrand;
            return existingName === componentBrand.name;
          });
          
          if (!isAlreadyInList) {
            effectiveBrands.push(componentBrand);
          }
        });
      }
    });
    
    return effectiveBrands;
  };

  // Handle brand selection from search - Shows both composite brand and individual components
  const handleBrandSelect = (brand) => {
    console.log('handleBrandSelect called with:', brand);
    
    let brandData;
    if (typeof brand === 'string') {
      // If it's a string, create a basic brand object
      const cleanSlug = brand.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      brandData = { 
        name: brand, 
        slug: cleanSlug,
        logo: `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${cleanSlug}.png`
      };
    } else {
      // If it's an object from API, use the complete data with proper logo URL
      const brandName = brand.title || brand.name || brand.displayName || brand.label || brand.value;
      const cleanSlug = brand.slug || brandName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Use actual logo from database if available, otherwise generate URL
      let logoUrl = '';
      if (brand.logo && typeof brand.logo === 'string' && brand.logo.trim()) {
        const brandLogo = brand.logo.trim();
        if (brandLogo.startsWith('http://') || brandLogo.startsWith('https://')) {
          logoUrl = brandLogo;
        } else {
          logoUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${brandLogo}`;
        }
      } else {
        logoUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${cleanSlug}.png`;
      }
      
      brandData = {
        name: brandName,
        slug: cleanSlug,
        logo: logoUrl
      };
      console.log('Brand object from API:', brand);
      console.log('Processed brand data:', brandData);
    }

    // Check if this is a dynamic brand that needs expansion
    const expansion = expandDynamicBrand(brandData.name);
    
    if (expansion.isExpansion) {
      // This is a composite brand - first clear any existing individual components
      const componentNames = expansion.expandedBrands.map(b => b.name);
      
      // Remove any individual components that are already selected
      setFormData(prev => ({
        ...prev,
        brand: prev.brand.filter(existingBrand => {
          const existingName = typeof existingBrand === 'object' ? existingBrand.name : existingBrand;
          return !componentNames.includes(existingName);
        })
      }));
      
      // Check if composite brand is already selected
      const isCompositeAlreadySelected = formData.brand.some(existingBrand => {
        const existingName = typeof existingBrand === 'object' ? existingBrand.name : existingBrand;
        return existingName === brandData.name;
      });

      if (!isCompositeAlreadySelected) {
        // Ensure composite brand has proper logo URL
        if (!brandData.logo || brandData.logo === '') {
          const compositeSlug = brandData.slug || brandData.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          brandData.logo = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${compositeSlug}.png`;
        }
        
        // Add composite brand at the beginning
        setFormData(prev => ({
          ...prev,
          brand: [brandData, ...prev.brand]
        }));
      }

      // Then add all individual component brands with proper logo URLs from database
      const brandsToAdd = expansion.expandedBrands.map(expandedBrand => {
        // Try to find the actual brand data from loaded brands to get proper logo URL
        const loadedBrands = window.loadedBrands || [];
        const actualBrandData = loadedBrands.find(dbBrand => {
          const dbBrandName = typeof dbBrand === 'object' ? 
            (dbBrand.title || dbBrand.name || dbBrand.displayName) : dbBrand;
          return dbBrandName.toLowerCase() === expandedBrand.name.toLowerCase();
        });
        
        if (actualBrandData && typeof actualBrandData === 'object' && actualBrandData.logo) {
          // Use actual logo from database
          let actualLogoUrl = '';
          const actualLogo = actualBrandData.logo.trim();
          if (actualLogo.startsWith('http://') || actualLogo.startsWith('https://')) {
            actualLogoUrl = actualLogo;
          } else {
            actualLogoUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${actualLogo}`;
          }
          
          return {
            ...expandedBrand,
            logo: actualLogoUrl,
            slug: actualBrandData.slug || expandedBrand.slug
          };
        }
        
        // Fallback to generated URL if not found in database
        return expandedBrand;
      });
      
      // Add all component brands
      brandsToAdd.forEach(newBrand => {
        addBrand(newBrand);
      });
      
    } else {
      // Regular brand, check if already selected
      const isAlreadySelected = formData.brand.some(existingBrand => {
        const existingName = typeof existingBrand === 'object' ? existingBrand.name : existingBrand;
        return existingName === brandData.name;
      });

      if (!isAlreadySelected) {
        addBrand(brandData);
      }
    }
  };

  // Remove brand
  const removeBrand = (index) => {
    console.log('removeBrand called with index:', index);
    console.log('Current brands before removal:', formData.brand);
    
    setFormData(prev => {
      const newBrands = prev.brand.filter((_, i) => i !== index);
      console.log('New brands after removal:', newBrands);
      
      return {
        ...prev,
        brand: newBrands
      };
    });
  };

  // Handle category selection from search
  const handleCategorySelect = (category) => {
    console.log('handleCategorySelect called with:', category);
    if (typeof category === 'string') {
      // If it's a string, create a basic category object
      const categoryData = { 
        title: category, 
        slug: category.toLowerCase().replace(/\s+/g, '-'),
        logo: '' 
      };
      addCategory(categoryData);
    } else {
      // If it's an object from API, use the complete data
      const categoryTitle = category.title || category.name || category.displayName || category.label || category.value;
      
      const categoryData = {
        title: categoryTitle,
        slug: category.slug || categoryTitle.toLowerCase().replace(/\s+/g, '-'),
        logo: category.logo || category.image || '' // Logo URL from API
      };
      console.log('Category object from API:', category);
      console.log('Processed category data:', categoryData);
      addCategory(categoryData);
    }
  };

  // Add category
  const addCategory = (categoryData = null) => {
    if (categoryData) {
      // Adding from dialog with object data (new format)
      setFormData(prev => ({
        ...prev,
        categoriesMain: [...prev.categoriesMain, categoryData]
      }));
      // Trigger refresh for CategorySearch component
      setCategoryRefreshTrigger(prev => prev + 1);
    } else if (newCategory.trim()) {
      // Adding from simple input with string data (convert to new format)
      setFormData(prev => ({
        ...prev,
        categoriesMain: [...prev.categoriesMain, {
          title: newCategory.trim(),
          slug: newCategory.trim().toLowerCase().replace(/\s+/g, '-'),
          logo: ''
        }]
      }));
      setNewCategory('');
      // Trigger refresh for CategorySearch component
      setCategoryRefreshTrigger(prev => prev + 1);
    }
  };

  // Remove category
  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categoriesMain: prev.categoriesMain.filter((_, i) => i !== index)
    }));
  };

  // Add alternate part
  // Add alternate part (updated to handle both string and object)
  const addAlternatePart = (partData = null) => {
    if (partData) {
      // Adding from dialog with object data
      setFormData(prev => ({
        ...prev,
        alternateparts: [...prev.alternateparts, partData]
      }));
    } else if (newAlternatePart.trim()) {
      // Adding from simple input with string data
      setFormData(prev => ({
        ...prev,
        alternateparts: [...prev.alternateparts, newAlternatePart.trim()]
      }));
      setNewAlternatePart('');
    }
  };

  // Remove alternate part
  const removeAlternatePart = (index) => {
    setFormData(prev => ({
      ...prev,
      alternateparts: prev.alternateparts.filter((_, i) => i !== index)
    }));
  };

  // Add compatible vehicle
  const addCompatibleVehicle = (vehicleData = null) => {
    if (vehicleData) {
      // Adding from dialog with object data
      setFormData(prev => ({
        ...prev,
        compatiblevehicles: [...prev.compatiblevehicles, vehicleData]
      }));
    } else if (newCompatibleVehicle.trim()) {
      // Adding from simple input with string data
      setFormData(prev => ({
        ...prev,
        compatiblevehicles: [...prev.compatiblevehicles, newCompatibleVehicle.trim()]
      }));
      setNewCompatibleVehicle('');
    }
  };

  // Remove compatible vehicle
  const removeCompatibleVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      compatiblevehicles: prev.compatiblevehicles.filter((_, i) => i !== index)
    }));
  };

  // Handle badges change from BadgeEditor
  const handleBadgesChange = (newBadges) => {
    setFormData(prev => ({
      ...prev,
      badges: newBadges
    }));
  };

  // Handle exclusive categories change from ExclusiveEditor
  const handleExclusiveChange = (newExclusive) => {
    setFormData(prev => ({
      ...prev,
      exclusive: newExclusive
    }));
  };

  // Validate form
  const validateForm = async () => {
    const newErrors = {};

    // Required fields
    if (mode === 'add' && !formData.partNumber.trim()) {
      newErrors.partNumber = 'Part number is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.brand.length === 0) {
      newErrors.brand = 'At least one brand is required';
    }

    // Part number format validation (basic) - only for add mode
    if (mode === 'add' && formData.partNumber && !/^[A-Za-z0-9\-_\s\/]+$/.test(formData.partNumber)) {
      newErrors.partNumber = 'Part number can only contain letters, numbers, hyphens, underscores, spaces, and forward slashes';
    }

    // Note: Part number and slug validation is now handled by the API during submission
    // This provides better user experience and avoids duplicate validation calls

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate slug for dynamic brands - uses main brand name (before brackets)
  const generateSlug = (brands, title, partNumber) => {
    if (!brands || brands.length === 0) return `part/unknown/${title.toLowerCase().replace(/\s+/g, '-')}-${partNumber.toLowerCase()}`;
    
    const firstBrand = brands[0];
    const brandName = typeof firstBrand === 'object' ? firstBrand.name : firstBrand;
    
    // Check if any brand was expanded from a dynamic brand
    const expansion = expandDynamicBrand(brandName);
    const slugBrand = expansion.isExpansion ? expansion.mainBrand : brandName;
    
    return `part/${slugBrand.toLowerCase().replace(/\s+/g, '-')}/${title.toLowerCase().replace(/\s+/g, '-')}-${partNumber.toLowerCase()}`;
  };

  // Generate dynamic slug - same logic as generateSlug
  const generateDynamicSlug = (brands, title, partNumber) => {
    return generateSlug(brands, title, partNumber);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure brand array includes complete objects with logo
        brand: formData.brand.map(b => ({
          name: b.name,
          slug: b.slug,
          logo: b.logo || ''
        }))
      };

      // Only generate slug and dynamicSlug for new products (add mode)
      if (mode === 'add') {
        submitData.slug = generateSlug(formData.brand, formData.title, formData.partNumber);
        submitData.dynamicSlug = generateDynamicSlug(formData.brand, formData.title, formData.partNumber);
      }
      
      // Remove non-editable fields in edit mode
      if (mode === 'edit') {
        delete submitData.partNumber;
        delete submitData.slug;
        delete submitData.dynamicSlug;
      }

      console.log('Submitting data with brands:', submitData.brand);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
                className={errors.partNumber ? 'border-red-500' : ''}
                readOnly={mode === 'edit'}
                disabled={mode === 'edit'}
              />
              {mode === 'edit' && (
                <p className="text-xs text-muted-foreground mt-1">Part number cannot be modified</p>
              )}
              {errors.partNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.partNumber}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter product title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Enter short description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="productDetailsfullDescription">Full Description</Label>
            <Textarea
              id="productDetailsfullDescription"
              value={formData.productDetailsfullDescription}
              onChange={(e) => handleInputChange('productDetailsfullDescription', e.target.value)}
              placeholder="Enter full product description"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          </div>
        </CardContent>
      </Card>

      {/* Brand Information */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            {formData.brand
              .map((brand, originalIndex) => ({ brand, originalIndex })) // Preserve original index
              .sort((a, b) => {
                const aName = typeof a.brand === 'object' ? a.brand.name : a.brand;
                const bName = typeof b.brand === 'object' ? b.brand.name : b.brand;
                
                // Check if brands are composite (contain brackets)
                const aIsComposite = /[\(\[\{].*[\)\]\}]/.test(aName);
                const bIsComposite = /[\(\[\{].*[\)\]\}]/.test(bName);
                
                // Composite brands (like VAG) should always appear first
                if (aIsComposite && !bIsComposite) return -1;
                if (!aIsComposite && bIsComposite) return 1;
                
                // Within same type (both composite or both regular), maintain alphabetical order
                return aName.localeCompare(bName);
              })
              .map(({ brand, originalIndex }) => {
              const brandName = typeof brand === 'object' ? brand.name : brand;
              const brandSlug = typeof brand === 'object' ? brand.slug : '';
              const brandLogo = typeof brand === 'object' ? brand.logo : '';
              
              // Helper function to get brand logo URL with validation and fallbacks
              const getBrandLogoUrl = (logoUrl, brandName, brandSlug) => {
                // If logo URL provided and it's a full URL, use it directly
                if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim()) {
                  const cleanUrl = logoUrl.trim();
                  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
                    return cleanUrl;
                  }
                }
                
                // For all brands, generate proper logo URL from brand name
                if (brandName && typeof brandName === 'string') {
                  const cleanSlug = brandSlug || brandName.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                  return `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/brands/${cleanSlug}.png`;
                }
                
                // Ultimate fallback
                return '/images/no-image.png';
              };
              
              const brandLogoUrl = getBrandLogoUrl(brandLogo, brandName, brandSlug);
              
              return (
                <div key={originalIndex} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border">
                  {/* Brand Logo */}
                  <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded border overflow-hidden">
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full hidden items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase"
                      style={{ fontSize: '10px' }}
                    >
                      {brandName.charAt(0)}
                    </div>
                  </div>
                  
                  {/* Brand Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {brandName}
                    </span>
                    {brandSlug && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {brandSlug}
                      </span>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    className="ml-1 p-1 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center rounded"
                    onClick={(e) => {
                      console.log('X button clicked, originalIndex:', originalIndex);
                      console.log('Current brands:', formData.brand);
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const confirmMessage = `Are you sure you want to remove "${brandName}" brand?`;
                      
                      console.log('Showing confirmation for:', brandName);
                      
                      if (window.confirm(confirmMessage)) {
                        console.log('User confirmed removal, calling removeBrand');
                        removeBrand(originalIndex);
                      } else {
                        console.log('User cancelled removal');
                      }
                    }}
                    title={`Remove ${brandName}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <BrandSearch
            onBrandSelect={handleBrandSelect}
            selectedBrands={getEffectiveSelectedBrands()}
            onBrandAdded={brandRefreshTrigger}
            onBrandsLoaded={(loadedBrands) => {
              // Store loaded brands for logo URL lookup
              window.loadedBrands = loadedBrands;
            }}
          />
          
          {errors.brand && (
            <p className="text-sm text-red-500">{errors.brand}</p>
          )}
          {errors.slug && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.slug}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.categoriesMain.map((categoryObj, index) => {
              const categoryName = typeof categoryObj === 'object' && categoryObj.title ? 
                categoryObj.title 
                : (typeof categoryObj === 'object' && categoryObj.category && Array.isArray(categoryObj.category) ? 
                    categoryObj.category.join(', ') 
                    : (typeof categoryObj === 'object' ? 
                        categoryObj.name || categoryObj.categoryName || 'Category' 
                        : categoryObj));
              
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border">
                  {/* Category Icon */}
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded border">
                    {categoryObj.logo ? (
                      <img src={categoryObj.logo} alt={categoryName} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase">
                        {categoryName.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  {/* Category Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {categoryName}
                    </span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    className="ml-1 p-1 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center rounded"
                    onClick={(e) => {
                      console.log('Category X button clicked, index:', index);
                      console.log('Current categories:', formData.categoriesMain);
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const confirmMessage = `Are you sure you want to remove "${categoryName}" category?`;
                      
                      console.log('Showing confirmation for category:', categoryName);
                      
                      if (window.confirm(confirmMessage)) {
                        console.log('User confirmed category removal, calling removeCategory');
                        removeCategory(index);
                      } else {
                        console.log('User cancelled category removal');
                      }
                    }}
                    title={`Remove ${categoryName}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="space-y-4">
            {/* Category Search */}
            <CategorySearch 
              onCategorySelect={handleCategorySelect}
              selectedCategories={formData.categoriesMain}
              onCategoryAdded={categoryRefreshTrigger}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pricemin">Min Price (USD)</Label>
              <Input
                id="pricemin"
                value={formData.pricemin}
                onChange={(e) => handleInputChange('pricemin', e.target.value)}
                placeholder="On Request"
              />
            </div>
            
            <div>
              <Label htmlFor="pricemax">Max Price (USD)</Label>
              <Input
                id="pricemax"
                value={formData.pricemax}
                onChange={(e) => handleInputChange('pricemax', e.target.value)}
                placeholder="On Request"
              />
            </div>
            
            <div>
              <Label htmlFor="pricecurrency">Currency</Label>
              <Select value={formData.pricecurrency} onValueChange={(value) => handleInputChange('pricecurrency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock and Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Stock & Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stockavailable">Stock Available</Label>
              <Select value={formData.stockavailable} onValueChange={(value) => handleInputChange('stockavailable', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="countyofOrigin">Country of Origin</Label>
              <Select 
                value={formData.countyofOrigin && formData.countyofOrigin.trim() !== '' ? formData.countyofOrigin : undefined} 
                onValueChange={(value) => handleInputChange('countyofOrigin', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Thailand">Thailand</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Imported">Imported</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="liveStatus">Live Status</Label>
            <Select value={formData.liveStatus} onValueChange={(value) => handleInputChange('liveStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Live (Visible on website)</SelectItem>
                <SelectItem value="N">Draft (Hidden from website)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Product Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeEditor 
            badges={formData.badges} 
            onChange={handleBadgesChange}
          />
        </CardContent>
      </Card>

      {/* Morsebiz Exclusive Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Morsebiz Exclusive Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ExclusiveEditor 
            exclusive={formData.exclusive} 
            onChange={handleExclusiveChange}
          />
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductImageUploader
            partNumber={formData.partNumber}
            brand={formData.brand.length > 0 ? formData.brand[0].name || formData.brand[0] : ''}
            productId={product?._id || product?.id}
            existingImages={formData.partsimages}
            onImagesChange={(images) => {
              setFormData(prev => ({
                ...prev,
                partsimages: images
              }));
            }}
            maxFiles={10}
          />
        </CardContent>
      </Card>

      {/* Alternate Parts */}
      <Card>
        <CardHeader>
          <CardTitle>Alternate Parts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.alternateparts.map((part, index) => {
              // Handle both string and object formats
              let partDisplay, partDetails;
              
              if (typeof part === 'object') {
                partDisplay = part.partNumber || part.make || 'Unknown Part';
                partDetails = {
                  make: part.make,
                  partNumber: part.partNumber
                };
              } else {
                partDisplay = part;
                partDetails = null;
              }
              
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border">
                  {/* Part Icon */}
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded border">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-300 uppercase">
                      {partDisplay.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Part Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {partDisplay}
                    </span>
                    {partDetails && partDetails.make && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {partDetails.make}
                      </span>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    className="ml-1 p-1 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center rounded"
                    onClick={(e) => {
                      console.log('Alternate part X button clicked, index:', index);
                      console.log('Current alternate parts:', formData.alternateparts);
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const confirmMessage = `Are you sure you want to remove "${partDisplay}" alternate part?`;
                      
                      console.log('Showing confirmation for alternate part:', partDisplay);
                      
                      if (window.confirm(confirmMessage)) {
                        console.log('User confirmed alternate part removal, calling removeAlternatePart');
                        removeAlternatePart(index);
                      } else {
                        console.log('User cancelled alternate part removal');
                      }
                    }}
                    title={`Remove ${partDisplay}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-start">
            <AddAlternatePartDialog onAddPart={addAlternatePart} />
          </div>
        </CardContent>
      </Card>

      {/* Compatible Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle>Compatible Vehicles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.compatiblevehicles.map((vehicle, index) => {
              // Handle both string and object formats
              let vehicleName, vehicleDetails;
              
              if (typeof vehicle === 'object') {
                vehicleName = `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.variant || ''}`.trim() || 'Vehicle';
                vehicleDetails = {
                  make: vehicle.make,
                  model: vehicle.model,
                  variant: vehicle.variant,
                  period: vehicle.period,
                  engine: vehicle.engine,
                  drive: vehicle.drive,
                  bodyStyle: vehicle.bodyStyle
                };
              } else {
                vehicleName = vehicle;
                vehicleDetails = null;
              }
              
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border">
                  {/* Vehicle Icon */}
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded border">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase">
                      {vehicleName.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Vehicle Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {vehicleName}
                    </span>
                    {vehicleDetails && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {vehicleDetails.period && <span>{vehicleDetails.period}</span>}
                        {vehicleDetails.engine && <span> • {vehicleDetails.engine}</span>}
                        {vehicleDetails.bodyStyle && <span> • {vehicleDetails.bodyStyle}</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    className="ml-1 p-1 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center rounded"
                    onClick={(e) => {
                      console.log('Compatible vehicle X button clicked, index:', index);
                      console.log('Current compatible vehicles:', formData.compatiblevehicles);
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const confirmMessage = `Are you sure you want to remove "${vehicleName}" compatible vehicle?`;
                      
                      console.log('Showing confirmation for compatible vehicle:', vehicleName);
                      
                      if (window.confirm(confirmMessage)) {
                        console.log('User confirmed compatible vehicle removal, calling removeCompatibleVehicle');
                        removeCompatibleVehicle(index);
                      } else {
                        console.log('User cancelled compatible vehicle removal');
                      }
                    }}
                    title={`Remove ${vehicleName}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-start">
            <AddCompatibleVehicleDialog onAddVehicle={addCompatibleVehicle} />
          </div>
        </CardContent>
      </Card>

      {/* Multi-language Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-language Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.lang).map(([langCode, langData]) => (
            <div key={langCode}>
              <Label htmlFor={`lang-${langCode}`}>
                {langCode.toUpperCase()} Description
              </Label>
              <Textarea
                id={`lang-${langCode}`}
                value={langData.productDetailsfullDescription}
                onChange={(e) => handleLangChange(langCode, e.target.value)}
                placeholder={`Enter description in ${langCode.toUpperCase()}`}
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>


    </form>
  );
};

export default ProductForm;