import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/services/categories";
import { getProductsByCategory } from "@/services/products";
import Breadcrumbs from "@/components/breadcrumbs";

// Metadata function
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Catégorie non trouvée - Moutouri',
      description: 'La catégorie que vous recherchez n\'existe pas ou a été déplacée.'
    };
  }
  
  // Define keyword mapping for specific categories
  const categoryKeywords: Record<string, string> = {
    'motos': 'motos routières, roadsters, sportives, customs, trails, tourisme',
    'scooters': 'scooters 50cc, scooters 125cc, maxi-scooters, scooters électriques',
    'cross': 'motocross, enduro, tout-terrain, trial, supermotard',
    'pieces-detachees': 'pièces moteur, carénages, pneus moto, freins, filtres, transmission',
    'equipement': 'casques moto, blousons, gants, protection, bottes, accessoires pilote'
  };
  
  const keywords = categoryKeywords[params.slug] || 
    `${category?.name || ''} moto, ${category?.name || ''} scooter, ${category?.name || ''} pieces`;
  
  return {
    title: `${category?.name || 'Catégorie'} - Moutouri Marketplace Moto Tunisie`,
    description: `Explorez les meilleures offres de ${category?.name.toLowerCase() || 'produits'} sur Moutouri. Achat et vente de ${category?.name.toLowerCase() || 'motos et scooters'} en Tunisie, neufs et d'occasion.`,
    keywords: keywords,
  };
}

// Page component 
export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }
  
  const productsResponse = await getProductsByCategory(category._id);
  const products = productsResponse.success ? productsResponse.products : [];
  
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Produits', href: '/products' },
    { label: category.name, href: `/products/category/${params.slug}`, current: true }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">
          {category.description || `Découvrez toutes les annonces dans la catégorie ${category.name}`}
        </p>
        {category.image && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img 
              src={category.image} 
              alt={`Catégorie ${category.name}`} 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </div>
      
      <Suspense fallback={<div className="text-center py-12"><p>Chargement des produits...</p></div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Product card content would go here */}
              <div className="p-4">
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-muted-foreground mt-1">{product.price} TND</p>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Aucune annonce disponible</h3>
            <p className="text-muted-foreground mt-2">
              Il n'y a actuellement aucune annonce dans cette catégorie.
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
} 