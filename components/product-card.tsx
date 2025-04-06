import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Heart, Eye, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import SafeImage from '@/components/safe-image'
import { ReactNode } from 'react'
import Image from 'next/image'

export interface ProductCardProps {
  product: any
  actions?: ReactNode
  children?: ReactNode
}

export function ProductCard({ product, actions, children }: ProductCardProps) {
  if (!product) return <></> 

  // Extract username nicely if it exists
  const sellerName = product.publisher?.username || 
                     product.publisher?.firstName || 
                     (product.publisher?.email ? product.publisher.email.split('@')[0] : '');

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.title}
            className="object-cover transition-transform hover:scale-105"
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
          />
        </Link>
        {product.condition && (
          <Badge 
            variant={product.condition === 'New' ? "default" : "outline"}
            className="absolute top-2 left-2 z-10 bg-background/80"
          >
            {product.condition}
          </Badge>
        )}
        {product.featured && (
          <Badge variant="default" className="absolute top-2 right-2 z-10">
            En vedette
          </Badge>
        )}
      </div>
      <CardContent className="p-3 flex-grow flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-1 text-sm sm:text-base">
          <Link href={`/products/${product._id}`}>
            {product.title}
          </Link>
        </h3>
        <p className="text-primary font-bold mt-auto text-base sm:text-lg">
          {product.price?.toLocaleString()} DT
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{product.location || 'Location N/A'}</span>
        </div>
        {sellerName && (
          <div className="text-sm text-muted-foreground mb-2">
            de {sellerName}
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description || "No description available"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {actions || (
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button variant="outline" size="sm" className="w-10 px-0">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}