import { getProducts } from "@/services/products"
import { getCategories } from "@/services/categories"
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.tn'
  const currentDate = new Date()
  
  // Static pages
  const staticPages = [
    { route: '' },
    { route: '/products' },
    { route: '/dashboard' },
    { route: '/products/new' },
    { route: '/login' },
    { route: '/register' },
    { route: '/about' },
    { route: '/contact' },
    { route: '/faq' },
  ].map(({ route }) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: (route === '' || route === '/products') ? 'daily' : 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))
  
  // Fetch products
  let productPages: any[] = []
  try {
    const productsResponse = await getProducts({})
    
    if (productsResponse?.success && Array.isArray(productsResponse.products)) {
      productPages = productsResponse.products
        .filter((product: any) => product && product._id)
        .map((product: any) => ({
          url: `${baseUrl}/products/${product._id}`,
          lastModified: new Date(product.updatedAt || product.createdAt || currentDate),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }))
    }
  } catch (error) {
    console.error('Error generating sitemap for products:', error)
  }
  
  // Fetch categories
  let categoryPages: any[] = []
  try {
    const categoriesResponse = await getCategories()
    
    if (categoriesResponse?.success && Array.isArray(categoriesResponse.categories)) {
      categoryPages = categoriesResponse.categories
        .filter((category: any) => category && category._id)
        .map((category: any) => ({
          url: `${baseUrl}/products?category=${category._id}`,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
    }
  } catch (error) {
    console.error('Error generating sitemap for categories:', error)
  }
  
  // Add brand pages for popular motorcycle brands
  let brandPages: any[] = []
  try {
    const popularBrands = [
      'honda', 'yamaha', 'suzuki', 'kawasaki', 'ktm', 'ducati', 'bmw', 
      'vespa', 'piaggio', 'sym', 'kymco', 'aprilia', 'harley-davidson'
    ]
    
    brandPages = popularBrands.map(brand => ({
      url: `${baseUrl}/products?q=${brand}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error('Error generating sitemap for brands:', error)
  }
  
  return [...staticPages, ...productPages, ...categoryPages, ...brandPages]
}