import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', "logo-moutouri.ico"],
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.tn'}/sitemap.xml`,
  }
}