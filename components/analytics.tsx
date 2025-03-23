"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Track page views
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Replace this with your actual analytics code
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      })
    }
  }, [pathname, searchParams])
  
  return null
} 