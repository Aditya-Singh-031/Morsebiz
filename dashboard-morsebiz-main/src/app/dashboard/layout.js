'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { initializeAuth, checkAuth, logoutAdmin } from '@/store/slices/authSlice';
import { useGlobalWebSocket } from '@/hooks/useGlobalWebSocket';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Package, 
  UserCog, 
  Menu, 
  User, 
  ChevronDown, 
  LogOut,
  Building2,
  FolderOpen,
  Users,
  ChevronRight,
  Settings,
  Image as ImageIcon,
  Star,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const allMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Products',
      icon: Package,
      href: '/dashboard/products',
      roles: ['super-admin', 'admin'],
      submenu: [
        {
          name: 'All Products',
          href: '/dashboard/products'
        },
        {
          name: 'Import Products',
          href: '/dashboard/products/import'
        },
        {
          name: 'Product Images',
          href: '/dashboard/products/images'
        },
        {
          name: 'Product Translation',
          href: '/dashboard/products/translation'
        }
      ]
    },
    {
      name: 'Brands',
      icon: Building2,
      href: '/dashboard/brands',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Categories',
      icon: FolderOpen,
      href: '/dashboard/categories',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Badges',
      icon: Tag,
      href: '/dashboard/badges',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Morsebiz Exclusive',
      icon: Star,
      href: '/dashboard/morsebiz-exclusive',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Customer Enquiry',
      icon: Users,
      href: '/dashboard/customer-enquiry',
      roles: ['super-admin', 'admin']
    },
    {
      name: 'Dashboard Users',
      icon: UserCog,
      href: '/dashboard/dashboard-users',
      roles: ['super-admin']
    },
    {
      name: 'Website Settings',
      icon: Settings,
      href: '/dashboard/website-settings',
      roles: ['super-admin', 'admin'],
      submenu: [
        {
          name: 'Homepage Slider',
          href: '/dashboard/website-settings/homepage-slider'
        }
      ]
    }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          onTouchStart={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <div className="flex items-center justify-center w-full">
              <Image 
                src="/logo/morsebiz-logo.svg" 
                alt="Logo" 
                width={60}
                height={60}
                className="h-12 w-auto cursor-pointer dark:invert dark:brightness-0 dark:contrast-100"
              />
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.name];
              
              return (
                <div key={item.name}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      if (hasSubmenu) {
                        toggleSubmenu(item.name);
                      } else {
                        router.push(item.href);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {hasSubmenu && (
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-auto transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    )}
                  </Button>
                  
                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Button
                            key={subItem.name}
                            variant={isSubActive ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm",
                              isSubActive && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => {
                              router.push(subItem.href);
                              setIsOpen(false);
                            }}
                          >
                            {subItem.name}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuClick, connectionStatus }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutAdmin());
      // Use replace to prevent back button issues
      router.replace('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border px-4 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden mr-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className={cn(
                  "w-8 h-8 ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
                  connectionStatus?.isConnected ? "ring-green-500" : "ring-red-500"
                )}>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username || 'admin'}</p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {user?.role || 'Administrator'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  // Initialize global WebSocket connection
  const { connectionStatus, error: wsError } = useGlobalWebSocket();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Monitor WebSocket connection status silently
  }, [connectionStatus, wsError]);

  // Call check-auth if authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      dispatch(checkAuth());
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated
    // Add a small delay to prevent race conditions during page reload
    if (!isLoading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        router.replace('/');
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Show loading spinner while authentication is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-64">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded animate-pulse"></div>
            </div>
            <p className="text-muted-foreground">Loading admin panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} connectionStatus={connectionStatus} />
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}