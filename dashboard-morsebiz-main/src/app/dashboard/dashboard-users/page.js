'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { initializeAuth } from '@/store/slices/authSlice';
import DashboardUsersService from '@/services/dashboardUsersService';
import { UserCog, Plus, Search, Filter, Edit, Trash2, Shield, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductsPagination from '../products/components/ProductsPagination/ProductsPagination';
import UserDialog from './UserDialog';

// Header Component
const UsersHeader = ({ searchTerm, onSearchChange, selectedRole, onRoleChange, selectedStatus, onStatusChange, onAddUser, onClearFilters }) => {
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
              <span className="hidden sm:inline">Dashboard Users Management</span>
              <span className="sm:hidden">Users</span>
            </h1>
          </div>

          {/* Right Section - Filters and Add Button (Search hidden on mobile) */}
          <div className="flex items-center gap-1 justify-end">
            {/* Search - Only visible on larger screens */}
            <div className="relative hidden sm:block w-24 md:w-32 lg:w-40">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-xs sm:text-sm h-9 pl-8 pr-2"
              />
            </div>

            {/* Role Filter */}
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-20 sm:w-28 md:w-32 h-8 sm:h-9 text-xs">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="super-admin">Super</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-20 sm:w-28 md:w-32 h-8 sm:h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {((selectedRole && selectedRole !== 'all') || (selectedStatus && selectedStatus !== 'all') || searchTerm) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearFilters}
                className="h-8 sm:h-9 w-8 sm:w-auto px-2 text-xs flex-shrink-0"
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Clear</span>
              </Button>
            )}

            {/* Add User Button */}
            <Button 
              onClick={onAddUser} 
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-sm h-9 pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Table Component
const UsersTable = ({ users = [], loading = false, onEdit, onDelete, onView }) => {
  const router = useRouter();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-1">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[800px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-48 sm:w-64 px-1 sm:px-2">User</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2">Username</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Role</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2 hidden md:table-cell">Last Login</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right text-xs w-24 sm:w-32 px-1 sm:px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                        <Skeleton className="h-2 w-32 sm:h-3 sm:w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-1 sm:px-2"><Skeleton className="h-3 w-16 sm:h-4 sm:w-24" /></TableCell>
                  <TableCell className="px-1 sm:px-2"><Skeleton className="h-5 w-12 sm:h-6 sm:w-16" /></TableCell>
                  <TableCell className="px-1 sm:px-2"><Skeleton className="h-5 w-12 sm:h-6 sm:w-16" /></TableCell>
                  <TableCell className="px-1 sm:px-2 hidden md:table-cell"><Skeleton className="h-3 w-16 sm:h-4 sm:w-20" /></TableCell>
                  <TableCell className="px-1 sm:px-2 hidden lg:table-cell"><Skeleton className="h-3 w-16 sm:h-4 sm:w-20" /></TableCell>
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex space-x-1 sm:space-x-2 justify-end">
                      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
                      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
                      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="w-full px-0 sm:px-1">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table className="w-full min-w-[800px] text-xs sm:text-sm">
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="text-xs w-48 sm:w-64 px-1 sm:px-2">User</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2">Username</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Role</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
                <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2 hidden md:table-cell">Last Login</TableHead>
                <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right text-xs w-24 sm:w-32 px-1 sm:px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found. Try adjusting your search terms or filters.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-1">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="w-full min-w-[800px] text-xs sm:text-sm">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="text-xs w-48 sm:w-64 px-1 sm:px-2">User</TableHead>
              <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2">Username</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Role</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Status</TableHead>
              <TableHead className="text-xs w-24 sm:w-32 px-1 sm:px-2 hidden md:table-cell">Last Login</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2 hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-right text-xs w-24 sm:w-32 px-1 sm:px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="hover:bg-muted/50">
                <TableCell className="px-1 sm:px-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground text-xs sm:text-sm truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-1 sm:px-2 font-medium text-xs sm:text-sm">{user.username}</TableCell>
                <TableCell className="px-1 sm:px-2">
                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-1 sm:px-2 py-0.5`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-1 sm:px-2">
                  <Badge className={`${getStatusBadgeColor(user.status)} text-xs px-1 sm:px-2 py-0.5`}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                  {formatDate(user.lastLogin)}
                </TableCell>
                <TableCell className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="px-1 sm:px-2">
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(user)}
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-100 hover:text-green-600"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(user)}
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Main Dashboard Users Page Component
export default function DashboardUsersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Fetch users function
  const fetchUsers = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && selectedRole !== 'all' && { role: selectedRole }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await DashboardUsersService.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setCurrentPage(page);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalUsers || 0);
      } else {
        setError(response.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Search users with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, itemsPerPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, selectedStatus, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchUsers(1, itemsPerPage);
  }, []);

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle role change
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchUsers(page, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    fetchUsers(1, newLimit);
  };

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle add user
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  // Handle view user
  const handleViewUser = (user) => {
    // View user functionality will be implemented soon
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDialogSuccess = () => {
    fetchUsers(currentPage, itemsPerPage);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await DashboardUsersService.deleteUser(userToDelete._id);
      
      if (response.success) {
        toast.success('User deleted successfully');
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        // Refresh the users list
        fetchUsers(currentPage, itemsPerPage);
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6">
          {/* Header */}
          <UsersHeader 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            onAddUser={handleAddUser}
            onClearFilters={handleClearFilters}
          />

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Error loading users:</span>
                  <span>{error}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => fetchUsers(currentPage, itemsPerPage)}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <UsersTable 
            users={users} 
            loading={loading}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>

        {/* Sticky Pagination at bottom */}
        {!loading && (totalPages > 1 || totalItems > 0) && (
          <div className="sticky bottom-0 bg-background z-20 w-full">
            <div className="w-full py-2">
              <ProductsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                loadedItems={users.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* User Dialog */}
        <UserDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleDialogSuccess}
          user={selectedUser}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{userToDelete?.name}&quot;? This action cannot be undone.
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