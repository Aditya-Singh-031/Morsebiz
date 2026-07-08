'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, Package, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import ProductsHeader from '../products/components/ProductsHeader/ProductsHeader';
import CategoryDialog from './CategoryDialog';
import config from '@/config/config';
import Cookies from 'js-cookie';

// Exclusive service
const ExclusiveService = {
  // Categories
  async getAllCategories(params = {}) {
    const { page = 1, limit = 50, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async createCategory(categoryData) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async updateCategory(id, categoryData) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async deleteCategory(id) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Products in category
  async getCategoryProducts(categoryId, params = {}) {
    const { page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}/products?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async addProductsToCategory(categoryId, productIds) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async removeProductFromCategory(categoryId, productId) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Search products
  async searchProducts(search) {
    const queryParams = new URLSearchParams({
      search,
      limit: '20'
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/products/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};

// Header Component
const ExclusiveHeader = ({ searchTerm, onSearchChange, onAddCategory }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0">
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
              <span className="hidden sm:inline">Morsebiz Exclusive Categories</span>
              <span className="sm:hidden">Morsebiz Exclusive</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 justify-end">
            <div className="hidden sm:block">
              <Input
                placeholder="Search morsebiz exclusive categories..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-64"
              />
            </div>
            
            <Button onClick={onAddCategory} size="sm" className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Morsebiz Exclusive</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="sm:hidden mt-2">
          <Input
            placeholder="Search exclusive categories..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

// Category Card Component for mobile
const CategoryCard = ({ category, onView, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{category.name}</h3>
              <div className="text-sm text-muted-foreground">
                {category.productCount || 0} products
              </div>
              <Badge variant={category.visibility === 'public' ? 'default' : 'secondary'} className="mt-1">
                {category.visibility}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onView(category)}>
              <Package className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(category)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Exclusive Page Component
const ExclusivePage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch categories
  const fetchCategories = async (page = 1, search = '', limit = 50) => {
    try {
      setLoading(true);
      const response = await ExclusiveService.getAllCategories({
        page,
        limit,
        search: search || undefined
      });

      if (response.success) {
        setCategories(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for selected category
  // Load categories on component mount
  useEffect(() => {
    fetchCategories(1);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCategories(1, searchTerm);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Handle operations
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setDialogMode('create');
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setDialogMode('edit');
    setIsCategoryDialogOpen(true);
  };

  const handleViewProducts = (category) => {
    // Navigate to category products page
    router.push(`/dashboard/morsebiz-exclusive/${category._id}/products`);
  };

  const handleDeleteCategory = (category) => {
    setItemToDelete({ type: 'category', item: category });
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (dialogMode === 'create') {
        await ExclusiveService.createCategory(categoryData);
        toast.success('Exclusive category created successfully');
      } else {
        await ExclusiveService.updateCategory(selectedCategory._id, categoryData);
        toast.success('Exclusive category updated successfully');
      }
      setIsCategoryDialogOpen(false);
      fetchCategories(pagination.currentPage, searchTerm, pagination.itemsPerPage);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save morsebiz exclusive category');
    }
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete.type === 'category') {
        await ExclusiveService.deleteCategory(itemToDelete.item._id);
        toast.success('Morsebiz exclusive category deleted successfully');
        fetchCategories(pagination.currentPage, searchTerm, pagination.itemsPerPage);
        if (selectedCategory?._id === itemToDelete.item._id) {
          setSelectedCategory(null);
        }
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handlePageChange = (newPage) => {
    fetchCategories(newPage, searchTerm, pagination.itemsPerPage);
    // Smooth scroll to top
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit
    }));
    fetchCategories(1, searchTerm, newLimit);
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin', 'manager']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <ProductsHeader
            onAddProduct={handleAddCategory}
            searchValue={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            title="Morsebiz Exclusive Categories"
            mobileTitle="Morsebiz Exclusive"
            addButtonText="Add Category"
            hideSearch={false}
          />

          {/* Categories Table */}
          <div className="w-full px-0 sm:px-1">
            {loading ? (
              <div className="overflow-x-auto">
                <Table className="min-h-96 w-full">
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Slug</TableHead>
                      <TableHead className="text-xs">Products</TableHead>
                      <TableHead className="text-xs">Order</TableHead>
                      <TableHead className="text-xs">Visibility</TableHead>
                      <TableHead className="text-right text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <Table className="w-full min-w-[800px] text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No categories found. Try adjusting your search terms.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category) => (
                          <TableRow key={category._id}>
                            <TableCell className="font-medium px-1 sm:px-2">{category.name}</TableCell>
                            <TableCell className="text-muted-foreground px-1 sm:px-2">{category.slug}</TableCell>
                            <TableCell className="px-1 sm:px-2">{category.productCount || 0}</TableCell>
                            <TableCell className="px-1 sm:px-2">{category.order}</TableCell>
                            <TableCell className="px-1 sm:px-2">
                              <Badge variant={category.visibility === 'public' ? 'default' : 'secondary'}>
                                {category.visibility}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right px-1 sm:px-2">
                              <div className="flex justify-end gap-1 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewProducts(category)}
                                  className="h-7 sm:h-8"
                                >
                                  <Package className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Manage</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                  className="h-7 sm:h-8"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category)}
                                  className="h-7 sm:h-8"
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {categories.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No categories found
                      </CardContent>
                    </Card>
                  ) : (
                    categories.map((category) => (
                      <Card key={category._id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {category.image ? (
                                  <img 
                                    src={category.image} 
                                    alt={category.name}
                                    className="w-10 h-10 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <FolderOpen className="h-5 w-5 text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{category.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{category.slug}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {category.productCount || 0} products
                                  </span>
                                  <Badge variant={category.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                                    {category.visibility}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button variant="outline" size="sm" onClick={() => handleViewProducts(category)}>
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sticky Pagination at bottom */}
        {!loading && pagination.totalPages > 1 && (
          <div className="sticky bottom-0 bg-background z-20 w-full">
            <div className="w-full py-2">
              <ProductsPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                loadedItems={categories.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Dialogs */}
        <CategoryDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
          onSave={handleSaveCategory}
          mode={dialogMode}
          category={selectedCategory}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {itemToDelete?.type === 'category' ? 'morsebiz exclusive category' : 'product'}?
                {itemToDelete?.type === 'category' && ' This will only delete the morsebiz exclusive category, not the products.'}
                {itemToDelete?.type === 'product' && ' This will only remove the product from this morsebiz exclusive category.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
};

export default ExclusivePage;
