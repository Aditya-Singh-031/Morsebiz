'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import ProtectedProductForm from '@/components/ProtectedProductForm/ProtectedProductForm';
import ProductService from '@/services/productService';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductsHeader from '../components/ProductsHeader/ProductsHeader';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    
    try {
      // Create new product
      const newProduct = await ProductService.createProduct(formData);
      
      toast.success('Product created successfully!');
      
      // Redirect to the new product's edit page or products list
      if (newProduct?.slug) {
        router.push(`/dashboard/products/edit/${encodeURIComponent(newProduct.slug)}`);
      } else {
        router.push('/dashboard/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Handle specific error cases
      if (error.message?.includes('part number') && error.message?.includes('exists')) {
        toast.error('A product with this part number already exists');
      } else if (error.message?.includes('slug') && error.message?.includes('exists')) {
        toast.error('A product with this combination already exists');
      } else if (error.message?.includes('already exists')) {
        toast.error('A product with this part number already exists');
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        toast.error('You do not have permission to create products');
      } else if (error.message?.includes('Authentication failed')) {
        toast.error('Please login again to create products');
      } else {
        toast.error(error.message || 'Failed to create product');
      }
      
      throw error; // Re-throw to let the form handle it
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="px-0 space-y-6 flex-1">
          {/* Header - matching main products page exactly */}
          <ProductsHeader 
            onAddProduct={() => router.push('/dashboard/products/add')}
            searchValue=""
            onSearchChange={() => {}}
            title="Add New Product"
            mobileTitle="Add Product"
            
            hideAddButton={true}
            hideSearch={true}
          />

          {/* Product Form - Full Width */}
          <div className="w-full">
            <div className="w-full">
              <div className="w-full">
                <ProtectedProductForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={submitting}
                  mode="add"
                  requiredRoles={['admin', 'super-admin']}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Button - Only at bottom */}
        <div className="sticky bottom-0 bg-background z-20 w-full border-t">
          <div className="w-full py-3 px-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
                className="h-9 px-3 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Show confirmation dialog
                  if (window.confirm('Are you sure you want to create this product?')) {
                    const form = document.querySelector('form');
                    if (form) {
                      form.requestSubmit();
                    }
                  }
                }}
                disabled={submitting}
                className="h-9 px-3 text-xs sm:text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}