'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Trash2, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BrandService from '@/services/brandService';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import BrandDialog from './BrandDialog';

// Header Component
const BrandsHeader = ({ searchTerm, onSearchChange, onAddBrand }) => {
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
              <span className="hidden sm:inline">Brands Management</span>
              <span className="sm:hidden">Brands</span>
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

            {/* Add Brand Button */}
            <Button 
              onClick={onAddBrand} 
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
              placeholder="Search brands..."
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

// Brands Table Component
const BrandsTable = ({ brands = [], loading = false, onEdit, onDelete }) => {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to get brand logo URL with validation
  const getBrandLogoUrl = (logoUrl) => {
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

  const handleEdit = (brand) => {
    if (onEdit) {
      onEdit(brand);
    } else {
      router.push(`/dashboard/brands/edit/${brand._id}`);
    }
  };

  const handleView = (brand) => {
    if (onView) {
      onView(brand);
    } else {
      router.push(`/dashboard/brands/${brand._id}`);
    }
  };

  const handleDelete = (brand) => {
    if (onDelete) {
      onDelete(brand);
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
                <TableHead className="text-xs w-32 sm:w-48">Brand Name</TableHead>
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
                <TableHead className="text-xs w-32 sm:w-48 px-1 sm:px-2">Brand Name</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2">Slug</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden sm:table-cell">Visibility</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden md:table-cell">Created By</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No brands found. Try adjusting your search terms.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand, index) => (
                <TableRow key={brand._id} className="hover:bg-muted/50">
                  {/* Serial Number */}
                  <TableCell className="px-1 sm:px-2 font-medium">
                    {index + 1}
                  </TableCell>

                  {/* Logo */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="w-8 h-8 bg-muted rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden"
                      onClick={() => onEdit(brand)}
                    >
                      <Image
                        src={imageErrors[brand._id] ? '/images/no-image.png' : getBrandLogoUrl(brand.logo)}
                        alt={brand.logo ? brand.title : 'No logo'}
                        fill
                        sizes="32px"
                        className="object-contain rounded"
                        loading="lazy"
                        onError={() => setImageErrors(prev => ({ ...prev, [brand._id]: true }))}
                      />
                    </div>
                  </TableCell>

                  {/* Brand Name */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="font-medium text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 transition-colors" 
                      title={brand.title}
                      onClick={() => onEdit(brand)}
                    >
                      {brand.title}
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm text-muted-foreground truncate" title={brand.slug}>
                      {brand.slug}
                    </div>
                  </TableCell>

                  {/* Visibility */}
                  <TableCell className="px-1 sm:px-2 hidden sm:table-cell">
                    <Badge 
                      variant={brand.visibility === 'public' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        brand.visibility === 'public' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {brand.visibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>

                  {/* Created By */}
                  <TableCell className="px-1 sm:px-2 hidden md:table-cell">
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {brand.createdBy || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="px-1 sm:px-2 hidden lg:table-cell">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right px-1 sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(brand)}
                        title="Edit Brand"
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(brand)}
                        title="Delete Brand"
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

// Main Brands Page Component
export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'

  // Fetch brands
  const fetchBrands = async (page = 1) => {
    try {
      setLoading(true);
      const response = await BrandService.getAllBrands({
        page,
        limit: itemsPerPage
      });

      if (response.success) {
        setBrands(response.data || []);
        setCurrentPage(page);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        setError(response.message || 'Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError(error.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  // Search brands
  const searchBrands = async (search = '') => {
    try {
      setLoading(true);
      const response = await BrandService.searchBrands({
        search,
        limit: 50
      });

      if (response.success) {
        setBrands(response.data || []);
        // For search results, we don't use pagination
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
      } else {
        setError(response.message || 'Failed to search brands');
      }
    } catch (error) {
      console.error('Error searching brands:', error);
      setError(error.message || 'Failed to search brands');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBrands(1);
  }, []);

  // Handle search
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      // If there's a search term, use search API
      searchBrands(value);
    } else {
      // If no search term, fetch regular brands list
      fetchBrands(1);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (searchTerm.trim()) {
      // If searching, don't paginate - search results are limited
      return;
    }
    fetchBrands(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    if (searchTerm.trim()) {
      // If searching, re-search with new limit
      searchBrands(searchTerm);
    } else {
      // If not searching, fetch brands with new limit
      fetchBrands(1);
    }
  };

  // Handle add brand
  const handleAddBrand = () => {
    setSelectedBrand(null);
    setDialogMode('add');
    setBrandDialogOpen(true);
  };

  // Handle edit brand
  const handleEditBrand = (brand) => {
    setSelectedBrand(brand);
    setDialogMode('edit');
    setBrandDialogOpen(true);
  };

  // Handle brand save (add/edit)
  const handleBrandSave = (savedBrand) => {
    if (dialogMode === 'add') {
      // Add new brand to the beginning of the list
      setBrands(prevBrands => [savedBrand, ...prevBrands]);
      // Update total items count
      setTotalItems(prev => prev + 1);
      toast.success('Brand added successfully');
    } else if (dialogMode === 'edit') {
      // Update existing brand in the list
      setBrands(prevBrands => 
        prevBrands.map(brand => 
          brand._id === savedBrand._id ? savedBrand : brand
        )
      );
      toast.success('Brand updated successfully');
    }
    
    // Close dialog and reset state
    setBrandDialogOpen(false);
    setSelectedBrand(null);
    setDialogMode('add');
  };

  // Handle delete brand
  const handleDeleteBrand = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!brandToDelete) return;

    try {
      const response = await BrandService.deleteBrand(brandToDelete._id);
      
      if (response.success) {
        // Remove brand from the list instantly
        setBrands(prevBrands => 
          prevBrands.filter(brand => brand._id !== brandToDelete._id)
        );
        // Update total items count
        setTotalItems(prev => prev - 1);
        
        toast.success('Brand deleted successfully');
        setDeleteDialogOpen(false);
        setBrandToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(error.message || 'Failed to delete brand');
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <BrandsHeader 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddBrand={handleAddBrand}
          />

          {/* Brands Table */}
          <BrandsTable 
              brands={brands} 
              loading={loading}
              onEdit={handleEditBrand}
              onDelete={handleDeleteBrand}
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
                loadedItems={brands.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Brand Dialog */}
        <BrandDialog
          isOpen={brandDialogOpen}
          onClose={() => setBrandDialogOpen(false)}
          onSave={handleBrandSave}
          brand={selectedBrand}
          mode={dialogMode}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Brand</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{brandToDelete?.title}&quot;? This action cannot be undone.
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