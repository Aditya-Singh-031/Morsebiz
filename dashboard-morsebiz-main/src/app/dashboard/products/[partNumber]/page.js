'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Package, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import PageHeader from '@/components/PageHeader';
import ProductService from '@/services/productService';

function ProductDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { partNumber } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const FALLBACK_IMAGE_SRC = '/images/no-image.png';

  useEffect(() => {
    if (partNumber) {
      fetchProduct();
    }
  }, [partNumber, fetchProduct]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the dedicated getProduct method for single product by partNumber
      const response = await ProductService.getProduct(partNumber);
      
      if (response.success && response.data) {
        const productData = response.data;
        setProduct(productData);
        setEditedProduct(productData);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  }, [partNumber]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProduct({ ...product });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduct({ ...product });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update product using ProductService
      await ProductService.updateProduct(partNumber, editedProduct);
      
      // Update local state
      setProduct(editedProduct);
      setIsEditing(false);
      
      // Show success message (you can add a toast notification here)
      console.log('Product updated successfully');
      
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Product Details"
          subtitle="Product not found"
          icon={Package}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="p-6 text-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentData = isEditing ? editedProduct : product;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left Section - Back Button and Title */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                    <span className="hidden sm:inline">{currentData.title || currentData.name || 'Product Details'}</span>
                    <span className="sm:hidden">Product</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {currentData.partNumber || currentData.sku}
                  </p>
                </div>
              </div>

              {/* Right Section - Edit/Save Buttons */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} size="sm" className="h-8">
                    <Edit3 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit Product</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      size="sm"
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="h-8"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                      <span className="sm:hidden">{saving ? 'Save...' : 'Save'}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-6">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Title
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={currentData.title || currentData.name || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  ) : (
                    <p className="text-foreground">{currentData.title || currentData.name || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Part Number
                  </label>
                  <p className="text-foreground">{currentData.partNumber || currentData.sku || 'N/A'}</p>
                </div>
                 </div>

              <div>
                 <label className="block text-sm font-medium mb-1">
                   Brand
                 </label>
                 {isEditing ? (
                   <Input
                     type="text"
                     value={currentData.brand?.name || currentData.brand || ''}
                     onChange={(e) => handleInputChange('brand', { name: e.target.value })}
                   />
                 ) : (
                   <p className="text-foreground">{currentData.brand?.name || currentData.brand || 'N/A'}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   Stock Status
                 </label>
                 {isEditing ? (
                   <Select
                     value={(() => {
                       const stockValue = currentData.stockavailable || currentData.stock || 'N';
                       // Normalize to Y/N format
                       if (stockValue === 'Yes' || stockValue === 'Y') return 'Y';
                       if (stockValue === 'No' || stockValue === 'N') return 'N';
                       return 'N';
                     })()}
                     onValueChange={(value) => handleInputChange('stockavailable', value)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select stock status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Y">In Stock</SelectItem>
                       <SelectItem value="N">Out of Stock</SelectItem>
                     </SelectContent>
                   </Select>
                 ) : (
                   <div className="flex items-center">
                     {(() => {
                       const stockValue = currentData.stockavailable || currentData.stock || 'N';
                       const isInStock = stockValue === 'Y' || stockValue === 'Yes';
                       return isInStock ? (
                         <>
                           <Eye className="h-4 w-4 text-emerald-500 mr-2" />
                           <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">In Stock</Badge>
                         </>
                       ) : (
                         <>
                           <EyeOff className="h-4 w-4 text-destructive mr-2" />
                           <Badge variant="destructive">Out of Stock</Badge>
                         </>
                       );
                     })()}
                   </div>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   Live Status
                 </label>
                 {isEditing ? (
                   <Select
                     value={(() => {
                       const liveValue = currentData.liveStatus || 'N';
                       // Normalize to Y/N format
                       if (liveValue === 'Yes' || liveValue === 'Y') return 'Y';
                       if (liveValue === 'No' || liveValue === 'N') return 'N';
                       return 'N';
                     })()}
                     onValueChange={(value) => handleInputChange('liveStatus', value)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select live status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Y">Live</SelectItem>
                       <SelectItem value="N">Draft</SelectItem>
                     </SelectContent>
                   </Select>
                 ) : (
                   <div className="flex items-center">
                     {(() => {
                       const liveValue = currentData.liveStatus || 'N';
                       const isLive = liveValue === 'Y' || liveValue === 'Yes';
                       return isLive ? (
                         <>
                           <Eye className="h-4 w-4 text-emerald-500 mr-2" />
                           <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">Live</Badge>
                         </>
                       ) : (
                         <>
                           <EyeOff className="h-4 w-4 text-muted-foreground mr-2" />
                           <Badge variant="secondary">Draft</Badge>
                         </>
                       );
                     })()}
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Price (INR)
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={currentData.priceminINR || currentData.pricemin || ''}
                      onChange={(e) => handleInputChange('priceminINR', e.target.value)}
                    />
                  ) : (
                    <p className="text-foreground">₹{currentData.priceminINR || currentData.pricemin || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Price (INR)
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={currentData.pricemaxINR || currentData.pricemax || ''}
                      onChange={(e) => handleInputChange('pricemaxINR', e.target.value)}
                    />
                  ) : (
                    <p className="text-foreground">₹{currentData.pricemaxINR || currentData.pricemax || 'N/A'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lead Time
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={currentData.leadTime || ''}
                      onChange={(e) => handleInputChange('leadTime', e.target.value)}
                    />
                  ) : (
                    <p className="text-foreground">{currentData.leadTime || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={currentData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground">{currentData.description || 'No description available'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Brand</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {currentData.brand?.name || currentData.brand || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">SKU</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {currentData.partNumber || currentData.sku || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Price Range</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    ₹{currentData.priceminINR || currentData.pricemin || '0'} - ₹{currentData.pricemaxINR || currentData.pricemax || '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Lead Time</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {currentData.leadTime || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Image */}
          {currentData.image && (
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src={imageError ? FALLBACK_IMAGE_SRC : currentData.image}
                  alt={currentData.title || currentData.name}
                  className="w-full h-48 object-cover rounded-lg"
                  width={400}
                  height={192}
                  onError={() => setImageError(true)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <ProductDetailPageContent />
    </RoleProtectedRoute>
  );
}