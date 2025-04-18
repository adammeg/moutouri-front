"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { IMAGE_BASE_URL } from '@/config/config'

// Define the Category type to fix TypeScript errors
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryCardProps {
  category: Category
  className?: string
}

export function CategoryCard({ category, className = '' }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Construct proper image URL with base path and categories subfolder
  const getImageUrl = (imagePath: string) => {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise construct the path with proper structure
    return `${IMAGE_BASE_URL}categories/${imagePath}`;
  };
  
  return (
    <Link href={`/products?category=${category._id}`} className={`block ${className}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          )}
          
          {!imageError && category.image ? (
            <Image
              src={getImageUrl(category.image)}
              alt={category.name}
              fill
              className={`object-cover transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                console.error(`Failed to load image for category: ${category.name}`, category.image);
                setImageError(true);
                setImageLoading(false);
              }}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
              {category.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{category.name}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}