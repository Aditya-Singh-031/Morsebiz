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
import CategoryService from '../../../services/categoryService';



const CategoryDialog = ({ 
  open, 
  onClose, 
  category = null, 
  onSuccess,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [categoryData, setCategoryData] = useState({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(category);

  // Helper function to get category logo URL with validation
  const getCategoryLogoUrl = (logoUrl) => {
    // If no logo URL provided, return fallback
    if (!logoUrl || typeof logoUrl !== 'string') {
      return '/images/no-image.png';
    }

    // If it's already a full URL (starts with http/https), return as is
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }

    // If it starts with a slash, it's a relative path from root
    if (logoUrl.startsWith('/')) {
      return logoUrl;
    }

    // Otherwise, construct the full URL using the config
    return `${config.API_BASE_URL}/${logoUrl}`;
  };

  useEffect(() => {
    if (open) {
      if (isEditing && category) {
        setCategoryData({
          title: category.title || '',
          logo: category.logo || '',
          visibility: category.visibility || 'public',
          lang: {
            en: category.lang?.en || category.name?.en || '',
            ar: category.lang?.ar || category.name?.ar || '',
            es: category.lang?.es || '',
            pt: category.lang?.pt || '',
            ru: category.lang?.ru || '',
            tr: category.lang?.tr || ''
          }
        });
      } else {
        // Reset form for add mode
        setCategoryData({
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
      }
      setImageError(false);
      setError('');
    }
  }, [open, category, isEditing]);

  const handleInputChange = (field, value) => {
    setCategoryData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };

      // If title is being changed and we're in 'add' mode, automatically populate all language fields
      if (field === 'title' && mode === 'add') {
        updatedData.lang = {
          en: value,
          ar: value,
          es: value,
          pt: value,
          ru: value,
          tr: value
        };
      }

      return updatedData;
    });
    setError('');
  };

  const handleLangChange = (lang, value) => {
    setCategoryData(prev => ({
      ...prev,
      lang: {
        ...prev.lang,
        [lang]: value
      }
    }));
  };

  const handleLogoUploadSuccess = (uploadResult) => {
    if (uploadResult && uploadResult.url) {
      handleInputChange('logo', uploadResult.url);
      setImageError(false);
    }
  };

  const handleLogoUploadStart = () => {
    setIsUploading(true);
    setError('');
  };

  const handleLogoUploadComplete = () => {
    setIsUploading(false);
  };

  const validateForm = () => {
    if (!categoryData.title.trim()) {
      setError('Category title is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Prepare category data
      const submitData = {
        title: categoryData.title.trim(),
        logo: categoryData.logo,
        visibility: categoryData.visibility,
        name: {
          en: categoryData.lang.en.trim() || categoryData.title.trim(),
          ar: categoryData.lang.ar.trim() || categoryData.title.trim(),
          ku: categoryData.lang.tr.trim() || categoryData.title.trim() // Using Turkish as Kurdish fallback
        },
        lang: categoryData.lang
      };

      let result;
      if (isEditing) {
        result = await CategoryService.updateCategory(category._id, submitData);
      } else {
        result = await CategoryService.createCategory(submitData);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the category information below.' 
              : 'Fill in the details to create a new category.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Category Title *</Label>
              <Input
                id="title"
                value={categoryData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter category title"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={categoryData.visibility}
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
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Category Logo</Label>
            
            {/* Current Logo Display */}
            {categoryData.logo && (
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={getCategoryLogoUrl(categoryData.logo)}
                    alt="Category logo"
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
              folderName="categories"
              onUploadSuccess={handleLogoUploadSuccess}
              onUploadStart={handleLogoUploadStart}
              onUploadComplete={handleLogoUploadComplete}
              acceptedFileTypes="image/*"
              maxFileSize={5 * 1024 * 1024} // 5MB
              placeholder="Click to select category logo or drag and drop"
              disabled={isLoading || isUploading}
            />
            
            <p className="text-sm text-gray-500">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
            </p>
          </div>

          {/* Multi-language Names */}
          <div className="space-y-4">
            <Label>Multi-language Names</Label>
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="ar">AR</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
                <TabsTrigger value="pt">PT</TabsTrigger>
                <TabsTrigger value="ru">RU</TabsTrigger>
                <TabsTrigger value="tr">TR</TabsTrigger>
              </TabsList>
              
              <TabsContent value="en" className="space-y-2">
                <Label htmlFor="lang-en">English Name</Label>
                <Input
                  id="lang-en"
                  value={categoryData.lang.en}
                  onChange={(e) => handleLangChange('en', e.target.value)}
                  placeholder="Enter English name"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="ar" className="space-y-2">
                <Label htmlFor="lang-ar">Arabic Name</Label>
                <Input
                  id="lang-ar"
                  value={categoryData.lang.ar}
                  onChange={(e) => handleLangChange('ar', e.target.value)}
                  placeholder="Enter Arabic name"
                  disabled={isLoading}
                  dir="rtl"
                />
              </TabsContent>
              
              <TabsContent value="es" className="space-y-2">
                <Label htmlFor="lang-es">Spanish Name</Label>
                <Input
                  id="lang-es"
                  value={categoryData.lang.es}
                  onChange={(e) => handleLangChange('es', e.target.value)}
                  placeholder="Enter Spanish name"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="pt" className="space-y-2">
                <Label htmlFor="lang-pt">Portuguese Name</Label>
                <Input
                  id="lang-pt"
                  value={categoryData.lang.pt}
                  onChange={(e) => handleLangChange('pt', e.target.value)}
                  placeholder="Enter Portuguese name"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="ru" className="space-y-2">
                <Label htmlFor="lang-ru">Russian Name</Label>
                <Input
                  id="lang-ru"
                  value={categoryData.lang.ru}
                  onChange={(e) => handleLangChange('ru', e.target.value)}
                  placeholder="Enter Russian name"
                  disabled={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="tr" className="space-y-2">
                <Label htmlFor="lang-tr">Turkish Name</Label>
                <Input
                  id="lang-tr"
                  value={categoryData.lang.tr}
                  onChange={(e) => handleLangChange('tr', e.target.value)}
                  placeholder="Enter Turkish name"
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
            onClick={handleClose}
            disabled={isLoading || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isUploading || !categoryData.title.trim()}
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Category' : 'Add Category')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;