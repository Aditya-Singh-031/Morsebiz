import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = request.cookies.get('adminToken')?.value;
  const userCookie = request.cookies.get('adminUser')?.value;
  
  // Parse user data from cookie
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user has token but no user data, let the component handle check-auth
  if (token && !user && !isPublicRoute) {
    // Allow the request to proceed, the component will call check-auth
    return NextResponse.next();
  }

  // Role-based access control for dashboard routes (only if user data exists)
  if (token && user && user.role) {
    // Define role-based route permissions
    const rolePermissions = {
      'super-admin': ['*'], // Super admin has access to all routes
      'admin': [
        '/dashboard',
        '/dashboard/products',
        '/dashboard/products/add',
        '/dashboard/products/edit',
        '/dashboard/activity',
        '/dashboard/creators',
        '/dashboard/users',
        '/dashboard/upgrade-requests',
        '/dashboard/videos',
        '/dashboard/categories',
        '/dashboard/hashtags',
        '/dashboard/settings',
        '/dashboard/brands',
        '/dashboard/customer-enquiry',
        '/dashboard/dashboard-users',
        '/dashboard/website-settings',
        '/dashboard/website-settings/homepage-slider',
        '/dashboard/website-settings/homepage-slider/add',
        '/dashboard/website-settings/homepage-slider/edit'
      ],
      'manager': [
        '/dashboard/activity',
        '/dashboard/creators',
        '/dashboard/upgrade-requests',
        '/dashboard/videos',
        '/dashboard/categories',
        '/dashboard/hashtags'
      ],
      'editor': [
        '/dashboard/videos',
        '/dashboard/categories',
        '/dashboard/hashtags'
      ],
      'viewer': []
    };

    const userRole = user.role;
    const allowedRoutes = rolePermissions[userRole] || [];

    // Check if user has access to the current route
    if (!allowedRoutes.includes('*')) {
      const hasAccess = allowedRoutes.some(route => {
        // Exact match or starts with the route (for sub-routes)
        return pathname === route || pathname.startsWith(route + '/');
      });

      if (!hasAccess) {
        // Redirect to dashboard if user doesn't have access
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images from public folder)
     * - logo (static logo files from public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|logo).*)',
  ],
};