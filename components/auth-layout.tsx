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
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    
    // Only redirect after client-side hydration
    if (isMounted && !isLoading) {
      if (!isAuthenticated) {
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      } else if (adminOnly && !isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, adminOnly, redirectTo, isMounted])

  // While checking authentication
  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  // If authenticated and has proper permissions, render children with dashboard layout
  if (isAuthenticated && (!adminOnly || isAdmin)) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Otherwise render nothing (while redirecting)
  return null
} 