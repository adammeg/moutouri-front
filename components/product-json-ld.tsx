export interface ProductJsonLdProps {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    year?: number;
    kilometrage?: number;
    cylinder?: string;
    color?: string;
    location?: string;
    category?: {
      _id: string;
      name: string;
    };
    createdAt?: string;
  };
  url: string;
}

export function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images && product.images.length > 0 ? product.images : [],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'TND',
      itemCondition: `https://schema.org/${mapConditionToSchema(product.condition)}`,
      availability: 'https://schema.org/InStock',
      url: url
    },
    ...(product.year && { productionDate: `${product.year}` }),
    ...(product.color && { color: product.color }),
    ...(product.category && { category: product.category.name }),
    ...(product.kilometrage && { 
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'kilometrage',
        value: `${product.kilometrage} km`
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Helper function to map your condition values to Schema.org values
function mapConditionToSchema(condition: string): string {
  const conditionMap: Record<string, string> = {
    'new': 'NewCondition',
    'like-new': 'UsedCondition',
    'excellent': 'UsedCondition',
    'good': 'UsedCondition',
    'fair': 'UsedCondition',
    'salvage': 'DamagedCondition'
  };
  
  return conditionMap[condition] || 'UsedCondition';
} 