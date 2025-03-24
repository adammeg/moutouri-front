import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import SafeImage from '@/components/safe-image'
import { ReactNode } from 'react'

export interface ProductCardProps {
  product: any
  actions?: ReactNode
  children?: ReactNode
}

export function ProductCard({ product, actions, children }: ProductCardProps) {
  if (!product) return <></> 

  // Extract username nicely if it exists
  const sellerName = product.user?.username || 
                     product.user?.firstName || 
                     (product.user?.email ? product.user.email.split('@')[0] : '');

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <Link href={`/products/${product._id}`} className="relative overflow-hidden aspect-square">
        <SafeImage
          src={product.images?.[0] || "/placeholder-product.svg"}
          alt={product.title || "Product"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105"
          style={{ filter: 'none' }}
        />
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
      </Link>
      <CardContent className="flex-1 p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/products/${product._id}`} className="font-medium hover:underline">
            {product.title}
          </Link>
          {product.price && (
            <div className="text-right">
              <div className="font-bold text-primary">{formatPrice(product.price)}</div>
            </div>
          )}
        </div>
        {product.location && (
          <div className="text-sm text-muted-foreground mb-2">
            {product.location}
          </div>
        )}
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