import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  hasNextPage, 
  hasPrevPage, 
  startIndex, 
  endIndex, 
  className = '' 
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display (max 5 numbers with dots)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage, endPage;
      
      if (currentPage <= 3) {
        // Near beginning: 1, 2, 3, 4, ..., last
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1, ..., last-3, last-2, last-1, last
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., last
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
      
      // Add dots if there's a gap after first page
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      // Add dots if there's a gap before last page
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page (if not already added)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Pagination controls - Full width on small devices */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Previous button - Left */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="h-8 px-3 flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        
        {/* Page numbers - Center */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {pageNumbers.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`h-8 min-w-8 px-2 ${
                page === '...' ? 'cursor-default hover:bg-transparent' : ''
              }`}
            >
              {page}
            </Button>
          ))}
        </div>
        
        {/* Next button - Right */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="h-8 px-3 flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;