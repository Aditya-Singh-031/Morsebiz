'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProtectedProductForm from '@/components/ProtectedProductForm/ProtectedProductForm';
import ProductService from '@/services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductsHeader from '@/app/dashboard/products/components/ProductsHeader/ProductsHeader';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const partNumber = params.partNumber;

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!partNumber) {
        notFound();
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Get product by partNumber
        const response = await ProductService.getProduct(partNumber);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          // Product not found, show 404 page
          notFound();
        }
      } catch (error) {
        console.error('Error loading product:', error);
        // If it's a 404 error or product not found, show 404 page
        if (error.message?.includes('not found') || error.status === 404) {
          notFound();
        } else {
          setError(error.message || 'Failed to load product');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [partNumber]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!product?.slug) {
      toast.error('Product slug is missing');
      return;
    }

    setSubmitting(true);
    
    try {
      // Update product using the slug
      const updatedProduct = await ProductService.updateProduct(product.slug, formData);
      
      toast.success('Product updated successfully!');
      
      
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Handle specific error cases
      if (error.message?.includes('part number') && error.message?.includes('exists')) {
        toast.error('A product with this part number already exists');
      } else if (error.message?.includes('slug') && error.message?.includes('exists')) {
        toast.error('A product with this combination already exists');
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        toast.error('You do not have permission to update this product');
      } else {
        toast.error(error.message || 'Failed to update product');
      }
      
      // Don't throw error to prevent form from staying in loading state
      // The error toast will inform the user about the issue
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-4 space-x-2">
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/products')}>
                  Go to Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            title={`Edit Product - ${product?.partNumber || 'Loading...'}`}
            mobileTitle={`Edit - ${product?.partNumber || 'Loading...'}`}
            filtersComponent={null}
            hideAddButton={true}
            hideSearch={true}
          />

          {/* Product Form - Full Width */}
          <div className="w-full">
            <div className="w-full">
             
              <div className="w-full">
                <ProtectedProductForm
                  product={product}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={submitting}
                  mode="edit"
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
                  if (window.confirm('Are you sure you want to save the changes to this product?')) {
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}