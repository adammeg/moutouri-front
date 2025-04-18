'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export default function SEO({
  title = 'Moutouri - Achetez et vendez des motos et scooters en Tunisie',
  description = 'Moutouri est la première plateforme dédiée à l\'achat et la vente de motos, scooters et pièces détachées en Tunisie. Trouvez votre prochaine moto ou vendez la vôtre facilement.',
  canonical,
  ogImage = '/moutouri_logo.jpg',
  noIndex = false,
}: SEOProps) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moutouri.tn';
  
  // Fix: router is an object and can't be concatenated with a string
  const canonicalUrl = canonical 
    ? `${siteUrl}${canonical}` 
    : `${siteUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={
        ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`
      } />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Moutouri" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={
        ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`
      } />
    </Head>
  );
}