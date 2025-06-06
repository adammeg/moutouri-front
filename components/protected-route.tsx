"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowUnauthenticated?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false,
  allowUnauthenticated = false
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  
  // Consider the user authenticated if the user object exists
  const isAuthenticated = !!user;

  useEffect(() => {
    console.log("🛡️ Protected route check:", { 
      isAuthenticated, 
      isAdmin, 
      isLoading,
      adminOnly,
      allowUnauthenticated
    });
    
    // Only redirect when we're sure that authentication has been checked
    if (!isLoading) {
      if (!isAuthenticated && !allowUnauthenticated) {
        console.log("⚠️ Not authenticated, redirecting to login");
        // Use window.location.href instead of router.push for a full page reload
        window.location.href = '/login';
      } else if (adminOnly && !isAdmin) {
        console.log("⚠️ Not admin, redirecting to dashboard");
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, adminOnly, allowUnauthenticated]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // Don't render children if not authenticated or not admin for admin routes
  if ((!isAuthenticated && !allowUnauthenticated) || (adminOnly && !isAdmin)) {
    return null;
  }

  // User is authenticated or allowUnauthenticated is true, render children
  return <>{children}</>;
} 