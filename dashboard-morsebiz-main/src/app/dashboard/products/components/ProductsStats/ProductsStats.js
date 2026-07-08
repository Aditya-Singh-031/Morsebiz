'use client';

import { Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsStats({ 
  stats = {}, 
  loading = false 
}) {
  const {
    totalProducts = 0,
    activeProducts = 0,
    inactiveProducts = 0,
    lowStockProducts = 0,
    outOfStockProducts = 0,
    totalBrands = 0,
    totalCategories = 0,
    averagePrice = 0
  } = stats;

  const statsCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      description: 'All products in inventory',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: CheckCircle,
      description: 'Currently available',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Low Stock',
      value: lowStockProducts,
      icon: AlertCircle,
      description: 'Need restocking',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts,
      icon: AlertCircle,
      description: 'Currently unavailable',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stat.value)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Additional stats row */}
      {(totalBrands > 0 || totalCategories > 0 || averagePrice > 0) && (
        <>
          {totalBrands > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Brands
                </CardTitle>
                <div className="p-2 rounded-full bg-purple-50">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(totalBrands)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique brands
                </p>
              </CardContent>
            </Card>
          )}

          {totalCategories > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Categories
                </CardTitle>
                <div className="p-2 rounded-full bg-indigo-50">
                  <Package className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(totalCategories)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Product categories
                </p>
              </CardContent>
            </Card>
          )}

          {averagePrice > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Price
                </CardTitle>
                <div className="p-2 rounded-full bg-emerald-50">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(averagePrice)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average product price
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}