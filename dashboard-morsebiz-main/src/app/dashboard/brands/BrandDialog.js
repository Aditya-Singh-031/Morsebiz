'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BrandDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  brand = null, // For edit mode, pass existing brand data
  mode = 'add' // 'add' or 'edit'
}) => {
  const [brandData, setBrandData] = useState({
    title: '',
    name: '', // Add name field
    logo: '',
    visibility: 'public',
    lang: {
      en: '',
      ar: '',
      es: '',
      pt: '',
      ru: '',
      tr: ''
    },
    translations: {
      en: { name: '' },
      ar: { name: '' },
      es: { name: '' },
      pt: { name: '' },
      ru: { name: '' },
      tr: { name: '' }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to get brand logo URL with validation
  const getBrandLogoUrl = (logoUrl) => {
    // If no logo URL provided, return fallback
    if (!logoUrl || typeof logoUrl !== 'string') {
      return '/images/no-image.png';
    }

    // Clean the URL - remove extra spaces, backticks, and quotes
    const cleanUrl = logoUrl.trim().replace(/[`"']/g, '').trim();
    
    // If it's already a full URL (starts with http/https), return as is
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    
    // If it starts with a slash, it's a relative path from root
    if (cleanUrl.startsWith('/')) {
      return cleanUrl;
    }
    
    // Otherwise, assume it's a relative path from API base URL
    return `${config.API_BASE_URL}/${cleanUrl}`;
  };

  // Helper function to validate if logo is present (string or File)
  const isValidLogo = (logo) => {
    return logo && (
      (typeof logo === 'string' && logo.trim()) ||
      (typeof logo === 'object' && logo instanceof File)
    );
  };

  // Initialize form data when dialog opens or brand prop changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && brand) {
        const brandName = brand.title || brand.name || '';
        setBrandData({
          title: brandName,
          name: brandName,
          logo: brand.logo || '',
          visibility: brand.visibility || 'public',
          lang: {
            en: brand.lang?.en || brand.translations?.en?.name || brandName,
            ar: brand.lang?.ar || brand.translations?.ar?.name || '',
            es: brand.lang?.es || brand.translations?.es?.name || '',
            pt: brand.lang?.pt || brand.translations?.pt?.name || '',
            ru: brand.lang?.ru || brand.translations?.ru?.name || '',
            tr: brand.lang?.tr || brand.translations?.tr?.name || ''
          },
          translations: {
            en: { name: brand.translations?.en?.name || brand.lang?.en || brandName },
            ar: { name: brand.translations?.ar?.name || brand.lang?.ar || '' },
            es: { name: brand.translations?.es?.name || brand.lang?.es || '' },
            pt: { name: brand.translations?.pt?.name || brand.lang?.pt || '' },
            ru: { name: brand.translations?.ru?.name || brand.lang?.ru || '' },
            tr: { name: brand.translations?.tr?.name || brand.lang?.tr || '' }
          }
        });
      } else {
        setBrandData({
          title: '',
          name: '',
          logo: '',
          visibility: 'public',
          lang: {
            en: '',
            ar: '',
            es: '',
            pt: '',
            ru: '',
            tr: ''
          },
          translations: {
            en: { name: '' },
            ar: { name: '' },
            es: { name: '' },
            pt: { name: '' },
            ru: { name: '' },
            tr: { name: '' }
          }
        });
      }
    }
  }, [isOpen, brand, mode]);

  const handleInputChange = (field, value) => {
    setBrandData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };

      // If title is being changed, sync name field and update translations
      if (field === 'title') {
        updatedData.name = value;
        
        // Auto-populate translations in add mode
        if (mode === 'add') {
          updatedData.lang = {
            en: value,
            ar: value,
            es: value,
            pt: value,
            ru: value,
            tr: value
          };
          updatedData.translations = {
            en: { name: value },
            ar: { name: value },
            es: { name: value },
            pt: { name: value },
            ru: { name: value },
            tr: { name: value }
          };
        }
      }

      return updatedData;
    });

    // Reset image error when logo is changed
    if (field === 'logo') {
      setImageError(false);
    }
  };

  const handleLanguageChange = (lang, value) => {
    setBrandData(prev => ({
      ...prev,
      lang: {
        ...prev.lang,
        [lang]: value
      },
      translations: {
        ...prev.translations,
        [lang]: { name: value }
      }
    }));
  };

  const handleFileUpload = (uploadResult) => {
    console.log('Upload result received:', uploadResult);
    
    // Handle different possible response formats
    let logoUrl = null;
    
    if (typeof uploadResult === 'string') {
      // If it's just a URL string
      logoUrl = uploadResult;
    } else if (uploadResult && uploadResult.url) {
      // If it's an object with url property
      logoUrl = uploadResult.url;
    } else if (uploadResult && uploadResult.data && uploadResult.data.url) {
      // If it's nested in data property
      logoUrl = uploadResult.data.url;
    }
    
    if (logoUrl) {
      setBrandData(prev => ({
        ...prev,
        logo: logoUrl
      }));
      // Reset image error when new file is uploaded
      setImageError(false);
    }
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

    // Check if logo exists - it can be a string (URL) or File object
    if (!isValidLogo(brandData.logo)) {
      alert('Brand logo is required');
      return;
    }

    setIsLoading(true);
    try {
      const url = mode === 'edit' 
        ? `${config.API_BASE_URL}/api/dashboard/brands/${brand._id}`
        : `${config.API_BASE_URL}/api/dashboard/brands`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const requestBody = {
        title: brandData.title.trim(),
        name: brandData.name.trim() || brandData.title.trim(),
        logo: typeof brandData.logo === 'string' ? brandData.logo.trim() : brandData.logo,
        visibility: brandData.visibility,
        lang: brandData.lang,
        translations: brandData.translations
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('adminToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} brand`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Call the onSave callback with the saved brand data
        onSave(result.data || {
          ...brandData,
          _id: brand?._id || result.id
        });
        
        // Reset form
        setBrandData({ 
          title: '', 
          name: '',
          logo: '', 
          visibility: 'public',
          lang: {
            en: '',
            ar: '',
            es: '',
            pt: '',
            ru: '',
            tr: ''
          },
          translations: {
            en: { name: '' },
            ar: { name: '' },
            es: { name: '' },
            pt: { name: '' },
            ru: { name: '' },
            tr: { name: '' }
          }
        });
        onClose();
      } else {
        throw new Error(result.message || `Failed to ${mode} brand`);
      }
    } catch (error) {
      alert(`Failed to ${mode} brand: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBrandData({ 
      title: '', 
      logo: '', 
      visibility: 'public',
      lang: {
        en: '',
        ar: '',
        es: '',
        pt: '',
        ru: '',
        tr: ''
      }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Brand' : 'Add New Brand'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update the brand information below. Note: Slug cannot be modified.'
              : 'Create a new brand by providing the brand information. Title and logo are required.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
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

            {mode === 'edit' && brand?.slug && (
              <div className="space-y-3">
                <Label htmlFor="brand-slug">
                  Slug (Read-only)
                </Label>
                <Input
                  id="brand-slug"
                  value={brand.slug}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500">Slug cannot be modified after creation</p>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="brand-visibility">
                Visibility
              </Label>
              <Select 
                value={brandData.visibility} 
                onValueChange={(value) => handleInputChange('visibility', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="brand-logo">
                Logo *
              </Label>
              
              {/* Current Logo Preview */}
              {brandData.logo && (
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={getBrandLogoUrl(brandData.logo)}
                      alt="Brand logo"
                      fill
                      className="object-contain"
                      onError={() => setImageError(true)}
                    />
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('logo', '')}
                    disabled={isLoading || isUploading}
                  >
                    Remove Logo
                  </Button>
                </div>
              )}

              {/* File Upload */}
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
              
              <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 10MB
              </p>
             
            </div>
          </div>

          {/* Multi-language Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Multi-language Names</h3>
            <p className="text-sm text-gray-600">
              Provide brand names in different languages. English will default to the main title if not specified.
            </p>
            
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">Arabic</TabsTrigger>
                <TabsTrigger value="es">Spanish</TabsTrigger>
                <TabsTrigger value="pt">Portuguese</TabsTrigger>
                <TabsTrigger value="ru">Russian</TabsTrigger>
                <TabsTrigger value="tr">Turkish</TabsTrigger>
              </TabsList>
              
              <TabsContent value="en" className="space-y-3">
                <Label htmlFor="lang-en">English Name</Label>
                <Input
                  id="lang-en"
                  value={brandData.lang.en}
                  onChange={(e) => handleLanguageChange('en', e.target.value)}
                  placeholder="English brand name (defaults to main title)"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="ar" className="space-y-3">
                <Label htmlFor="lang-ar">Arabic Name</Label>
                <Input
                  id="lang-ar"
                  value={brandData.lang.ar}
                  onChange={(e) => handleLanguageChange('ar', e.target.value)}
                  placeholder="اسم العلامة التجارية بالعربية"
                  disabled={isLoading}
                  dir="rtl"
                />
              </TabsContent>
              
              <TabsContent value="es" className="space-y-3">
                <Label htmlFor="lang-es">Spanish Name</Label>
                <Input
                  id="lang-es"
                  value={brandData.lang.es}
                  onChange={(e) => handleLanguageChange('es', e.target.value)}
                  placeholder="Nombre de la marca en español"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="pt" className="space-y-3">
                <Label htmlFor="lang-pt">Portuguese Name</Label>
                <Input
                  id="lang-pt"
                  value={brandData.lang.pt}
                  onChange={(e) => handleLanguageChange('pt', e.target.value)}
                  placeholder="Nome da marca em português"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="ru" className="space-y-3">
                <Label htmlFor="lang-ru">Russian Name</Label>
                <Input
                  id="lang-ru"
                  value={brandData.lang.ru}
                  onChange={(e) => handleLanguageChange('ru', e.target.value)}
                  placeholder="Название бренда на русском"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="tr" className="space-y-3">
                <Label htmlFor="lang-tr">Turkish Name</Label>
                <Input
                  id="lang-tr"
                  value={brandData.lang.tr}
                  onChange={(e) => handleLanguageChange('tr', e.target.value)}
                  placeholder="Türkçe marka adı"
                  disabled={isLoading}
                />
              </TabsContent>
            </Tabs>
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
            disabled={isLoading || isUploading || !brandData.title.trim() || !isValidLogo(brandData.logo)}
          >
            {isLoading ? (mode === 'edit' ? 'Updating...' : 'Saving...') : (mode === 'edit' ? 'Update Brand' : 'Save Brand')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrandDialog;