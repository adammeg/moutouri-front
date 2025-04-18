"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Clock, MapPin, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  className?: string
  isAd?: boolean
  adImage?: string
  adTitle?: string
  adPrice?: string
  adLink?: string
}

export default function ProductCard({
  product,
  className = '',
  isAd = false,
  adImage = '',
  adTitle = '',
  adPrice = '',
  adLink = ''
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const imageUrl = isAd ? adImage : (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg')
  const title = isAd ? adTitle : product.title
  const price = isAd ? adPrice : `${product.price.toLocaleString()} DT`
  const linkHref = isAd ? adLink : `/products/${product._id}`
  
  const showDetails = !isAd

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <Link href={linkHref} className={cn('block group', className)}>
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-md relative">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {!isAd && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full backdrop-blur-sm hover:bg-white transition-colors z-10"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('h-5 w-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
            </button>
          )}
          
          {isAd && (
            <Badge className="absolute top-2 right-2 bg-primary/80 text-white px-2 py-0.5 text-xs">
              Sponsorisé
            </Badge>
          )}
          
          {showDetails && product.isVerified && (
            <Badge className="absolute bottom-2 left-2 bg-green-500/90 text-white flex items-center gap-1 px-2 py-0.5">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs">Vérifié</span>
            </Badge>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-base line-clamp-1 mb-1">{title}</h3>
          <p className="text-primary font-semibold">{price}</p>
          
          {showDetails && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {product.createdAt ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: fr }) : 'Récemment'}
                </span>
              </div>
              
              {product.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{product.location}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {showDetails && (
          <CardFooter className="p-3 pt-0">
            <Button variant="secondary" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
              Voir l'annonce
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}

export function AdCard({ 
  imageUrl,
  title = 'Annonce sponsorisée',
  price = '',
  linkUrl = '#',
  className = ''
}: {
  imageUrl: string;
  title?: string;
  price?: string;
  linkUrl?: string;
  className?: string;
}) {
  return (
    <ProductCard
      product={{} as Product}
      isAd={true}
      adImage={imageUrl}
      adTitle={title}
      adPrice={price}
      adLink={linkUrl}
      className={className}
    />
  );
}