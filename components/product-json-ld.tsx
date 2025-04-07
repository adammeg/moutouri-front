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
    brand: getBrandFromTitle(product.title),
    vehicleEngine: {
      '@type': 'EngineSpecification',
      engineDisplacement: product.cylinder ? `${product.cylinder} cc` : undefined,
    },
    vehicleConfiguration: product.condition,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: product.kilometrage || 0,
      unitCode: 'KMT'
    },
    modelDate: product.year ? `${product.year}` : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'TND',
      itemCondition: `https://schema.org/${mapConditionToSchema(product.condition)}`,
      availability: 'https://schema.org/InStock',
      url: url
    },
    category: product.category ? product.category.name : undefined,
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

// Helper to extract brand from product title
function getBrandFromTitle(title: string): string | undefined {
  const commonBrands = [
    'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 
    'Vespa', 'Piaggio', 'SYM', 'Kymco', 'Aprilia', 'KTM', 
    'Harley-Davidson', 'Royal Enfield', 'Triumph', 'MBK'
  ];
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return undefined;
} 