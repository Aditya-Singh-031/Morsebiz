'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

export default function ProductsPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  loadedItems = 0,
  onPageChange,
  onItemsPerPageChange,
  loading = false
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design with useEffect to avoid hydration issues
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate start and end items based on current page and items per page
  const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange?.(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    if (!loading) {
      onItemsPerPageChange?.(parseInt(value));
    }
  };

  // Generate page numbers to show with responsive design
  const getPageNumbers = () => {
    const pages = [];
    // Responsive max visible pages: 3 for mobile, 5 for larger screens
    const maxVisiblePages = isMobile ? 3 : 7; // Increased to 7 for better visibility
    
    // Debug logging for pagination issues
    if (currentPage > 200) {
      console.log('Pagination Debug:', { currentPage, totalPages, maxVisiblePages });
    }
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis logic
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      // Ensure we always show the correct number of visible pages
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-between w-full px-0 sm:px-2 py-2 bg-background">
        <div className="text-sm text-muted-foreground">
          No items to display
        </div>
      </div>
    );
  }

  // Format numbers without K/L abbreviation
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full px-1 sm:px-2 py-2 bg-background">
      {/* Left side - Items info (Compact for mobile) */}
      <div className="flex items-center flex-shrink-0">
        <div className="text-xs text-muted-foreground">
          <span className="hidden sm:inline">{formatNumber(startItem)}-{formatNumber(endItem)} of {formatNumber(totalItems)}</span>
          <span className="sm:hidden">{formatNumber(endItem)}/{formatNumber(totalItems)}</span>
        </div>
      </div>

      {/* Center/Right - Pagination controls in single line */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-end">
        {/* First page (only on larger screens) */}
        {!isMobile && currentPage > 5 && totalPages > 10 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={loading}
              title="First page"
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
          </>
        )}

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          title="Previous page"
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Page numbers - Ultra compact for mobile */}
        <div className="flex items-center gap-0.5">
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-1 py-1 text-xs text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-xs min-w-[28px] sm:min-w-[32px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          title="Next page"
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* Last page (only on larger screens) */}
        {!isMobile && currentPage < totalPages - 4 && totalPages > 10 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={loading}
              title="Last page"
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}