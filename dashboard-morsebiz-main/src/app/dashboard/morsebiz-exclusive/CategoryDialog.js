'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader/FileUploader';

const CategoryDialog = ({ isOpen, onClose, onSave, mode = 'create', category = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    visibility: 'public'
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          image: category.image || '',
          order: category.order || 0,
          visibility: category.visibility || 'public'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          image: '',
          order: 0,
          visibility: 'public'
        });
      }
    }
  }, [isOpen, mode, category]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (uploadResult) => {
    if (uploadResult && uploadResult.filename) {
      // Store full URL instead of just filename
      const fullUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/exclusive-categories/${uploadResult.filename}`;
      setFormData(prev => ({ ...prev, image: fullUrl }));
      toast.success('Image uploaded successfully!');
    }
  };

  const handleImageUploadStart = () => {
    setUploadingImage(true);
  };

  const handleImageUploadComplete = () => {
    setUploadingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Morsebiz Exclusive Category' : 'Edit Morsebiz Exclusive Category'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new morsebiz exclusive category to organize products.' 
              : 'Update the morsebiz exclusive category details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Morsebiz Exclusive Category Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Featured Products"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Category Image */}
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="border rounded-lg p-3">
                <FileUploader
                  folderName="exclusive-categories"
                  onUploadSuccess={handleImageUpload}
                  onUploadStart={handleImageUploadStart}
                  onUploadComplete={handleImageUploadComplete}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                  acceptedFileTypes="image/*"
                  placeholder="Upload category image (max 5MB)"
                  compact={true}
                  disabled={uploadingImage || saving}
                />
              </div>
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
              {formData.image && !uploadingImage && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Category preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleInputChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving || uploadingImage}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || uploadingImage}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Category' : 'Update Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
