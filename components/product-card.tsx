"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.png'
  
  return (
    <Link href={`/products/${product._id}`} className={`block ${className}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md product-card">
        <div className="relative aspect-[4/3] bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          )}
          
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className={`object-cover transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Status badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">
                Mis en avant
              </Badge>
            )}
            
            {product.isVerified && (
              <Badge className="bg-green-500/90 hover:bg-green-500 text-white">
                Vérifié
              </Badge>
            )}
            
            {product.status === 'sold' && (
              <Badge className="bg-red-500/90 hover:bg-red-500 text-white">
                Vendu
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-base sm:text-lg line-clamp-1">{product.title}</h3>
          <p className="text-primary font-bold mt-1">
            {product.price.toLocaleString()} DT
            
            {product.discountPrice && (
              <span className="ml-2 text-muted-foreground line-through text-sm">
                {product.discountPrice.toLocaleString()} DT
              </span>
            )}
          </p>
          
          <div className="flex items-center gap-1 mt-2">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(product.createdAt), { 
                locale: fr, 
                addSuffix: true 
              })}
            </p>
            
            {product.location && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">{product.location}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}