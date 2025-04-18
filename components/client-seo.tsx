  'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export default function ClientSEO({
  title = 'Moutouri - Achetez et vendez des motos et scooters en Tunisie',
  description = 'Moutouri est la première plateforme dédiée à l\'achat et la vente de motos, scooters et pièces détachées en Tunisie. Trouvez votre prochaine moto ou vendez la vôtre facilement.',
  canonical,
  ogImage = '/moutouri_logo.jpg',
  noIndex = false,
}: SEOProps) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.tn';

  useEffect(() => {
    // Client-side metadata changes
    if (document) {
      document.title = title;
      
      // Find and update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
      
      // Similar approach for other meta tags
      // ...
    }
  }, [title, description]);

  return null; // This component doesn't render anything visible
}