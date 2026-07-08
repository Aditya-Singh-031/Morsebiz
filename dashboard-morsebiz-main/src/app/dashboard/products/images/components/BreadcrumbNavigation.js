import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, ArrowLeft, Slash } from 'lucide-react';

const BreadcrumbNavigation = ({ 
  currentView, 
  selectedBrand, 
  selectedFolder, 
  handleBackToBrands, 
  handleBackToFolders,
  folderStatus // New prop for folder status
}) => {
  if (currentView === 'brands') return null;

  return (
    <div className="mb-6">
      <nav className="flex items-center space-x-2 text-sm">
        {/* Back Button with Icon Only */}
        {currentView === 'folders' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToBrands}
            className="flex items-center text-muted-foreground hover:text-foreground p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {currentView === 'files' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToFolders}
            className="flex items-center text-muted-foreground hover:text-foreground p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Breadcrumb Path */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToBrands}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          Brands
        </Button>
        
        {selectedBrand && (
          <>
            <Slash className="h-4 w-4 text-muted-foreground" />
            {currentView === 'folders' ? (
              <span className="font-medium">{selectedBrand}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToFolders}
                className="text-muted-foreground hover:text-foreground"
              >
                {selectedBrand}
              </Button>
            )}
          </>
        )}
        
        {selectedFolder && currentView === 'files' && (
          <>
            <Slash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{selectedFolder}</span>
          </>
        )}
      </nav>
    </div>
  );
};

export default BreadcrumbNavigation;