"use client"

import { useEffect, useState } from 'react'
import ProductCard, { AdCard } from '@/components/product-card'
import { getAdsByPosition } from '@/services/ads'
import { Product } from '@/types/product'
import { AD_POSITIONS } from '@/config/ad-positions'

interface ProductListingWithAdsProps {
  products: Product[]
  adFrequency?: number
  maxAds?: number
}

export default function ProductListingWithAds({
  products,
  adFrequency = 6,
  maxAds = 2
}: ProductListingWithAdsProps) {
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch ads on component mount
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await getAdsByPosition(AD_POSITIONS.PRODUCT_IN_LIST)
        
        if (response.success && response.ads.length > 0) {
          setAds(response.ads)
        } else {
          console.log('No ads available for product listing')
          setAds([])
        }
      } catch (error) {
        console.error('Error fetching ads:', error)
        setAds([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAds()
  }, [])
  
  // Generate ad positions
  const getAdPositions = () => {
    if (!ads.length) return []
    
    const positions: number[] = []
    const productCount = products.length
    
    // Limit the number of ads based on available ads and maxAds
    const numAds = Math.min(ads.length, maxAds, Math.floor(productCount / adFrequency))
    
    // Create semi-random but visually appealing positions
    for (let i = 0; i < numAds; i++) {
      // Position ads evenly throughout the listing, with some randomness
      // First ad appears around position 3-5, second around 9-11, etc.
      const basePosition = (i + 1) * adFrequency
      const variation = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      const position = Math.min(productCount - 1, Math.max(2, basePosition + variation))
      
      positions.push(position)
    }
    
    return positions
  }
  
  // Render products and ads
  const renderItems = () => {
    if (isLoading || !ads.length) {
      // If ads aren't loaded yet, just show products
      return products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))
    }
    
    const adPositions = getAdPositions()
    const result: React.ReactNode[] = []
    
    // Iterate through products and insert ads at specified positions
    products.forEach((product, index) => {
      // Add the product
      result.push(
        <ProductCard key={product._id} product={product} />
      )
      
      // Check if we should insert an ad after this product
      if (adPositions.includes(index)) {
        // Get a different ad for each position
        const adIndex = adPositions.indexOf(index) % ads.length
        const ad = ads[adIndex]
        
        // Add the ad
        result.push(
          <AdCard
            key={`ad-${index}-${ad._id}`}
            imageUrl={ad.image}
            title={ad.title}
            price={ad.price ? `${ad.price} DT` : undefined}
            linkUrl={ad.link || '#'}
          />
        )
      }
    })
    
    return result
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {renderItems()}
    </div>
  )
} 