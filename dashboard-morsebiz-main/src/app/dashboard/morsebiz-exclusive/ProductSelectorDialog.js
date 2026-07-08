'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import config from '@/config/config';
import Cookies from 'js-cookie';

const ProductSelectorDialog = ({ 
  isOpen, 
  onClose, 
  category, 
  categoryProducts, 
  productsLoading,
  onAddProducts, 
  onRemoveProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Search products
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setSearching(true);
      const queryParams = new URLSearchParams({
        search: searchTerm,
        limit: '20'
      });

      const response = await fetch(`${config.API_BASE_URL}/api/dashboard/morsebiz-exclusive/products/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookies.get('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
      } else {
        toast.error('Failed to search products');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Error searching products');
    } finally {
      setSearching(false);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      await onAddProducts(selectedProducts);
      setSelectedProducts([]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding products:', error);
    }
  };

  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  const getBrandName = (product) => {
    if (product.brands && Array.isArray(product.brands) && product.brands.length > 0) {
      if (typeof product.brands[0] === 'object') {
        return product.brands[0].name || '';
      }
      return product.brands[0];
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Manage Products - {category?.name}
          </DialogTitle>
          <DialogDescription>
            Add existing products from your database or remove products from this category.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">
              Existing Products ({categoryProducts.length})
            </TabsTrigger>
            <TabsTrigger value="add">Add New Products</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="flex-1 overflow-y-auto mt-4">
            {productsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground mt-2">Loading products...</p>
              </div>
            ) : categoryProducts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No products in this category yet. Add some from the "Add New Products" tab.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {categoryProducts.map((product) => (
                  <Card key={product._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getProductImage(product) ? (
                            <img 
                              src={getProductImage(product)} 
                              alt={product.title || product.partNumber}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {product.title || product.partNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Part: {product.partNumber}
                              {getBrandName(product) && ` | ${getBrandName(product)}`}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search Section */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search by part number, title, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Selected Count */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedProducts.length} product(s) selected
                </span>
                <Button size="sm" onClick={handleAddSelected}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected
                </Button>
              </div>
            )}

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {searchTerm ? 'No products found. Try a different search term.' : 'Search for products to add to this category.'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <Card key={product._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={() => handleProductSelection(product._id)}
                          />
                          
                          {getProductImage(product) ? (
                            <img 
                              src={getProductImage(product)} 
                              alt={product.title || product.partNumber}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {product.title || product.partNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Part: {product.partNumber}
                              {getBrandName(product) && ` | ${getBrandName(product)}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectorDialog;
