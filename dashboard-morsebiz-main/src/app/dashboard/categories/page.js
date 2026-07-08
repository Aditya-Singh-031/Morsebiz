'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Trash2, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CategoryService from '@/services/categoryService';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import CategoryDialog from './CategoryDialog';

// Header Component
const CategoriesHeader = ({ searchTerm, onSearchChange, onAddCategory }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0">
          {/* Left Section - Back Button and Title */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="h-8 w-8 p-0 hover:bg-muted flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm sm:text-base lg:text-xl font-bold truncate min-w-0">
              <span className="hidden sm:inline">Categories Management</span>
              <span className="sm:hidden">Categories</span>
            </h1>
          </div>

          {/* Right Section - Search and Add Button (Search hidden on mobile) */}
          <div className="flex items-center gap-1 justify-end">
            {/* Search - Only visible on larger screens */}
            <div className="relative hidden sm:block w-32 md:w-40 lg:w-48">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-xs sm:text-sm h-9 pr-2"
              />
            </div>

            {/* Add Category Button */}
            <Button 
              onClick={onAddCategory} 
              className="h-8 sm:h-9 w-8 sm:w-auto px-2 text-xs flex-shrink-0"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Add</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Row - Full width on small screens */}
        <div className="block sm:hidden mt-2">
          <div className="relative">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-sm h-9 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Categories Table Component
const CategoriesTable = ({ categories = [], loading = false, onEdit, onDelete }) => {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to get category logo URL with validation
  const getCategoryLogoUrl = (logoUrl) => {
    // If no logo URL provided, return fallback
    if (!logoUrl || typeof logoUrl !== 'string') {
      return '/images/no-image.png';
    }

    // Clean the URL - remove extra spaces, backticks, and quotes
    const cleanUrl = logoUrl.trim().replace(/[`"']/g, '').trim();
    
    // Validate URL before returning
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch {
      // If invalid URL, return fallback
      return '/images/no-image.png';
    }
  };

  const handleEdit = (category) => {
    if (onEdit) {
      onEdit(category);
    } else {
      router.push(`/dashboard/categories/edit/${category._id}`);
    }
  };

  const handleView = (category) => {
    if (onView) {
      onView(category);
    } else {
      router.push(`/dashboard/categories/${category._id}`);
    }
  };

  const handleDelete = (category) => {
    if (onDelete) {
      onDelete(category);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-1">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[600px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-8 sm:w-12">SL</TableHead>
                <TableHead className="text-xs w-16 sm:w-20">Logo</TableHead>
                <TableHead className="text-xs w-32 sm:w-48">Category Name</TableHead>
                <TableHead className="text-xs w-24 sm:w-32">Slug</TableHead>
                <TableHead className="text-xs w-20 sm:w-24">Created</TableHead>
                <TableHead className="text-right text-xs w-16 sm:w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-1">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="w-full min-w-[600px] text-xs sm:text-sm">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="text-xs w-8 sm:w-12 px-1 sm:px-2">SL</TableHead>
                <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Logo</TableHead>
                <TableHead className="text-xs w-32 sm:w-48 px-1 sm:px-2">Category Name</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2">Slug</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden sm:table-cell">Visibility</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden md:table-cell">Created By</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No categories found. Try adjusting your search terms.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => (
                <TableRow key={category._id} className="hover:bg-muted/50">
                  {/* Serial Number */}
                  <TableCell className="px-1 sm:px-2 font-medium">
                    {index + 1}
                  </TableCell>

                  {/* Logo */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="w-8 h-8 bg-muted rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden"
                      onClick={() => onEdit(category)}
                    >
                      <Image
                        src={imageErrors[category._id] ? '/images/no-image.png' : getCategoryLogoUrl(category.logo)}
                        alt={category.logo ? category.title : 'No logo'}
                        fill
                        sizes="32px"
                        className="object-contain rounded"
                        loading="lazy"
                        onError={() => setImageErrors(prev => ({ ...prev, [category._id]: true }))}
                      />
                    </div>
                  </TableCell>

                  {/* Category Name */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="font-medium text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 transition-colors" 
                      title={category.title}
                      onClick={() => onEdit(category)}
                    >
                      {category.title}
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm text-muted-foreground truncate" title={category.slug}>
                      {category.slug}
                    </div>
                  </TableCell>

                  {/* Visibility */}
                  <TableCell className="px-1 sm:px-2 hidden sm:table-cell">
                    <Badge 
                      variant={category.visibility === 'public' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        category.visibility === 'public' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category.visibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>

                  {/* Created By */}
                  <TableCell className="px-1 sm:px-2 hidden md:table-cell">
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {category.createdBy || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="px-1 sm:px-2 hidden lg:table-cell">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right px-1 sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                        title="Edit Category"
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(category)}
                        title="Delete Category"
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Main Categories Page Component
export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'

  // Fetch categories
  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await CategoryService.getAllCategories({
        page,
        limit: itemsPerPage
      });

      if (response.success) {
        setCategories(response.data || []);
        setCurrentPage(page);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Search categories
  const searchCategories = async (search = '') => {
    try {
      setLoading(true);
      const response = await CategoryService.searchCategories({
        search,
        limit: 50
      });

      if (response.success) {
        setCategories(response.data || []);
        // For search results, we don't use pagination
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
      } else {
        setError(response.message || 'Failed to search categories');
      }
    } catch (error) {
      console.error('Error searching categories:', error);
      setError(error.message || 'Failed to search categories');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories(1);
  }, []);

  // Handle search
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      // If there's a search term, use search API
      searchCategories(value);
    } else {
      // If no search term, fetch regular categories list
      fetchCategories(1);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (searchTerm.trim()) {
      // If searching, don't paginate - search results are limited
      return;
    }
    fetchCategories(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    if (searchTerm.trim()) {
      // If searching, re-search with new limit
      searchCategories(searchTerm);
    } else {
      // If not searching, fetch categories with new limit
      fetchCategories(1);
    }
  };

  // Handle add category
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setDialogMode('add');
    setCategoryDialogOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setDialogMode('edit');
    setCategoryDialogOpen(true);
  };

  // Handle category save (add/edit)
  const handleCategorySave = (savedCategory) => {
    if (dialogMode === 'add') {
      // Add new category to the beginning of the list
      setCategories(prevCategories => [savedCategory, ...prevCategories]);
      // Update total items count
      setTotalItems(prev => prev + 1);
      toast.success('Category added successfully');
    } else if (dialogMode === 'edit') {
      // Update existing category in the list
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category._id === savedCategory._id ? savedCategory : category
        )
      );
      toast.success('Category updated successfully');
    }
    
    // Close dialog and reset state
    setCategoryDialogOpen(false);
    setSelectedCategory(null);
    setDialogMode('add');
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await CategoryService.deleteCategory(categoryToDelete._id);
      
      if (response.success) {
        // Remove category from the list instantly
        setCategories(prevCategories => 
          prevCategories.filter(category => category._id !== categoryToDelete._id)
        );
        // Update total items count
        setTotalItems(prev => prev - 1);
        
        toast.success('Category deleted successfully');
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <CategoriesHeader 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddCategory={handleAddCategory}
          />

          {/* Categories Table */}
          <CategoriesTable 
              categories={categories} 
              loading={loading}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
        </div>

        {/* Sticky Pagination at bottom */}
        {!loading && !searchTerm.trim() && (totalPages > 1 || totalItems > 0) && (
          <div className="sticky bottom-0 bg-background z-20 w-full">
            <div className="w-full py-2">
              <ProductsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                loadedItems={categories.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Category Dialog */}
        <CategoryDialog
          open={categoryDialogOpen}
          onClose={() => setCategoryDialogOpen(false)}
          onSuccess={handleCategorySave}
          category={selectedCategory}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{categoryToDelete?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtectedRoute>
  );
}