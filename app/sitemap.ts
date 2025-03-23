import { getProducts } from "@/services/products"
import { getCategories } from "@/services/categories"
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.tn'
  
  // Static pages
  const staticPages = [
    '',
    '/products',
    '/dashboard',
    '/products/new',
    '/login',
    '/register',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1.0 : 0.8,
  }))
  
  // Fetch dynamic products
  let productPages: { url: string; lastModified: Date; changeFrequency: 'daily'; priority: number }[] = []
  try {
    const productsResponse = await getProducts({})
    
    // Make sure we have a valid response with products array
    if (productsResponse?.success && Array.isArray(productsResponse.products)) {
      productPages = productsResponse.products
        .filter((product: any) => product && product._id) // Filter out any invalid products
        .map((product: any) => ({
          url: `${baseUrl}/products/${product._id}`,
          lastModified: new Date(product.updatedAt || product.createdAt || new Date()),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }))
    } else {
      console.log('No products found or invalid response structure:', productsResponse)
    }
  } catch (error) {
    console.error('Error generating sitemap for products:', error)
  }
  
  // Fetch categories
  let categoryPages: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
  try {
    const categoriesResponse = await getCategories()
    
    // Make sure we have a valid response with categories array
    if (categoriesResponse?.success && Array.isArray(categoriesResponse.categories)) {
      categoryPages = categoriesResponse.categories
        .filter((category: any) => category && category._id) // Filter out any invalid categories
        .map((category: any) => ({
          url: `${baseUrl}/products?category=${category._id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
    } else {
      console.log('No categories found or invalid response structure:', categoriesResponse)
    }
  } catch (error) {
    console.error('Error generating sitemap for categories:', error)
  }
  
  return [...staticPages, ...productPages, ...categoryPages]
}