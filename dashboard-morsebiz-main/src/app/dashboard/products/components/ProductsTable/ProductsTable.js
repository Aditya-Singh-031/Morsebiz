'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsTable({ 
  products = [], 
  loading = false,
  onView,
  onEdit,
  onDelete,
  currentPage = 1,
  itemsPerPage = 50,
  deleteButtonText = 'Delete'
}) {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState({});

  const handleView = (product) => {
    if (onView) {
      onView(product);
    } else {
      // URL encode the slug to handle special characters
      const encodedSlug = encodeURIComponent(product.slug || product.partNumber);
      router.push(`/dashboard/products/${encodedSlug}`);
    }
  };

  const handleEdit = (product) => {
    if (onEdit) {
      onEdit(product);
    } else {
      // Use slug for editing to match API endpoint
      // URL encode the slug to handle special characters
      const identifier = encodeURIComponent(product.slug || product.partNumber);
      router.push(`/dashboard/products/edit/${identifier}`);
    }
  };

  const handleDelete = (product) => {
    if (onDelete) {
      onDelete(product);
    }
  };

  // Safe value getter with N/A fallback
  const safeValue = (value, fallback = 'N/A') => {
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
      return fallback;
    }
    if (Array.isArray(value) && value.length === 0) {
      return fallback;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return fallback;
    }
    return value;
  };

  // Helper function to format arrays with +N more indicator
  const formatArray = (arr, maxItems = 2) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return 'N/A';
    
    try {
      // Handle string arrays that might be JSON
      const parsedArr = typeof arr === 'string' ? JSON.parse(arr) : arr;
      if (!Array.isArray(parsedArr) || parsedArr.length === 0) return 'N/A';
      
      const displayItems = parsedArr.slice(0, maxItems);
      const remainingCount = parsedArr.length - maxItems;
      
      let result = displayItems.map(item => {
        if (typeof item === 'object' && item !== null) {
          return item.name || item.title || Object.values(item)[0] || 'Item';
        }
        return item;
      }).join(', ');
      
      if (remainingCount > 0) {
        result += ` +${remainingCount} more`;
      }
      
      return result;
    } catch (e) {
      return safeValue(arr);
    }
  };

  // Helper function to format objects
  const formatObject = (obj) => {
    if (!obj || typeof obj !== 'object') return 'N/A';
    
    try {
      const parsedObj = typeof obj === 'string' ? JSON.parse(obj) : obj;
      if (typeof parsedObj === 'object' && parsedObj !== null) {
        // For brand objects, show name
        if (parsedObj.name) return parsedObj.name;
        // For other objects, show first meaningful value
        const values = Object.values(parsedObj).filter(v => v && v !== '');
        return values.length > 0 ? values[0] : 'N/A';
      }
      return 'N/A';
    } catch (e) {
      return safeValue(obj);
    }
  };

  const formatPrice = (priceRange) => {
    return safeValue(priceRange);
  };

  const formatBrandNames = (brandNames) => {
    if (!brandNames) return 'N/A';
    if (typeof brandNames === 'string') return brandNames;
    if (Array.isArray(brandNames)) {
      return formatArray(brandNames, 2);
    }
    return formatObject(brandNames);
  };

  const formatCategories = (categories) => {
    if (!categories) return 'N/A';
    if (typeof categories === 'string') return categories;
    if (Array.isArray(categories)) {
      return formatArray(categories, 2);
    }
    return formatObject(categories);
  };

  // Helper function to format language object
  const formatLanguages = (langObj) => {
    if (!langObj || typeof langObj !== 'object') return 'N/A';
    const languages = Object.keys(langObj);
    if (languages.length === 0) return 'N/A';
    
    const displayLangs = languages.slice(0, 3);
    const remaining = languages.length - 3;
    
    let result = displayLangs.join(', ');
    if (remaining > 0) {
      result += ` +${remaining} more`;
    }
    
    return result;
  };

  const getDescription = (product) => {
    let description = '';
    
    // Try to get English description from lang object first
    if (product.lang?.en?.productDetailsfullDescription) {
      description = product.lang.en.productDetailsfullDescription;
    }
    // Try to get English description from productDetails
    else if (product.productDetails?.en?.productDetailsfullDescription) {
      description = product.productDetails.en.productDetailsfullDescription;
    }
    // Try shortDescription (assuming it's in English)
    else if (product.shortDescription) {
      description = product.shortDescription;
    }
    // Fallback to description field (assuming it's in English)
    else if (product.description) {
      description = product.description;
    }
    // Final fallback
    else {
      description = 'No description available';
    }
    
    // Truncate description if it's too long (limit to 30 characters)
    if (description.length > 30) {
      return description.substring(0, 30) + '...';
    }
    
    return description;
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-2">
        <div className="overflow-x-auto">
          <Table className="min-h-96 w-full">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
          <TableRow>
            <TableHead className="w-12 min-w-12 text-xs">SL</TableHead>
            <TableHead className="w-16 min-w-16 text-xs">Image</TableHead>
            <TableHead className="w-24 min-w-24 text-xs">Part No.</TableHead>
            <TableHead className="w-48 min-w-48 text-xs">Title & Description</TableHead>
            <TableHead className="w-20 min-w-20 text-xs">Brand</TableHead>
            <TableHead className="w-16 min-w-16 text-xs">Status</TableHead>
            <TableHead className="w-16 min-w-16 text-xs">Stock</TableHead>
            <TableHead className="w-20 min-w-20 text-xs">Lead Time</TableHead>
            <TableHead className="w-20 min-w-20 text-xs">Country</TableHead>
            <TableHead className="w-24 min-w-24 text-xs">Price</TableHead>
            <TableHead className="w-16 min-w-16 text-xs">Currency</TableHead>
            <TableHead className="w-20 min-w-20 text-xs">Badges</TableHead>
            <TableHead className="w-24 min-w-24 text-xs">Categories</TableHead>
            <TableHead className="w-28 min-w-28 text-xs">Vehicles</TableHead>
            <TableHead className="w-24 min-w-24 text-xs">Alt Parts</TableHead>
            <TableHead className="w-20 min-w-20 text-xs">Slug</TableHead>
            <TableHead className="text-right w-20 min-w-20 text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-3 w-6" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-40" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-3 w-12" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-12" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-24" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
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
        <Table className="w-full min-w-[800px] text-xs sm:text-sm">
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="text-xs w-8 sm:w-12 px-1 sm:px-2">SL</TableHead>
              <TableHead className="text-xs w-12 sm:w-16 px-1 sm:px-2">Image</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Part No.</TableHead>
              <TableHead className="text-xs w-32 sm:w-48 px-1 sm:px-2">Title & Description</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Brand</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Live Status</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Stock</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Lead Time</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Country</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Price</TableHead>
              <TableHead className="text-xs w-12 sm:w-16 px-1 sm:px-2">Currency</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Badges</TableHead>
              <TableHead className="text-xs w-20 sm:w-28 px-1 sm:px-2">Vehicles</TableHead>
              <TableHead className="text-xs w-20 sm:w-24 px-1 sm:px-2">Alt Parts</TableHead>
              <TableHead className="text-xs w-16 sm:w-20 px-1 sm:px-2">Slug</TableHead>
              <TableHead className="text-right text-xs w-16 sm:w-20 px-1 sm:px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">
                No products found. Try adjusting your filters or search terms.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => {
              // Get image URL directly from partsimages array or fallback fields
              const getImageUrl = (product) => {
                // Helper function to validate URL
                const isValidUrl = (url) => {
                  if (!url || typeof url !== 'string') return false;
                  try {
                    new URL(url);
                    return true;
                  } catch {
                    return false;
                  }
                };
                
                // Priority 1: Check partsimages array
                if (Array.isArray(product.partsimages) && product.partsimages.length > 0) {
                  const firstImage = product.partsimages[0];
                  if (typeof firstImage === 'string' && firstImage.trim() !== '' && firstImage.toLowerCase() !== 'null') {
                    // Clean the URL - remove extra spaces, backticks, and quotes
                    const cleanUrl = firstImage.trim().replace(/[`"']/g, '').trim();
                    if (isValidUrl(cleanUrl)) {
                      return cleanUrl;
                    }
                  }
                }
                
                // Priority 2: Check legacy imageUrl field
                if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '' && product.imageUrl.toLowerCase() !== 'null') {
                  const cleanUrl = product.imageUrl.trim().replace(/[`"']/g, '').trim();
                  if (isValidUrl(cleanUrl)) {
                    return cleanUrl;
                  }
                }
                
                // Priority 3: Check image field
                if (product.image && typeof product.image === 'string' && product.image.trim() !== '' && product.image.toLowerCase() !== 'null') {
                  const cleanUrl = product.image.trim().replace(/[`"']/g, '').trim();
                  if (isValidUrl(cleanUrl)) {
                    return cleanUrl;
                  }
                }
                
                return null;
              };
              
              const imageUrl = getImageUrl(product);
              const description = getDescription(product);
              const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
              
              return (
                <TableRow key={product.partNumber} className="hover:bg-muted/50">
                  {/* Serial Number */}
                  <TableCell className="text-center font-medium px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate">
                      {serialNumber}
                    </div>
                  </TableCell>

                  {/* Product Image */}
                  <TableCell className="px-1 sm:px-2">
                    <Link href={`/dashboard/products/edit/${encodeURIComponent(product.slug || product.partNumber)}`} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                        <Image
                          src={imageErrors[product.partNumber] ? '/images/no-image.png' : (imageUrl || '/images/no-image.png')}
                          alt={imageUrl ? `Product image for ${safeValue(product.partNumber, 'Product')}` : 'No image available'}
                          fill
                          sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 48px"
                          className="object-cover"
                          loading="lazy"
                          onError={() => setImageErrors(prev => ({ ...prev, [product.partNumber]: true }))}
                        />
                      </div>
                    </Link>
                  </TableCell>

                  {/* Part Number */}
                  <TableCell className="font-medium px-1 sm:px-2">
                    <Link href={`/dashboard/products/edit/${encodeURIComponent(product.slug || product.partNumber)}`} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer truncate" title={safeValue(product.partNumber)}>
                        {safeValue(product.partNumber)}
                      </div>
                    </Link>
                  </TableCell>

                  {/* Title & Description Combined */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="space-y-0.5 sm:space-y-1">
                      <Link href={`/dashboard/products/edit/${encodeURIComponent(product.slug || product.partNumber)}`} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="text-xs sm:text-sm font-medium hover:underline cursor-pointer line-clamp-1" title={safeValue(product.title)}>
                          {safeValue(product.title)}
                        </div>
                      </Link>
                      <div className="text-xs text-muted-foreground line-clamp-1" title={description}>
                        {description}
                      </div>
                    </div>
                  </TableCell>

                  {/* Brand */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={formatBrandNames(product.brandNames || (Array.isArray(product.brand) ? product.brand.map(b => b.name).join(', ') : product.brand))}>
                      {formatBrandNames(product.brandNames || (Array.isArray(product.brand) ? product.brand.map(b => b.name).join(', ') : product.brand))}
                    </div>
                  </TableCell>

                  {/* Live Status */}
                  <TableCell className="px-1 sm:px-2">
                    <Badge 
                      variant={safeValue(product.liveStatus) === 'Y' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        safeValue(product.liveStatus) === 'Y' 
                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
                      }`}
                    >
                      {safeValue(product.liveStatus) === 'Y' ? 'Live' : 'Draft'}
                    </Badge>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex items-center gap-1">
                      {(() => {
                        // Use stockavailable field from API data
                        const stockAvailable = product.stockavailable || 'N';
                        const stockQuantity = safeValue(product.stock || product.stockQuantity);
                        
                        let badgeColor = '';
                        let badgeText = 'In Stock';
                        
                        // If stockavailable is 'N' or 'No', show Out of Stock
                        if (stockAvailable === 'N' || stockAvailable === 'No') {
                          badgeColor = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
                          badgeText = 'Out of Stock';
                        } else if (stockAvailable === 'Y' || stockAvailable === 'Yes') {
                          // If we have a numeric stock quantity, show it
                          const stockNum = parseInt(stockQuantity);
                          if (!isNaN(stockNum) && stockNum > 0) {
                            if (stockNum <= 5) {
                              badgeColor = 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
                              badgeText = `Low (${stockNum})`;
                            } else if (stockNum <= 20) {
                              badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
                              badgeText = `${stockNum}`;
                            } else {
                              badgeColor = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
                              badgeText = `${stockNum}`;
                            }
                          } else {
                            // Stock available but no quantity specified
                            badgeColor = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
                            badgeText = 'In Stock';
                          }
                        } else {
                          // Unknown stock status
                          badgeColor = 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
                          badgeText = 'Unknown';
                        }
                        
                        return (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${badgeColor}`}
                            title={`Stock Available: ${stockAvailable}, Quantity: ${stockQuantity}`}
                          >
                            {badgeText}
                          </Badge>
                        );
                      })()}
                    </div>
                  </TableCell>

                  {/* Lead Time */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={safeValue(product.leadTime || product.leadTimevalue)}>
                      {safeValue(product.leadTime || product.leadTimevalue)}
                    </div>
                  </TableCell>

                  {/* Country of Origin */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={safeValue(product.countyofOrigin)}>
                      {safeValue(product.countyofOrigin)}
                    </div>
                  </TableCell>

                  {/* Price Range */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={safeValue(product.priceRange || (product.priceminINR ? `${safeValue(product.priceminINR)} - ${safeValue(product.pricemaxINR)}` : ''))}>
                      {safeValue(product.priceRange || (product.priceminINR ? `${safeValue(product.priceminINR)} - ${safeValue(product.pricemaxINR)}` : ''))}
                    </div>
                  </TableCell>

                  {/* Currency */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={safeValue(product.pricecurrency || 'INR')}>
                      {safeValue(product.pricecurrency || 'INR')}
                    </div>
                  </TableCell>

                  {/* Badges */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex flex-wrap gap-0.5 sm:gap-1">
                      {(() => {
                        const badges = product.badges || product.badge;
                        if (!badges || !Array.isArray(badges) || badges.length === 0) {
                          return <Badge variant="outline" className="text-xs">N/A</Badge>;
                        }
                        
                        try {
                          const parsedBadges = typeof badges === 'string' ? JSON.parse(badges) : badges;
                          if (!Array.isArray(parsedBadges) || parsedBadges.length === 0) {
                            return <Badge variant="outline" className="text-xs">N/A</Badge>;
                          }
                          
                          const maxVisible = 1;
                          const visibleBadges = parsedBadges.slice(0, maxVisible);
                          const remainingCount = parsedBadges.length - maxVisible;
                          
                          return (
                            <>
                              {visibleBadges.map((badge, index) => {
                                const badgeText = typeof badge === 'object' && badge !== null 
                                  ? (badge.name || badge.title || Object.values(badge)[0] || 'Badge')
                                  : badge;
                                return (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs truncate max-w-16 sm:max-w-20"
                                  >
                                    {badgeText}
                                  </Badge>
                                );
                              })}
                              {remainingCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-muted">
                                  +{remainingCount}
                                </Badge>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <Badge variant="outline" className="text-xs truncate max-w-16 sm:max-w-20">{safeValue(badges)}</Badge>;
                        }
                      })()} 
                    </div>
                  </TableCell>



                  {/* Compatible Vehicles */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex flex-wrap gap-0.5 sm:gap-1">
                      {(() => {
                        const vehicles = product.compatiblevehicles || product.compatibleVehicles;
                        if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
                          return <Badge variant="outline" className="text-xs">N/A</Badge>;
                        }
                        
                        try {
                          const parsedVehicles = typeof vehicles === 'string' ? JSON.parse(vehicles) : vehicles;
                          if (!Array.isArray(parsedVehicles) || parsedVehicles.length === 0) {
                            return <Badge variant="outline" className="text-xs">N/A</Badge>;
                          }
                          
                          const maxVisible = 1; // Reduced for mobile
                          const visibleVehicles = parsedVehicles.slice(0, maxVisible);
                          const remainingCount = parsedVehicles.length - maxVisible;
                          
                          return (
                            <>
                              {visibleVehicles.map((vehicle, index) => {
                                const vehicleText = typeof vehicle === 'object' && vehicle !== null 
                                  ? (vehicle.name || vehicle.title || Object.values(vehicle)[0] || 'Vehicle')
                                  : vehicle;
                                return (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs truncate max-w-16 sm:max-w-20"
                                  >
                                    {vehicleText}
                                  </Badge>
                                );
                              })}
                              {remainingCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-muted">
                                  +{remainingCount}
                                </Badge>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <Badge variant="outline" className="text-xs truncate max-w-16 sm:max-w-20">{safeValue(vehicles)}</Badge>;
                        }
                      })()}
                    </div>
                  </TableCell>

                  {/* Alternate Parts */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="flex flex-wrap gap-0.5 sm:gap-1">
                      {(() => {
                        const alternateParts = product.alternateparts || product.alternateParts;
                        if (!alternateParts || !Array.isArray(alternateParts) || alternateParts.length === 0) {
                          return <Badge variant="outline" className="text-xs">N/A</Badge>;
                        }
                        
                        try {
                          const parsedParts = typeof alternateParts === 'string' ? JSON.parse(alternateParts) : alternateParts;
                          if (!Array.isArray(parsedParts) || parsedParts.length === 0) {
                            return <Badge variant="outline" className="text-xs">N/A</Badge>;
                          }
                          
                          const maxVisible = 1; // Reduced for mobile
                          const visibleParts = parsedParts.slice(0, maxVisible);
                          const remainingCount = parsedParts.length - maxVisible;
                          
                          return (
                            <>
                              {visibleParts.map((part, index) => {
                                const partText = typeof part === 'object' && part !== null 
                                  ? (part.name || part.title || part.partNumber || Object.values(part)[0] || 'Part')
                                  : part;
                                return (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs truncate max-w-16 sm:max-w-20"
                                  >
                                    {partText}
                                  </Badge>
                                );
                              })}
                              {remainingCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-muted">
                                  +{remainingCount}
                                </Badge>
                              )}
                            </>
                          );
                        } catch (e) {
                          return <Badge variant="outline" className="text-xs truncate max-w-16 sm:max-w-20">{safeValue(alternateParts)}</Badge>;
                        }
                      })()}
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="px-1 sm:px-2">
                    <div className="text-xs sm:text-sm truncate" title={safeValue(product.dynamicSlug || product.slug)}>
                      {safeValue(product.dynamicSlug || product.slug)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right px-1 sm:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(product)}
                        title="View Product"
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Link href={`/dashboard/products/edit/${encodeURIComponent(product.slug || product.partNumber)}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit Product"
                          className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-6 w-6 p-0 sm:h-8 sm:w-8"
                        onClick={() => handleDelete(product)}
                        title={deleteButtonText}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}