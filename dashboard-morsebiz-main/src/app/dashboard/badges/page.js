'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Trash2, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsHeader from '../products/components/ProductsHeader/ProductsHeader';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import BadgeDialog from './BadgeDialog';
import config from '@/config/config';
import Cookies from 'js-cookie';

// Badge service
const BadgeService = {
  async getAllBadges(params = {}) {
    const { page = 1, limit = 50, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/badges?${queryParams}`, {
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

  async createBadge(badgeData) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/badges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async updateBadge(id, badgeData) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/badges/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${Cookies.get('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async deleteBadge(id) {
    const response = await fetch(`${config.API_BASE_URL}/api/dashboard/badges/${id}`, {
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
  }
};

// Badge Card Component for mobile view
const BadgeCard = ({ badge, onEdit, onDelete }) => {
  const getBadgeIconUrl = (iconName) => {
    if (!iconName) return '';
    if (iconName.startsWith('http')) return iconName;
    return `${config.STORAGE_URL}/badges/${iconName}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Badge Preview */}
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: badge.color, 
                color: badge.textColor 
              }}
            >
              {badge.icon && (
                <img 
                  src={getBadgeIconUrl(badge.icon)} 
                  alt=""
                  className="w-3 h-3"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span>{badge.label}</span>
            </div>
            
            {/* Badge Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground">
                Slug: {badge.slug}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(badge)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(badge)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Badges Page Component
const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Fetch badges
  const fetchBadges = async (page = 1, search = '', limit = 50) => {
    try {
      setLoading(true);
      const response = await BadgeService.getAllBadges({
        page,
        limit,
        search: search || undefined
      });

      if (response.success) {
        setBadges(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        toast.error('Failed to fetch badges');
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast.error('Error fetching badges');
    } finally {
      setLoading(false);
    }
  };

  // Load badges on component mount and when search/page changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchBadges(1, searchTerm, pagination.itemsPerPage);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchBadges(newPage, searchTerm, pagination.itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit
    }));
    fetchBadges(1, searchTerm, newLimit);
  };

  // Handle badge operations
  const handleAddBadge = () => {
    setSelectedBadge(null);
    setIsAddDialogOpen(true);
  };

  const handleEditBadge = (badge) => {
    setSelectedBadge(badge);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBadge = (badge) => {
    setSelectedBadge(badge);
    setIsDeleteDialogOpen(true);
  };

  const handleBadgeCreate = async (badgeData) => {
    try {
      const response = await BadgeService.createBadge(badgeData);
      if (response.success) {
        toast.success('Badge created successfully');
        fetchBadges(pagination.currentPage, searchTerm);
        setIsAddDialogOpen(false);
      } else {
        toast.error(response.message || 'Failed to create badge');
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      toast.error('Error creating badge');
    }
  };

  const handleBadgeUpdate = async (badgeData) => {
    try {
      const response = await BadgeService.updateBadge(selectedBadge._id, badgeData);
      if (response.success) {
        toast.success('Badge updated successfully');
        fetchBadges(pagination.currentPage, searchTerm);
        setIsEditDialogOpen(false);
      } else {
        toast.error(response.message || 'Failed to update badge');
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      toast.error('Error updating badge');
    }
  };

  const handleBadgeDelete = async () => {
    try {
      const response = await BadgeService.deleteBadge(selectedBadge._id);
      if (response.success) {
        toast.success('Badge deleted successfully');
        fetchBadges(pagination.currentPage, searchTerm);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(response.message || 'Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast.error('Error deleting badge');
    }
  };

  const getBadgeIconUrl = (iconName) => {
    if (!iconName) return '';
    if (iconName.startsWith('http')) return iconName;
    return `${config.STORAGE_URL}/badges/${iconName}`;
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <ProductsHeader
            onAddProduct={handleAddBadge}
            searchValue={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            title="Badges Management"
            mobileTitle="Badges"
            addButtonText="Add Badge"
            hideSearch={false}
          />

          {/* Content Area */}
          <div className="w-full px-0 sm:px-1">
            {loading ? (
              <div className="overflow-x-auto">
                <Table className="min-h-96 w-full">
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="text-xs">Preview</TableHead>
                      <TableHead className="text-xs">Label</TableHead>
                      <TableHead className="text-xs">Slug</TableHead>
                      <TableHead className="text-xs">Icon</TableHead>
                      <TableHead className="text-xs">Colors</TableHead>
                      <TableHead className="text-xs">Created</TableHead>
                      <TableHead className="text-right text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
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
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="text-xs px-1 sm:px-2">Preview</TableHead>
                        <TableHead className="text-xs px-1 sm:px-2">Label</TableHead>
                        <TableHead className="text-xs px-1 sm:px-2">Slug</TableHead>
                        <TableHead className="text-xs px-1 sm:px-2">Icon</TableHead>
                        <TableHead className="text-xs px-1 sm:px-2">Colors</TableHead>
                        <TableHead className="text-xs px-1 sm:px-2">Created</TableHead>
                        <TableHead className="text-right text-xs px-1 sm:px-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {badges.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No badges found. Try adjusting your search terms.
                          </TableCell>
                        </TableRow>
                      ) : (
                        badges.map((badge) => (
                          <TableRow key={badge._id}>
                            <TableCell className="px-1 sm:px-2">
                              <div 
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit"
                                style={{ 
                                  backgroundColor: badge.color, 
                                  color: badge.textColor 
                                }}
                              >
                                {badge.icon && (
                                  <img 
                                    src={getBadgeIconUrl(badge.icon)} 
                                    alt=""
                                    className="w-3 h-3"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span>{badge.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium px-1 sm:px-2">{badge.label}</TableCell>
                            <TableCell className="text-muted-foreground px-1 sm:px-2">{badge.slug}</TableCell>
                            <TableCell className="px-1 sm:px-2">
                              {badge.icon && (
                                <img 
                                  src={getBadgeIconUrl(badge.icon)} 
                                  alt=""
                                  className="w-6 h-6"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell className="px-1 sm:px-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: badge.color }}
                                  title={`Background: ${badge.color}`}
                                />
                                <div 
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: badge.textColor }}
                                  title={`Text: ${badge.textColor}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground px-1 sm:px-2">
                              {badge.createdAt ? new Date(badge.createdAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right px-1 sm:px-2">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBadge(badge)}
                                  className="h-7 sm:h-8"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBadge(badge)}
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
                  {badges.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No badges found
                      </CardContent>
                    </Card>
                  ) : (
                    badges.map((badge) => (
                      <BadgeCard
                        key={badge._id}
                        badge={badge}
                        onEdit={handleEditBadge}
                        onDelete={handleDeleteBadge}
                      />
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
                loadedItems={badges.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Dialogs */}
        {/* Add Badge Dialog */}
        <BadgeDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleBadgeCreate}
          mode="create"
        />

        {/* Edit Badge Dialog */}
        <BadgeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleBadgeUpdate}
          mode="edit"
          badge={selectedBadge}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Badge</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the badge "{selectedBadge?.label}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBadgeDelete}>
                Delete Badge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleProtectedRoute>
  );
};

export default BadgesPage;