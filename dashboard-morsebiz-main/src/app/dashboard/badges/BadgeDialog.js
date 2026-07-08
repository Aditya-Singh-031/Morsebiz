'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';
import FileUploader from '@/components/FileUploader/FileUploader';



const BadgeDialog = ({ isOpen, onClose, onSave, mode = 'create', badge = null }) => {
  const [formData, setFormData] = useState({
    label: '',
    icon: '',
    color: '#4CAF50',
    textColor: '#FFFFFF',
    visibility: 'public'
  });

  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper function to ensure color value is a string
  const ensureColorString = (color, defaultColor = '#4CAF50') => {
    if (!color) return defaultColor;
    if (typeof color === 'string') return color;
    if (typeof color === 'object' && color.hex) return color.hex;
    if (typeof color === 'object' && color.value) return color.value;
    return defaultColor;
  };

  // Reset form when dialog opens/closes or badge changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && badge) {
        setFormData({
          label: badge.label || '',
          icon: badge.icon || '',
          color: ensureColorString(badge.color, '#4CAF50'),
          textColor: ensureColorString(badge.textColor, '#FFFFFF'),
          visibility: badge.visibility || 'public'
        });
      } else {
        setFormData({
          label: '',
          icon: '',
          color: '#4CAF50',
          textColor: '#FFFFFF',
          visibility: 'public'
        });
      }
    }
  }, [isOpen, mode, badge]);

  const handleInputChange = (field, value) => {
    // Ensure color values are always strings
    if (field === 'color' || field === 'textColor') {
      value = ensureColorString(value, field === 'color' ? '#4CAF50' : '#FFFFFF');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIconUpload = (uploadResult) => {
    if (uploadResult && uploadResult.filename) {
      // Store full URL instead of just filename
      const fullUrl = `https://websiteimagesmorsebiz.blob.core.windows.net/imagesmay2025/badges/${uploadResult.filename}`;
      setFormData(prev => ({ ...prev, icon: fullUrl }));
      toast.success('Icon uploaded successfully!');
    }
  };

  const handleIconUploadStart = () => {
    setUploadingIcon(true);
  };

  const handleIconUploadComplete = () => {
    setUploadingIcon(false);
  };

  const getBadgeIconUrl = (iconName) => {
    if (!iconName) return '';
    if (iconName.startsWith('http')) return iconName;
    return `${config.STORAGE_URL}/badges/${iconName}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.label.trim()) {
      toast.error('Badge label is required');
      return;
    }

    if (!formData.icon) {
      toast.error('Badge icon is required');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        label: formData.label.trim(),
        icon: formData.icon,
        color: formData.color,
        textColor: formData.textColor,
        visibility: formData.visibility
      });
    } catch (error) {
      console.error('Error saving badge:', error);
      toast.error('Error saving badge');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Badge' : 'Add New Badge'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update the badge information below.' 
              : 'Create a new badge for your products.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Badge Label */}
          <div className="space-y-2">
            <Label htmlFor="badge-label">Badge Label *</Label>
            <Input
              id="badge-label"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Enter badge label"
              disabled={saving}
            />
          </div>

          {/* Badge Icon Upload */}
          <div className="space-y-2">
            <Label>Badge Icon *</Label>
            <div className="border rounded-lg p-3">
              <FileUploader
                folderName="badges"
                onUploadSuccess={handleIconUpload}
                onUploadStart={handleIconUploadStart}
                onUploadComplete={handleIconUploadComplete}
                maxFileSize={2 * 1024 * 1024} // 2MB
                acceptedFileTypes="image/*"
                placeholder="Upload SVG, PNG, or JPG icon (max 2MB)"
                compact={true}
                disabled={uploadingIcon || saving}
              />
            </div>
            {uploadingIcon && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading icon...</span>
              </div>
            )}
          </div>

          {/* Badge Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge-bg-color">Background Color *</Label>
              <Input
                id="badge-bg-color"
                type="color"
                value={ensureColorString(formData.color, '#4CAF50')}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-20"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-text-color">Text Color *</Label>
              <Input
                id="badge-text-color"
                type="color"
                value={ensureColorString(formData.textColor, '#FFFFFF')}
                onChange={(e) => handleInputChange('textColor', e.target.value)}
                className="w-20"
                disabled={saving}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select 
              value={formData.visibility} 
              onValueChange={(value) => handleInputChange('visibility', value)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {(formData.label || formData.icon) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: formData.color, 
                  color: formData.textColor 
                }}
              >
                {formData.icon && (
                  <img 
                    src={getBadgeIconUrl(formData.icon)} 
                    alt=""
                    className="w-4 h-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span>{formData.label || 'Badge Label'}</span>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={saving || uploadingIcon || !formData.label.trim() || !formData.icon}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Badge' : 'Create Badge'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeDialog;