'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { notFound } from 'next/navigation';

const RoleProtectedRoute = ({ children, allowedRoles = [], fallbackRoute = '/dashboard' }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect will be handled by middleware
    if (!isLoading && isAuthenticated && user) {
      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Use Next.js notFound() instead of showing Access Denied UI
        notFound();
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, fallbackRoute, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (middleware will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role - notFound() will be called in useEffect
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
};

export default RoleProtectedRoute;