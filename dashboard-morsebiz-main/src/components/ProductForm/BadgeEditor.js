import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import Cookies from 'js-cookie';

const BadgeEditor = ({ badges = [], onChange }) => {
  // State for fetching badges from centralized collection
  const [availableBadges, setAvailableBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  
  // State for dropdown
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Ref for search input to maintain focus
  const searchInputRef = useRef(null);

  // Fetch available badges from centralized collection
  useEffect(() => {
    fetchAvailableBadges();
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  const fetchAvailableBadges = async () => {
    setLoadingBadges(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_BADGES), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAvailableBadges(result.data || []);
        console.log(`✅ Loaded ${result.data?.length || 0} badges from centralized collection`);
      } else {
        console.error('Failed to fetch badges:', result.message);
        setAvailableBadges([]);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast.error('Failed to load badges');
      setAvailableBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  };

  // Remove badge
  const removeBadge = (badgeSlug) => {
    const newBadges = badges.filter(slug => slug !== badgeSlug);
    onChange(newBadges);
    toast.success('Badge removed successfully');
  };

  // Get badge data from available badges by slug
  const getBadgeData = (badgeSlug) => {
    return availableBadges.find(badge => badge.slug === badgeSlug);
  };

  // Get badge icon URL
  const getBadgeIconUrl = (iconName) => {
    if (!iconName) return '';
    if (iconName.startsWith('http')) return iconName;
    return `${config.STORAGE_URL}/badges/${iconName}`;
  };

  // Get available badges for selection (show all badges)
  const getAvailableBadgesForSelection = () => {
    if (searchValue.trim()) {
      return availableBadges.filter(badge => 
        badge.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        badge.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    return availableBadges;
  };

  // Handle badge selection/deselection from dropdown
  const handleBadgeSelect = (badgeSlug) => {
    if (badges.includes(badgeSlug)) {
      // If already selected, remove it
      const newBadges = badges.filter(slug => slug !== badgeSlug);
      onChange(newBadges);
    } else {
      // If not selected, add it
      const newBadges = [...badges, badgeSlug];
      onChange(newBadges);
    }
    // Don't close dropdown, keep it open for multiple selections
    // setOpen(false); 
    // Don't clear search to maintain context
    // setSearchValue('');
  };

  // Get formatted display text for selected badges count
  const getSelectedBadgesText = () => {
    if (badges.length === 0) {
      return "Select badges...";
    }
    return `${badges.length} badge${badges.length > 1 ? 's' : ''} selected`;
  };

  return (
    <div className="space-y-4">
      {/* Badge Selection Dropdown */}
      <div className="space-y-2">
        <Label>Select Badges</Label>
        
        <div className="relative">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-md border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={loadingBadges}
              >
                {loadingBadges ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading badges...</span>
                  </div>
                ) : (
                  <span className="truncate">{getSelectedBadgesText()}</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-full rounded-md shadow-lg border" 
              align="start"
              onKeyDown={(e) => {
                // Prevent dropdown from handling keyboard navigation
                e.stopPropagation();
              }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50/50">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search badges..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70"
                  autoFocus
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    // Keep all keyboard events in the search input
                    e.stopPropagation();
                    // Prevent dropdown from closing on Escape
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setSearchValue('');
                    }
                  }}
                />
              </div>
              
              {/* Badge List */}
              <div 
                className="max-h-60 overflow-auto" 
                onMouseDown={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  // Prevent keyboard navigation from affecting search input
                  e.stopPropagation();
                }}
              >
                {getAvailableBadgesForSelection().length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    "No badges found."
                  </div>
                ) : (
                  getAvailableBadgesForSelection().map((badge) => {
                    const isSelected = badges.includes(badge.slug);
                    return (
                    <DropdownMenuItem
                      key={badge.slug}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBadgeSelect(badge.slug);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        // Prevent keyboard events from bubbling up
                        e.stopPropagation();
                      }}
                      className={`cursor-pointer p-2 ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {/* Badge Preview */}
                        <div 
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs flex-shrink-0"
                          style={{ 
                            backgroundColor: badge.color, 
                            color: badge.textColor 
                          }}
                        >
                          {badge.icon && (
                            <img 
                              src={getBadgeIconUrl(badge.icon)} 
                              alt=""
                              className="w-3 h-3"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span>{badge.label}</span>
                        </div>
                        
                        {/* Badge Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{badge.label}</div>
                          {badge.slug && (
                            <div className="text-xs text-muted-foreground truncate">
                              {badge.slug}
                            </div>
                          )}
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="flex-shrink-0 ml-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                    );
                  })
                )}
              </div>
              
              {/* Done Button */}
              <div className="p-2 border-t bg-gray-50/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  Done
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Current Selected Badges Display */}
      {badges.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Badges ({badges.length})</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
            {badges.map((badgeSlug, index) => {
              const badgeData = getBadgeData(badgeSlug);
              if (!badgeData) return null;
              
              return (
                <div key={index} className="relative group">
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded text-sm font-medium pr-6"
                    style={{ 
                      backgroundColor: badgeData.color, 
                      color: badgeData.textColor 
                    }}
                  >
                    {badgeData.icon && (
                      <img 
                        src={getBadgeIconUrl(badgeData.icon)} 
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{badgeData.label}</span>
                    
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeBadge(badgeData.slug)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
                      title={`Remove ${badgeData.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeEditor;