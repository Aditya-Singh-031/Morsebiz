'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Copy, Image as ImageIcon, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import HomepageSliderService from '@/services/homepageSliderService';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../../products/components/ProductsPagination/ProductsPagination';


// Header Component
const HomepageSlidersHeader = ({ searchTerm, onSearchChange }) => {
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
              <span className="hidden sm:inline">Homepage Sliders</span>
              <span className="sm:hidden">Sliders</span>
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

            {/* Add Slider Button */}
            <Link href="/dashboard/website-settings/homepage-slider/add">
              <Button 
                className="h-8 sm:h-9 w-8 sm:w-auto px-2 text-xs flex-shrink-0"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Add</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search Row - Full width on small screens */}
        <div className="block sm:hidden mt-2">
          <div className="relative">
            <Input
              placeholder="Search sliders..."
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

// Sliders Table Component
const SlidersTable = ({ sliders = [], loading = false, onCopy, onDelete, onToggleStatus, pagination = { page: 1, limit: 20 } }) => {
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to get image URL with validation
  const getImageUrl = (imageUrl) => {
    // If no image URL provided, return fallback
    if (!imageUrl || typeof imageUrl !== 'string') {
      return '/images/no-image.png';
    }

    // If it's already a full URL (starts with http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it starts with a slash, it's a relative path from root
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Otherwise, construct the full URL using the config
    return `/images/${imageUrl}`;
  };

  const handleImageError = (sliderId) => {
    setImageErrors(prev => ({
      ...prev,
      [sliderId]: true
    }));
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-1">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table className="w-full min-w-[600px] text-xs sm:text-sm">
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="text-xs w-8 sm:w-12 px-1 sm:px-2">SL</TableHead>
                <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Image</TableHead>
                <TableHead className="text-xs w-32 sm:w-48 px-1 sm:px-2">Title</TableHead>
                <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2 hidden sm:table-cell">Order</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
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
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Image</TableHead>
              <TableHead className="text-xs w-32 sm:w-48 px-1 sm:px-2">Title</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2 hidden sm:table-cell">Order</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden xl:table-cell">Created</TableHead>
              <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {sliders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No sliders found. Try adjusting your search terms.
                  </TableCell>
                </TableRow>
              ) : (
                sliders.map((slider, index) => (
                  <TableRow key={slider._id} className="hover:bg-muted/50">
                    {/* Serial Number */}
                    <TableCell className="px-1 sm:px-2 font-medium">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>

                    {/* Image */}
                    <TableCell className="px-1 sm:px-2">
                      <Link 
                        href={`/dashboard/website-settings/homepage-slider/edit/${slider._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div 
                          className="relative w-12 h-8 sm:w-16 sm:h-10 rounded overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title="Click to edit slider in new tab"
                        >
                          {(slider.featureMedia || slider.featureImage) && !imageErrors[slider._id] ? (
                            <Image
                              src={getImageUrl(slider.featureMedia || slider.featureImage)}
                              alt={slider.title}
                              fill
                              className="object-cover"
                              onError={() => handleImageError(slider._id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="px-1 sm:px-2">
                      <Link 
                        href={`/dashboard/website-settings/homepage-slider/edit/${slider._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div 
                          className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                          title="Click to edit slider in new tab"
                        >
                          <div className="font-medium text-xs sm:text-sm line-clamp-1 hover:text-primary">
                            {slider.title}
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Order */}
                    <TableCell className="px-1 sm:px-2 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {slider.order}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-1 sm:px-2">
                      <Badge 
                        variant={slider.isActive ? 'default' : 'secondary'}
                        className="cursor-pointer text-xs"
                        onClick={() => onToggleStatus(slider)}
                      >
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="px-1 sm:px-2 hidden xl:table-cell">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {slider.createdAt ? new Date(slider.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right px-1 sm:px-2">
                      <div className="flex justify-end gap-0.5">
                        <Link href={`/dashboard/website-settings/homepage-slider/edit/${slider._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Slider"
                            className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCopy(slider)}
                          title="Copy Slider"
                          className="h-6 w-6 p-0 sm:h-8 sm:w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(slider)}
                          title="Delete Slider"
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

export default function HomepageSlidersPage() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, slider: null });
  const [copyDialog, setCopyDialog] = useState({ isOpen: false, slider: null });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      };

      const response = await HomepageSliderService.getAllSliders(params);
      
      if (response.success) {
        setSliders(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.totalItems || 0);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch sliders');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch sliders');
      setSliders([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSliders();
  }, [currentPage, itemsPerPage]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchSliders();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);



  const handleDeleteSlider = (slider) => {
    setDeleteDialog({ isOpen: true, slider });
  };

  const handleToggleStatus = async (slider) => {
    try {
      const response = await HomepageSliderService.toggleSliderStatus(slider._id);
      
      if (response.success) {
        setSliders(prev => prev.map(s => 
          s._id === slider._id 
            ? { ...s, isActive: response.data.isActive }
            : s
        ));
      } else {
        throw new Error(response.message || 'Failed to toggle slider status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to toggle slider status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.slider) return;

    try {
      const response = await HomepageSliderService.deleteSlider(deleteDialog.slider._id);
      
      if (response.success) {
        setSliders(prev => prev.filter(s => s._id !== deleteDialog.slider._id));
        toast.success(response.message || 'Slider deleted successfully');
        
        // Refresh if current page becomes empty and it's not the first page
        if (sliders.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchSliders();
        }
      } else {
        throw new Error(response.message || 'Failed to delete slider');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete slider');
    } finally {
      setDeleteDialog({ isOpen: false, slider: null });
    }
  };

  const handleCopyConfirm = async () => {
    try {
      await HomepageSliderService.copySlider(copyDialog.slider._id);
      await fetchSliders();
      setCopyDialog({ isOpen: false, slider: null });
    } catch (error) {
      console.error('Error copying slider:', error.message);
      toast.error(`Failed to copy slider: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCopyDialogClose = () => {
    setCopyDialog({ isOpen: false, slider: null });
  };



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <div className="space-y-4">
        <HomepageSlidersHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Sliders Table */}
        <SlidersTable
          sliders={sliders}
          loading={loading}
          onCopy={(slider) => setCopyDialog({ isOpen: true, slider })}
          onDelete={handleDeleteSlider}
          onToggleStatus={handleToggleStatus}
          pagination={{ page: currentPage, limit: itemsPerPage }}
        />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="w-full py-2">
            <ProductsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              loadedItems={sliders.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              loading={loading}
            />
          </div>
        )}



        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, slider: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Slider</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialog.slider?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, slider: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy Confirmation Dialog */}
        <Dialog open={copyDialog.isOpen} onOpenChange={(open) => !open && handleCopyDialogClose()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy Slider</DialogTitle>
              <DialogDescription>
                Are you sure you want to create a copy of "{copyDialog.slider?.title}"? A new slider will be created with the same content.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCopyDialogClose}>
                Cancel
              </Button>
              <Button onClick={handleCopyConfirm}>
                Yes, Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtectedRoute>
  );
}