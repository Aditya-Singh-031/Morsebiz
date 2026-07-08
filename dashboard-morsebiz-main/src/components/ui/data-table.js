'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Eye,
  Package,
  Tag,
  DollarSign,
  Globe,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export function DataTable({ data, title = "Validated Data", description = "Review all validated product data" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Format price display
  const formatPrice = (min, max, currency = 'USD') => {
    if (!min && !max) return 'N/A';
    if (min === max) return `${currency} ${min}`;
    return `${currency} ${min} - ${max}`;
  };

  // Format array display
  const formatArray = (arr, maxItems = 3) => {
    if (!arr || arr.length === 0) return 'None';
    const displayed = arr.slice(0, maxItems);
    const remaining = arr.length - maxItems;
    return (
      <div className="flex flex-wrap gap-1">
        {displayed.map((item, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {typeof item === 'object' ? item.name || item.title || item.slug : item}
          </Badge>
        ))}
        {remaining > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remaining} more
          </Badge>
        )}
      </div>
    );
  };

  // Product detail modal
  const ProductDetailModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-muted-foreground">Part Number: {product.partNumber}</p>
              </div>
              <Button variant="outline" onClick={onClose}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="font-medium">Brand:</label>
                    <p>{product.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium">Live Status:</label>
                    <Badge variant={product.liveStatus ? 'default' : 'secondary'}>
                      {product.liveStatus ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium">Dynamic Slug:</label>
                    <p className="font-mono text-sm">{product.dynamicSlug || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium">Country of Origin:</label>
                    <p>{product.countyofOrigin || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing & Stock
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="font-medium">Price Range:</label>
                    <p>{formatPrice(product.pricemin, product.pricemax, product.pricecurrency)}</p>
                  </div>
                  <div>
                    <label className="font-medium">Stock Available:</label>
                    <Badge variant={product.stockavailable ? 'default' : 'destructive'}>
                      {product.stockavailable ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium">Lead Time:</label>
                    <p>{product.leadTimevalue || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium">Conversion Rate:</label>
                    <p>{product.conversionRate || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Categories & Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="font-medium">Main Categories:</label>
                    {formatArray(product.categoriesMain)}
                  </div>
                  <div>
                    <label className="font-medium">Badges:</label>
                    {formatArray(product.badges)}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="font-medium">Images:</label>
                    {product.partsimages && product.partsimages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {product.partsimages.slice(0, 6).map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No images</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Descriptions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="font-medium">Short Description:</label>
                    <p className="text-sm">{product.shortDescription || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium">Full Description:</label>
                    <div className="space-y-2">
                      {product.productDetailsfullDescription ? (
                        Object.entries(product.productDetailsfullDescription).map(([lang, desc]) => (
                          <div key={lang} className="border rounded p-2">
                            <Badge variant="outline" className="mb-1">{lang.toUpperCase()}</Badge>
                            <p className="text-sm">{desc || 'N/A'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No descriptions available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Parts */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Related Parts & Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="font-medium">Alternate Parts:</label>
                    {formatArray(product.alternateparts, 5)}
                  </div>
                  <div>
                    <label className="font-medium">Compatible Vehicles:</label>
                    {formatArray(product.compatiblevehicles, 5)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part number, title, or brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
          <div className="text-sm text-muted-foreground">
            {filteredData.length} of {data.length} items
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 border-r">Part Number</th>
                  <th className="text-left p-3 border-r">Title</th>
                  <th className="text-left p-3 border-r">Brand</th>
                  <th className="text-left p-3 border-r">Price Range</th>
                  <th className="text-left p-3 border-r">Stock</th>
                  <th className="text-left p-3 border-r">Categories</th>
                  <th className="text-left p-3 border-r">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-3 border-r font-mono text-xs">{item.partNumber}</td>
                    <td className="p-3 border-r max-w-48 truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="p-3 border-r">{item.brand || 'N/A'}</td>
                    <td className="p-3 border-r">
                      {formatPrice(item.pricemin, item.pricemax, item.pricecurrency)}
                    </td>
                    <td className="p-3 border-r">
                      <Badge variant={item.stockavailable ? 'default' : 'destructive'} className="text-xs">
                        {item.stockavailable ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="p-3 border-r">
                      {formatArray(item.categoriesMain, 2)}
                    </td>
                    <td className="p-3 border-r">
                      <Badge variant={item.liveStatus ? 'default' : 'secondary'} className="text-xs">
                        {item.liveStatus ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Card>
  );
}