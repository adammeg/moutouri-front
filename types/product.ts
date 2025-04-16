// Define the Product type to fix TypeScript errors
export interface Product {
    _id: string
    title: string
    description: string
    price: number
    discountPrice?: number
    images: string[]
    category?: {
      _id: string
      name: string
      slug: string
    }
    condition?: string
    features?: string[]
    location?: string
    seller: {
      _id: string
      firstName: string
      lastName: string
      image?: string
    }
    status: 'active' | 'pending' | 'sold' | 'inactive'
    isFeatured?: boolean
    isVerified?: boolean
    createdAt: string
    updatedAt: string
    year?: number
    brand?: string
    model?: string
    mileage?: number
    engineSize?: string
    color?: string
    id?: string // Some APIs might return id instead of _id
  }