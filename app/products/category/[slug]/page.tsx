import { getCategoryBySlug } from "@/services/categories";
import { Metadata } from "next";

// Dynamic metadata generation for category pages
export async function generateMetadata({ params }: { params: { slug: string }}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  
  // Define keyword mapping for specific categories
  const categoryKeywords = {
    'motos': 'motos routières, roadsters, sportives, customs, trails, tourisme',
    'scooters': 'scooters 50cc, scooters 125cc, maxi-scooters, scooters électriques',
    'cross': 'motocross, enduro, tout-terrain, trial, supermotard',
    'pieces-detachees': 'pièces moteur, carénages, pneus moto, freins, filtres, transmission',
    'equipement': 'casques moto, blousons, gants, protection, bottes, accessoires pilote'
  };
  
  const keywords = categoryKeywords[params.slug as keyof typeof categoryKeywords] || 
    `${category?.name || ''} moto, ${category?.name || ''} scooter, ${category?.name || ''} pieces`;
  
  return {
    title: `${category?.name || 'Catégorie'} - Moutouri Marketplace Moto Tunisie`,
    description: `Explorez les meilleures offres de ${category?.name.toLowerCase() || 'produits'} sur Moutouri. Achat et vente de ${category?.name.toLowerCase() || 'motos et scooters'} en Tunisie, neufs et d'occasion.`,
    keywords: keywords,
  };
} 