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
  
  // Add brand pages for popular motorcycle brands
  const popularBrands = [
    'honda', 'yamaha', 'suzuki', 'kawasaki', 'ktm', 'ducati', 'bmw', 
    'vespa', 'piaggio', 'sym', 'kymco', 'aprilia', 'harley-davidson'
  ];
  
  const brandPages = popularBrands.map(brand => ({
    url: `${baseUrl}/products?q=${brand}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));
  
  // REMOVED: API calls that were causing timeouts
  // Instead of fetching from API at build time, we'll use static data
  
  return [...staticPages, ...brandPages] as MetadataRoute.Sitemap;
}