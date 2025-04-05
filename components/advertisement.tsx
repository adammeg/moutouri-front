"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { trackAdView, trackAdClick } from '@/services/ads'

interface AdvertisementProps {
  position: string
  className?: string
  fallbackText?: string
  maxHeight?: number
}

interface Ad {
  _id: string
  title: string
  description: string
  image: string
  link?: string
  position: string
}

export function Advertisement({ 
  position, 
  className = "", 
  fallbackText = "",
  maxHeight = 250
}: AdvertisementProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/ads/position/${position}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch advertisement')
        }
        
        const data = await response.json()
        
        if (data.success && data.ads?.length > 0) {
          // Select random ad from available ads
          const randomIndex = Math.floor(Math.random() * data.ads.length)
          setAd(data.ads[randomIndex])
          
          // Track impression
          if (data.ads[randomIndex]._id) {
            trackAdView(data.ads[randomIndex]._id)
          }
        } else {
          setAd(null)
        }
      } catch (error) {
        console.error('Error fetching ad:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [position])

  // Handle click on ad
  const handleAdClick = () => {
    if (ad?._id) {
      trackAdClick(ad._id)
    }
  }

  if (loading) {
    return (
      <div className={`bg-muted/20 rounded-lg animate-pulse ${className}`} 
           style={{ height: maxHeight }}>
      </div>
    )
  }

  if (error || !ad) {
    if (!fallbackText) return null
    
    return (
      <div className={`bg-muted/10 rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
           style={{ height: maxHeight }}>
        {fallbackText}
      </div>
    )
  }

  const AdContent = () => (
    <div className={`relative rounded-lg overflow-hidden ${className}`}
         style={{ maxHeight }}>
      <div className="relative aspect-[3/1] w-full">
        <Image 
          src={ad.image} 
          alt={ad.title}
          fill
          priority
          className="object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-medium text-lg md:text-xl">{ad.title}</h3>
          <p className="text-white/90 text-sm line-clamp-2 mt-1">{ad.description}</p>
          
          {ad.link && (
            <div className="flex items-center mt-2">
              <span className="text-white text-sm flex items-center">
                En savoir plus <ExternalLink className="ml-1 h-3 w-3" />
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded">
          Sponsorisé
        </div>
      </div>
    </div>
  )

  return ad.link ? (
    <Link href={ad.link} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
      <AdContent />
    </Link>
  ) : (
    <AdContent />
  )
} 