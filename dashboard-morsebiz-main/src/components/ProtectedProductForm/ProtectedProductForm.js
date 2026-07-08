'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/store/slices/authSlice';
import ProductForm from '@/components/ProductForm/ProductForm';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

const ProtectedProductForm = ({ 
  product = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'add',
  requiredRoles = ['admin', 'super_admin'] // Default required roles
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated) {
        try {
          await dispatch(checkAuth()).unwrap();
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
          return;
        }
      }
    };

    initAuth();
  }, [dispatch, isAuthenticated, router]);

  // Check permissions once user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !permissionChecked) {
      checkPermissions();
    }
  }, [isAuthenticated, user, permissionChecked]);

  const checkPermissions = () => {
    if (!user) {
      setPermissionError('User information not available');
      setHasPermission(false);
      setPermissionChecked(true);
      return;
    }

    // Check if user has required role
    const userRole = user.role?.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasRequiredRole) {
      // Use Next.js notFound() instead of showing Access Denied UI
      notFound();
      return;
    } else {
      // Additional permission checks based on mode
      if (mode === 'edit' && product) {
        // Check if user can edit this specific product
        // For now, allow all admins to edit any product
        // You can add more granular permissions here
        setHasPermission(true);
      } else if (mode === 'add') {
        // Check if user can create new products
        setHasPermission(true);
      } else {
        setPermissionError('Invalid operation mode');
        setHasPermission(false);
      }
    }

    setPermissionChecked(true);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToProducts = () => {
    router.push('/dashboard/products');
  };

  // Show loading while checking authentication
  if (authLoading || !permissionChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Verifying permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to access this page.
            </p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no permission - notFound() will be called in checkPermissions
  if (!hasPermission) {
    return null;
  }

  // Enhanced onSubmit with additional security checks
  const handleSecureSubmit = async (formData) => {
    // Double-check permissions before submission
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Add user information to the submission data
    const secureFormData = {
      ...formData,
      // Add audit trail information
      lastModifiedBy: user.id || user._id,
      lastModifiedByEmail: user.email,
      lastModifiedAt: new Date().toISOString(),
      // Add creation info for new products
      ...(mode === 'add' && {
        createdBy: user.id || user._id,
        createdByEmail: user.email,
        createdAt: new Date().toISOString()
      })
    };

    try {
      await onSubmit(secureFormData);
    } catch (error) {
      // Handle specific permission errors
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        setHasPermission(false);
        setPermissionError('Your session may have expired or permissions have changed. Please refresh and try again.');
      }
      throw error;
    }
  };

  // Show success message for authorized users
  return (
    <div className="space-y-4">
     

      {/* Render the actual form */}
      <ProductForm
        product={product}
        onSubmit={handleSecureSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
        mode={mode}
      />
    </div>
  );
};

export default ProtectedProductForm;