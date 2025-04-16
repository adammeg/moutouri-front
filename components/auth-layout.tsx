"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'

interface AuthLayoutProps {
  children: React.ReactNode
  adminOnly?: boolean
  redirectTo?: string
}

export default function AuthLayout({ 
  children, 
  adminOnly = false,
  redirectTo = '/login'
}: AuthLayoutProps) {
  const [isClient, setIsClient] = useState(false)
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
  const router = useRouter()

  // Mark client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle auth-dependent redirects
  useEffect(() => {
    if (isClient && !isLoading) {
      console.log("🔒 Auth Layout - Auth state:", { 
        isAuthenticated, 
        isAdmin, 
        isLoading,
        adminOnly,
        path: window.location.pathname
      });
      
      if (!isAuthenticated) {
        const currentPath = encodeURIComponent(window.location.pathname);
        console.log(`⤴️ Redirecting to ${redirectTo}?redirectTo=${currentPath}`);
        router.push(`${redirectTo}?redirectTo=${currentPath}`);
        return;
      }
      
      if (adminOnly && !isAdmin) {
        console.log("⤴️ Not admin, redirecting to dashboard");
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, adminOnly, redirectTo, isClient])

  // Only show loading on client-side to prevent hydration mismatch
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  // If not authenticated or doesn't have proper role, render nothing while redirecting
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-muted-foreground">Redirection...</span>
      </div>
    );
  }

  // If authenticated with proper permissions, render content with dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>
} 