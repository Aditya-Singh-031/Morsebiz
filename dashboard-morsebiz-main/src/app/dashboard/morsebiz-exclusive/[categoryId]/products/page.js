'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsHeader from '../../../products/components/ProductsHeader/ProductsHeader';
import ProductsPagination from '../../../products/components/ProductsPagination/ProductsPagination';
import ProductsTable from '../../../products/components/ProductsTable/ProductsTable';
import config from '@/config/config';
import Cookies from 'js-cookie';

// Service for category products management
const CategoryProductsService = {
  async getCategory(categoryId) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  async getCategoryProducts(categoryId, params = {}) {
    const { page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}/products?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  async searchProducts(searchTerm, page = 1, limit = 20) {
    const queryParams = new URLSearchParams({
      q: searchTerm,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/products/search?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  async addProductsToCategory(categoryId, productIds) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/categories/${categoryId}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
};

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  // Add products dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchPagination, setSearchPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch category details
  const fetchCategory = useCallback(async () => {
    try {
      const response = await CategoryProductsService.getCategory(categoryId);
      if (response.success) {
        setCategory(response.data);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category details');
    }
  }, [categoryId]);

  // Fetch products in category
  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await CategoryProductsService.getCategoryProducts(categoryId, {
        page,
        limit: pagination.itemsPerPage
      });

      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, pagination.itemsPerPage]);

  // Search products to add
  const handleSearchProducts = useCallback(async (page = 1) => {
    if (!searchTerm.trim()) {
      setSearchProducts([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await CategoryProductsService.searchProducts(searchTerm, page, 20);
      
      if (response.success) {
        setSearchProducts(response.data || []);
        setSearchPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  // Add selected products to category
  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      await CategoryProductsService.addProductsToCategory(categoryId, selectedProducts);
      toast.success(`${selectedProducts.length} product(s) added successfully`);
      setIsAddDialogOpen(false);
      setSelectedProducts([]);
      setSearchTerm('');
      setSearchProducts([]);
      fetchProducts(pagination.currentPage);
    } catch (error) {
      console.error('Error adding products:', error);
      toast.error('Failed to add products');
    }
  };

  // Remove product from category
  const handleRemoveProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name || product.partNumber}" from this category?`)) {
      return;
    }

    try {
      await CategoryProductsService.removeProductFromCategory(categoryId, product._id);
      toast.success('Product removed successfully');
      fetchProducts(pagination.currentPage);
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Failed to remove product');
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchCategory();
    fetchProducts(1);
  }, [fetchCategory, fetchProducts]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearchProducts(1);
        setSearchPage(1);
      } else {
        setSearchProducts([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearchProducts]);

  const handlePageChange = (page) => {
    fetchProducts(page);
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
    fetchProducts(1);
  };

  const handleEditProduct = (product) => {
    router.push(`/dashboard/products/edit/${product._id}`);
  };

  const handleViewProduct = (product) => {
    router.push(`/dashboard/products/${product._id}`);
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin', 'manager']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <ProductsHeader
            onAddProduct={() => setIsAddDialogOpen(true)}
            title={category ? `${category.name} - Products` : 'Loading...'}
            mobileTitle={category ? category.name : 'Products'}
            addButtonText="Add Products"
          />

          {/* Products Table */}
          {loading ? (
            <div className="container mx-auto px-4">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="container mx-auto px-4">
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground text-lg mb-4">No products in this category yet</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Products
                </Button>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-4">
              <ProductsTable
                products={products}
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleRemoveProduct}
                onView={handleViewProduct}
                deleteButtonText="Remove"
              />
            </div>
          )}
        </div>

        {/* Sticky Pagination at bottom */}
        {!loading && pagination.totalPages > 0 && products.length > 0 && (
          <div className="sticky bottom-0 bg-background z-20 w-full">
            <div className="w-full py-2">
              <ProductsPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={pagination.totalItems}
                loadedItems={products.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Add Products Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Products to {category?.name}</DialogTitle>
              <DialogDescription>
                Search and select products to add to this morsebiz exclusive category
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products by name or part number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected count */}
              {selectedProducts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedProducts.length} product(s) selected
                </div>
              )}

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto border rounded-lg">
                {searchLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : searchProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? 'No products found' : 'Start typing to search products'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchProducts.map((product) => (
                      <div
                        key={product._id}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => toggleProductSelection(product._id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={() => toggleProductSelection(product._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name || product.partNumber}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name || product.partNumber}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {product.partNumber && (
                                <span>{product.partNumber}</span>
                              )}
                              {product.brand?.name && (
                                <>
                                  <span>•</span>
                                  <span>{product.brand.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination for search */}
              {searchPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchPage === 1}
                    onClick={() => {
                      setSearchPage(prev => prev - 1);
                      handleSearchProducts(searchPage - 1);
                    }}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {searchPage} of {searchPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchPage === searchPagination.totalPages}
                    onClick={() => {
                      setSearchPage(prev => prev + 1);
                      handleSearchProducts(searchPage + 1);
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddProducts}
                disabled={selectedProducts.length === 0}
              >
                Add {selectedProducts.length > 0 && `(${selectedProducts.length})`} Products
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtectedRoute>
  );
}
