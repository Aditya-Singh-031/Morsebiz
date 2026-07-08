'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const AddCategoryDialog = ({ onAddCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.category.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Call the parent function with the form data in the correct format
    onAddCategory({
      category: [formData.category.trim()]
    });

    // Reset form and close dialog
    setFormData({
      category: ''
    });
    setIsOpen(false);
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
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a new category for this product. Enter the category name below.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category Name *
            </Label>
            <Input
              id="category"
              placeholder="e.g., Oxygen Sensors"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;