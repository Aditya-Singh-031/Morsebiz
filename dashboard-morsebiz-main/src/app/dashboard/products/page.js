'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { initializeAuth } from '@/store/slices/authSlice';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import ProductService from '@/services/productService';
import config from '@/config/config';

// Import separated components
import ProductsHeader from './components/ProductsHeader/ProductsHeader';
import ProductsFilters from './components/ProductsFilters/ProductsFilters';
import FilterBadges from './components/FilterBadges/FilterBadges';
import ProductsTable from './components/ProductsTable/ProductsTable';
import ProductsPagination from './components/ProductsPagination/ProductsPagination';


export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  // State management
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalModels: 0
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 50
  });

  const [filters, setFilters] = useState({
        search: '',
        brand: '',
        category: '',
        country: '',
        stockavailable: '',
        liveStatus: '',
        stock: ''
    });

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize auth on component mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Parse filters from URL parameters
  const parseFiltersFromURL = useCallback(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      brand: searchParams.get('brand') || searchParams.get('brands') || '',
      category: searchParams.get('category') || '',
      country: searchParams.get('country') || '',
      stockavailable: searchParams.get('stockavailable') || '',
      liveStatus: searchParams.get('liveStatus') || '',
      stock: searchParams.get('stock') || ''
    };
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters, page = 1) => {
    const params = new URLSearchParams();
    
    // Add filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    // Add page if not first page
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    // Update URL without page reload
    const newURL = params.toString() ? `?${params.toString()}` : '/dashboard/products';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Initialize filters from URL on component mount
  useEffect(() => {
    parseFiltersFromURL();
  }, [parseFiltersFromURL]);

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pagination.limit,
      ...filters
    };

    // Debug logging for high page numbers
    if (currentPage > 200) {
      console.log('Building query params:', { currentPage, limit: pagination.limit, filters });
    }

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }, [currentPage, pagination.limit, filters]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildQueryParams();
      const response = await ProductService.getAllProducts(params);
      
      if (response.success) {
        // Handle the case where data is directly an array
        const productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setProducts(productsData);
        
        // Set pagination from API response - prioritize response.pagination
        if (response.pagination) {
          console.log('Setting pagination from API response:', response.pagination);
          setPagination({
            current: response.pagination.current || currentPage,
            total: response.pagination.total || 1,
            limit: response.pagination.limit || 50,
            totalItems: response.pagination.totalItems || 0
          });
        } else if (response.data.pagination) {
          console.log('Setting pagination from response.data.pagination:', response.data.pagination);
          setPagination({
            current: response.data.pagination.current || currentPage,
            total: response.data.pagination.total || 1,
            limit: response.data.pagination.limit || 50,
            totalItems: response.data.pagination.totalItems || 0
          });
        } else {
          // Fallback calculation
          const totalItems = response.data.totalItems || productsData.length;
          const limit = 50;
          setPagination({ 
            current: currentPage, 
            total: Math.ceil(totalItems / limit), 
            limit: limit,
            totalItems: totalItems 
          });
        }
        
        // Update stats
        setStats({
          totalProducts: response.pagination?.totalItems || response.data.totalItems || response.data.pagination?.totalItems || productsData.length || 0,
          totalBrands: response.data.stats?.totalBrands || 0,
          totalCategories: response.data.stats?.totalCategories || 0,
          totalModels: response.data.stats?.totalModels || 0
        });
      } else {
        console.error('API response unsuccessful:', response);
        // Reset products if API call fails
        setProducts([]);
        setPagination({
          current: 1,
          total: 1,
          limit: 50,
          totalItems: 0
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Reset products on error
      setProducts([]);
      setPagination({
        current: 1,
        total: 1,
        limit: 50,
        totalItems: 0
      });
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [brandsResponse, categoriesResponse, countriesResponse] = await Promise.all([
        ProductService.getFilterBrands(),
        ProductService.getFilterCategories(),
        ProductService.getFilterCountries()
      ]);

        if (brandsResponse.success) setBrands(brandsResponse.data || []);
        if (categoriesResponse.success) setCategories(categoriesResponse.data || []);
        if (countriesResponse.success) setCountries(countriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [fetchProducts, fetchFilterOptions]);

  // Re-fetch products when currentPage changes
  useEffect(() => {
    if (currentPage > 1) {
      console.log('Page changed to:', currentPage, 'Fetching products...');
      fetchProducts();
    }
  }, [currentPage, fetchProducts]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters
    };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateURL(updatedFilters, 1); // Update URL with new filters
  }, [filters, updateURL]);

  // Handle search


  // Handle filters change (alias for handleFilterChange)
  const handleFiltersChange = useCallback((newFilters) => {
    handleFilterChange(newFilters);
  }, [handleFilterChange]);


  // Handle product actions
  const handleEditProduct = useCallback((productId) => {
    router.push(`/dashboard/products/edit/${encodeURIComponent(productId)}`);
  }, [router]);

  const handleDeleteProduct = useCallback(async (product) => {
    // Use native JavaScript confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.partNumber}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await ProductService.deleteProduct(product.partNumber);
      
      // Show success message
      alert('Product deleted successfully!');
      
      // Refresh the products list
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      // Show error message
      alert(`Error deleting product: ${error.message}`);
    }
  }, [fetchProducts]);

  const handleViewProduct = useCallback((product) => {
    // Create URL in format: FRONTEND_URL/en/slug
    const productSlug = product.slug || product.partNumber;
    const viewUrl = `${config.FRONTEND_URL}/en/${productSlug}`;
    
    // Open in new tab
    window.open(viewUrl, '_blank');
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      brand: '',
      category: '',
      model: '',
      country: '',
      stockavailable: '',
      liveStatus: '',
      stock: ''
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    updateURL(clearedFilters, 1); // Update URL to clear filters
  }, [updateURL]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    updateURL(filters, page); // Update URL with new page
    // Smooth scroll to top after page change
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }, [filters, updateURL]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit
    }));
    setCurrentPage(1); // Reset to first page when limit changes
    updateURL(filters, 1); // Update URL when items per page changes
  }, [filters, updateURL]);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="px-0 space-y-6">
        {/* Header */}
        <ProductsHeader 
          onAddProduct={() => router.push('/dashboard/products/add')}
          searchValue={filters.search}
          onSearchChange={(value) => handleFiltersChange({ search: value })}
          title="Products Management"
          mobileTitle="Products"
          filtersComponent={
            <ProductsFilters
              filters={filters}
              onFilterChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              brands={brands}
              categories={categories}
              countries={countries}
            />
          }
        />

        {/* Filter Badges */}
        <FilterBadges 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Products Table */}
        <ProductsTable 
          products={products}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onView={handleViewProduct}
        />
      </div>

        {/* Sticky Pagination at bottom */}
        {!loading && (pagination.total > 1 || pagination.totalItems > 0) && (
          <div className="sticky bottom-0 bg-background z-20 w-full">
            <div className="w-full py-2">
              <ProductsPagination
                currentPage={pagination.current}
                totalPages={pagination.total}
                itemsPerPage={pagination.limit}
                totalItems={pagination.totalItems}
                loadedItems={products.length}   
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </RoleProtectedRoute>
  );
}