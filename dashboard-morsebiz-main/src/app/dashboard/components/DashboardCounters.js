'use client';

import { useState, useEffect } from 'react';
import ProductService from '@/services/productService';
import { 
  Package, 
  CheckCircle,
  XCircle,
  Building2, 
  Grid3X3, 
  MessageSquareQuote,
  UserCog,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CounterCard from '@/components/counter/CounterCard';

/**
 * DashboardCounters Component
 * Displays all dashboard statistics counters with data fetching
 */
const DashboardCounters = () => {
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await ProductService.getProductStats();
      setProductStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Refresh function for manual refresh - doesn't show skeleton, just refreshes numbers
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const stats = await ProductService.getProductStats();
      setProductStats(stats);
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simple skeleton component
  const SimpleCounterSkeleton = () => (
    <div className="bg-muted rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-muted-foreground/20 rounded w-1/2"></div>
    </div>
  );

  // Dashboard stats cards configuration
  const dashboardStatsCards = productStats ? [
    {
      title: 'Total Products',
      value: productStats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Active Products',
      value: productStats.activeProducts,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Inactive Products',
      value: productStats.inactiveProducts,
      icon: <XCircle className="w-6 h-6" />,
      color: 'red'
    },
    {
      title: 'Total Brands',
      value: productStats.totalBrands,
      icon: <Building2 className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Categories',
      value: productStats.totalCategories,
      icon: <Grid3X3 className="w-6 h-6" />,
      color: 'indigo'
    },
    {
      title: 'Customer Enquiry',
      value: productStats.customerEnquiry,
      icon: <MessageSquareQuote className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      title: 'Dashboard Users',
      value: productStats.dashboardUsers,
      icon: <UserCog className="w-6 h-6" />,
      color: 'gray'
    },
    {
      title: 'Recently Added',
      value: productStats.recentProducts,
      icon: <Package className="w-6 h-6" />,
      color: 'pink'
    }
  ] : [];

  // If there's an error, don't render anything at all
  if (error) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard Statistics</h2>
        {!loading && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground hidden md:block">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Counter Cards Grid - 4 items per line on large devices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          // Show simple skeleton cards while loading (only on first load)
          Array.from({ length: 8 }).map((_, index) => (
            <SimpleCounterSkeleton key={index} />
          ))
        ) : productStats ? (
          // Show actual data when loaded - numbers will animate on refresh
          dashboardStatsCards.map((stat, index) => (
            <CounterCard
              key={`${stat.title}-${isRefreshing ? 'refresh' : 'load'}`} // Force re-render on refresh for animation
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              duration={isRefreshing ? 1000 : 1500 + (index * 200)} // Faster animation on refresh
              useFormatter={false} // Show full numbers instead of K/L format
            />
          ))
        ) : null}
      </div>
    </div>
  );
};

export default DashboardCounters;