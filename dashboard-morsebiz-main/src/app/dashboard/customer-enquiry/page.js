'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, ArrowLeft, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CustomerEnquiryService from '@/services/customerEnquiryService';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import CustomerEnquiryDialog from './components/CustomerEnquiryDialog';

// Header Component
const CustomerEnquiryHeader = ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => {
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
              <span className="">Customer Enquiry </span>
             
            </h1>
          </div>

          {/* Right Section - Search and Status Filter (Search hidden on mobile) */}
          <div className="flex items-center gap-1 justify-end">
            {/* Search - Only visible on larger screens */}
            <div className="relative hidden sm:block w-24 md:w-full lg:w-full">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-xs sm:text-sm h-9 pr-2"
              />
            </div>

            {/* Status Filter - Only visible on larger screens */}
            <div className="hidden md:block w-32 lg:w-40">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button for small devices - Top right */}
            <div className="block md:hidden">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-9 w-auto px-2 gap-1 [&>span]:hidden">
                  <Filter className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs truncate max-w-12">
                    {statusFilter === 'all' ? 'All' : 
                     statusFilter === 'partial' ? 'Part.' : 
                     statusFilter === 'submitted' ? 'Sub.' : 
                     statusFilter === 'in-progress' ? 'Prog.' : 
                     statusFilter === 'completed' ? 'Comp.' : 
                     statusFilter === 'cancelled' ? 'Canc.' : 'All'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mobile Search Row - Full width on small screens */}
        <div className="block sm:hidden mt-2">
          <div className="relative">
            <Input
              placeholder="Search customer enquiries..."
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

// Customer Enquiry Table Component
const CustomerEnquiryTable = ({ customerEnquiries = [], loading = false, onView, onDelete }) => {
  // Status color mapping
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'partial':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Truncate message
  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No message';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Truncate product name
  const truncateProduct = (product, maxLength = 30) => {
    if (!product) return 'N/A';
    if (product.length <= maxLength) return product;
    return product.substring(0, maxLength) + '...';
  };

  // Get initials from full name
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-1">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[900px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-8 sm:w-12">SL</TableHead>
                <TableHead className="text-xs w-40 sm:w-48">Customer Name</TableHead>
                <TableHead className="text-xs w-32 sm:w-40">Product</TableHead>
                <TableHead className="text-xs w-48 sm:w-64">Message</TableHead>
                <TableHead className="text-xs w-20 sm:w-24">Status</TableHead>
                <TableHead className="text-xs w-20 sm:w-24">Date</TableHead>
                <TableHead className="text-right text-xs w-16 sm:w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
        <Table className="w-full min-w-[900px] text-xs sm:text-sm">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="text-xs w-8 sm:w-12 px-1 sm:px-2">SL</TableHead>
              <TableHead className="text-xs w-40 sm:w-48 px-1 sm:px-2">Customer Name</TableHead>
              <TableHead className="text-xs w-32 sm:w-40 px-1 sm:px-2">Product</TableHead>
              <TableHead className="text-xs w-48 sm:w-64 px-1 sm:px-2">Message</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Created</TableHead>
              <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customer enquiries found. Try adjusting your search terms or filters.
                </TableCell>
              </TableRow>
            ) : (
              customerEnquiries.map((request, index) => (
                <TableRow key={request._id} className="hover:bg-muted/50">
                  {/* Serial Number */}
                  <TableCell className="px-1 sm:px-2 font-medium">
                    {index + 1}
                  </TableCell>

                  {/* Customer Name */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800">
                          {getInitials(request.fullName)}
                        </span>
                      </div>
                      
                      {/* Name and Email */}
                      <div className="min-w-0 flex-1">
                        <div 
                          className="font-medium text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 transition-colors" 
                          title={request.fullName}
                          onClick={() => onView(request._id)}
                        >
                          {request.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" title={request.email}>
                          {request.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Product */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="text-xs sm:text-sm truncate" 
                      title={request.product || 'No product specified'}
                    >
                      {truncateProduct(request.product)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {request.quantity || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Message */}
                  <TableCell className="px-1 sm:px-2">
                    <div 
                      className="text-xs sm:text-sm text-muted-foreground" 
                      title={request.message || 'No message'}
                    >
                      {truncateMessage(request.message)}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-1 sm:px-2">
                    <Badge 
                      variant="secondary"
                      className={`text-xs capitalize ${getStatusBadgeColor(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(request.createdAt)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right px-1 sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(request._id)}
                        title="View Details"
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(request)}
                        title="Delete Request"
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



// Main Customer Enquiry Page Component
export default function CustomerEnquiryPage() {
  const router = useRouter();
  const [customerEnquiries, setCustomerEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Fetch customer enquiries
  const fetchCustomerEnquiries = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await CustomerEnquiryService.getAllCustomerEnquiries(params);

      if (response.success) {
        setCustomerEnquiries(response.data || []);
        setCurrentPage(page);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        setError(response.message || 'Failed to fetch customer enquiries');
      }
    } catch (error) {
      console.error('Error fetching customer enquiries:', error);
      setError(error.message || 'Failed to fetch customer enquiries');
    } finally {
      setLoading(false);
    }
  };

  // Search customer enquiries
  const searchCustomerEnquiries = async (search = '') => {
    try {
      setLoading(true);
      const params = {
        search,
        limit: 50
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await CustomerEnquiryService.searchCustomerEnquiries(params);

      if (response.success) {
        setCustomerEnquiries(response.data || []);
        // For search results, we don't use pagination
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(response.data?.length || 0);
      } else {
        setError(response.message || 'Failed to search customer enquiries');
      }
    } catch (error) {
      console.error('Error searching customer enquiries:', error);
      setError(error.message || 'Failed to search customer enquiries');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomerEnquiries(1);
  }, [statusFilter]);

  // Handle search
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      // If there's a search term, use search API
      searchCustomerEnquiries(value);
    } else {
      // If no search term, fetch regular customer enquiries list
      fetchCustomerEnquiries(1);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setSearchTerm(''); // Clear search when changing filter
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (searchTerm.trim()) {
      // If searching, don't paginate - search results are limited
      return;
    }
    fetchCustomerEnquiries(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    if (searchTerm.trim()) {
      // If searching, re-search with new limit
      searchCustomerEnquiries(searchTerm);
    } else {
      // If not searching, fetch customer enquiries with new limit
      fetchCustomerEnquiries(1);
    }
  };

  // Handle view quote request
  const handleViewCustomerEnquiry = (requestId) => {
    setSelectedRequestId(requestId);
    setDetailDialogOpen(true);
  };

  // Handle status update from dialog
  const handleStatusUpdateFromDialog = (requestId, newStatus) => {
    // Update the request in the list
    setCustomerEnquiries(prevRequests => 
      prevRequests.map(request => 
        request._id === requestId ? { ...request, status: newStatus } : request
      )
    );
  };

  // Handle delete quote request
  const handleDeleteCustomerEnquiry = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      const response = await CustomerEnquiryService.deleteCustomerEnquiry(requestToDelete._id);
      
      if (response.success) {
        // Remove request from the list instantly
        setCustomerEnquiries(prevRequests => 
          prevRequests.filter(request => request._id !== requestToDelete._id)
        );
        // Update total items count
        setTotalItems(prev => prev - 1);
        
        toast.success('Customer enquiry deleted successfully');
        setDeleteDialogOpen(false);
        setRequestToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete customer enquiry');
      }
    } catch (error) {
      console.error('Error deleting customer enquiry:', error);
      toast.error(error.message || 'Failed to delete customer enquiry');
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <CustomerEnquiryHeader 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
          />

          {/* Customer Enquiry Table */}
          <CustomerEnquiryTable 
            customerEnquiries={customerEnquiries} 
            loading={loading}
            onView={handleViewCustomerEnquiry}
            onDelete={handleDeleteCustomerEnquiry}
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
                loadedItems={customerEnquiries.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Customer Enquiry Detail Dialog */}
        <CustomerEnquiryDialog
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedRequestId(null);
          }}
          customerEnquiryId={selectedRequestId}
          onStatusUpdate={handleStatusUpdateFromDialog}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Customer Enquiry</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the customer enquiry from &quot;{requestToDelete?.fullName}&quot;? This action cannot be undone.
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