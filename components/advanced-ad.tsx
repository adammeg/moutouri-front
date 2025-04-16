 "use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Sparkle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdsByPosition, trackAdView, trackAdClick } from '@/services/ads'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AdvancedAdProps {
  position: string
  variant?: 'banner' | 'card' | 'sidebar' | 'slim'
  className?: string
  maxAds?: number
  autoRotate?: boolean
  rotationInterval?: number
  showBadge?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function AdvancedAd({
  position,
  variant = 'card',
  className = "",
  maxAds = 1,
  autoRotate = true,
  rotationInterval = 5000, // 5 seconds
  showBadge = true,
  onLoad,
  onError,
}: AdvancedAdProps) {
  const [ads, setAds] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({})

  // Fetch ads for the specified position
  useEffect(() => {
    let isMounted = true
    
    const fetchAds = async () => {
      try {
        setLoading(true)
        console.log(`🎯 Fetching ads for position: ${position}`)
        const response = await getAdsByPosition(position)
        
        if (!isMounted) return
        
        if (response.success && response.ads?.length > 0) {
          console.log(`✅ Found ${response.ads.length} ads for position: ${position}`)
          setAds(response.ads.slice(0, maxAds))
          
          // Track impression for first visible ad
          if (response.ads[0]?._id) {
            trackAdView(response.ads[0]._id).catch(err => 
              console.warn('Failed to track initial ad view:', err)
            )
          }
          
          if (onLoad) onLoad()
        } else {
          console.log(`ℹ️ No ads found for position: ${position}`)
          setAds([])
          if (onError) onError()
        }
      } catch (err) {
        console.error(`❌ Error fetching ads for position ${position}:`, err)
        setError(`Failed to load ad content`)
        if (onError) onError()
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchAds()
    
    return () => {
      isMounted = false
    }
  }, [position, maxAds, onLoad, onError])

  // Auto-rotate ads
  useEffect(() => {
    if (!autoRotate || ads.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % ads.length
        
        // Track impression for the new ad
        if (ads[nextIndex]?._id) {
          trackAdView(ads[nextIndex]._id).catch(err => 
            console.warn('Failed to track ad rotation view:', err)
          )
        }
        
        return nextIndex
      })
    }, rotationInterval)
    
    return () => clearInterval(interval)
  }, [ads, autoRotate, rotationInterval])

  // Handle click tracking
  const handleAdClick = (adId: string) => {
    trackAdClick(adId).catch(err => 
      console.warn('Failed to track ad click:', err)
    )
  }

  // Handle image load success
  const handleImageLoad = (adId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [adId]: true
    }))
  }

  if (loading || ads.length === 0 || error) {
    return null
  }

  const currentAd = ads[currentIndex]
  const isImageLoaded = imagesLoaded[currentAd._id]

  // Render based on variant type
  const renderAdContent = () => {
    switch (variant) {
      case 'banner':
        return (
          <div className={`relative overflow-hidden rounded-lg w-full ${className}`}>
            <div className="relative aspect-[3/1] w-full">
              <Image
                src={currentAd.image}
                alt={currentAd.title}
                fill
                sizes="100vw"
                priority
                className={`object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(currentAd._id)}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 md:p-6">
                <h3 className="text-lg md:text-2xl font-bold text-white">{currentAd.title}</h3>
                <p className="text-sm md:text-base text-white/80 mt-1 line-clamp-2">{currentAd.description}</p>
                
                {currentAd.link && (
                  <div className="flex mt-3">
                    <span className="inline-flex items-center text-white font-medium text-sm rounded-full px-3 py-1 bg-primary/80 hover:bg-primary transition-colors">
                      En savoir plus <ExternalLink className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>
              
              {showBadge && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                        <Sparkle className="h-3 w-3" /> Sponsorisé
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Annonce publicitaire</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* Dots indicator for multiple ads */}
            {ads.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {ads.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => {
                      setCurrentIndex(idx)
                      if (ads[idx]._id) handleAdClick(ads[idx]._id)
                    }}
                    aria-label={`View ad ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'card':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`overflow-hidden ${className}`}>
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={currentAd.image}
                    alt={currentAd.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(currentAd._id)}
                  />
                  
                  {showBadge && (
                    <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 text-white border-0">
                      <Sparkle className="h-3 w-3" /> Sponsorisé
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{currentAd.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{currentAd.description}</p>
                  
                  {ads.length > 1 && (
                    <div className="flex justify-center mt-3 gap-1">
                      {ads.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            idx === currentIndex ? 'bg-primary' : 'bg-primary/30'
                          }`}
                          onClick={() => {
                            setCurrentIndex(idx)
                            if (ads[idx]._id) handleAdClick(ads[idx]._id)
                          }}
                          aria-label={`View ad ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )

      case 'sidebar':
        return (
          <div className={`rounded-lg overflow-hidden border ${className}`}>
            <div className="relative aspect-[1/2] w-full">
              <Image
                src={currentAd.image}
                alt={currentAd.title}
                fill
                sizes="(max-width: 1200px) 33vw, 300px"
                className={`object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(currentAd._id)}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4">
                <div>
                  {showBadge && (
                    <Badge variant="outline" className="bg-black/40 text-white border-0 mb-2">
                      Sponsorisé
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-white text-lg">{currentAd.title}</h3>
                  <p className="text-sm text-white/80 mt-1 line-clamp-3">{currentAd.description}</p>
                  
                  {currentAd.link && (
                    <div className="mt-3">
                      <span className="inline-flex items-center text-white/90 text-sm hover:text-white">
                        En savoir plus <ExternalLink className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {ads.length > 1 && (
              <div className="flex justify-center my-2 gap-1">
                {ads.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-primary' : 'bg-primary/30'
                    }`}
                    onClick={() => {
                      setCurrentIndex(idx)
                      if (ads[idx]._id) handleAdClick(ads[idx]._id)
                    }}
                    aria-label={`View ad ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'slim':
        return (
          <div className={`rounded-lg overflow-hidden bg-muted/20 ${className}`}>
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/3 aspect-[3/2] sm:aspect-square">
                <Image
                  src={currentAd.image}
                  alt={currentAd.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className={`object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(currentAd._id)}
                />
              </div>
              
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  {showBadge && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Info className="h-3 w-3" /> Contenu sponsorisé
                    </div>
                  )}
                  
                  <h3 className="font-medium line-clamp-1">{currentAd.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-3">{currentAd.description}</p>
                </div>
                
                {ads.length > 1 && (
                  <div className="flex mt-auto pt-2 gap-1">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-1 h-1 rounded-full transition-colors ${
                          idx === currentIndex ? 'bg-primary' : 'bg-primary/30'
                        }`}
                        onClick={() => {
                          setCurrentIndex(idx)
                          if (ads[idx]._id) handleAdClick(ads[idx]._id)
                        }}
                        aria-label={`View ad ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Wrap in link if ad has a destination
  if (currentAd.link) {
    return (
      <Link 
        href={currentAd.link} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => handleAdClick(currentAd._id)}
        className="block w-full"
      >
        {renderAdContent()}
      </Link>
    )
  }

  return renderAdContent()
}