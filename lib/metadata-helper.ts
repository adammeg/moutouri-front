import { Metadata } from 'next';

type MetadataProps = {
  title?: string;
  description?: string;
  noIndex?: boolean;
  images?: string[];
};

export function generatePageMetadata({
  title = 'Moutouri - Achetez et vendez des motos et scooters en Tunisie',
  description = 'Moutouri est la première plateforme dédiée à l\'achat et la vente de motos, scooters et pièces détachées en Tunisie.',
  noIndex = false,
  images = ['/logo-moutouri.png'],
}: MetadataProps): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
} 