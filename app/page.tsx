import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Award, MapPin, ChevronRight, TrendingUp, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductSearch } from "@/components/product-search";
import { ProductCard } from "@/components/product-card";
import { Advertisement } from "@/components/advertisement";
import { getLatestProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import PopularSearchTerms from "@/components/popular-search-terms";
import SEOContentSection from "@/components/seo-content-section";
import FAQSchema from "@/components/faq-schema";
import SchemaMarkup from "@/components/schema-markup";

export default async function HomePage() {
  // Fetch latest products
  const productsResponse = await getLatestProducts(8);
  const latestProducts = productsResponse.success ? productsResponse.products : [];
  
  // Fetch categories
  const categoriesResponse = await getCategories();
  const categories = categoriesResponse.success ? categoriesResponse.categories : [];
  
  // Featured brands - hardcoded for now
  const featuredBrands = [
    { name: "Honda", image: "/brands/honda.webp", slug: "honda" },
    { name: "Yamaha", image: "/brands/yamaha.webp", slug: "yamaha" },
    { name: "Vespa", image: "/brands/vespa.webp", slug: "vespa" },
    { name: "Suzuki", image: "/brands/suzuki.webp", slug: "suzuki" },
    { name: "BMW", image: "/brands/bmw.webp", slug: "bmw" },
    { name: "Kawasaki", image: "/brands/kawasaki.webp", slug: "kawasaki" },
  ];
  
  const topCities = [
    "Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul", "Monastir", "Kairouan", "Gabès", "Ariana"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Schema markup for SEO */}
      <SchemaMarkup />
      <FAQSchema />
      
      {/* Hero section with search */}
      <section className="bg-gradient-to-r from-primary to-primary-dark relative">
        <div className="container px-4 py-12 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              La référence du deux-roues en Tunisie
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mb-8">
              Trouvez la moto, le scooter ou les pièces que vous cherchez parmi des milliers d'annonces
            </p>
            
            {/* Search component */}
            <div className="w-full max-w-3xl">
              <ProductSearch className="bg-white shadow-lg rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Wave shape divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white text-white overflow-hidden">
          <svg 
            className="absolute bottom-0 w-full h-16" 
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,50 C150,100 350,0 500,50 C650,100 800,30 1000,80 C1200,30 1320,100 1440,30 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Featured categories */}
      <section className="py-12 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Catégories populaires</h2>
            <Link href="/products" className="text-primary flex items-center hover:underline">
              Toutes les catégories <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category:any) => (
              <Link 
                key={category._id} 
                href={`/products?category=${category._id}`}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:border-primary transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-20 w-20 mb-3 relative">
                      <Image 
                        src={category.image || "/placeholder.svg"} 
                        alt={category.name}
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        height={80}
                        width={80}
                      />
                    </div>
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <Badge variant="outline" className="mt-2">
                      Voir
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Advertisement banner */}
      <section className="container px-4 mx-auto py-8">
        <Advertisement position="home-hero" maxHeight={250} />
      </section>
      
      {/* Latest listings */}
      <section className="py-12 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Annonces récentes</h2>
            </div>
            <Link href="/products?sort=newest" className="text-primary flex items-center hover:underline">
              Voir tout <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.map((product:any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          <div className="flex justify-center mt-10">
            <Button asChild size="lg">
              <Link href="/products/new">
                Déposer une annonce
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured brands */}
      <section className="py-12 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Marques populaires</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredBrands.map((brand) => (
              <Link 
                key={brand.slug} 
                href={`/products?q=${brand.slug}`}
                className="group"
              >
                <Card className="overflow-hidden border hover:border-primary transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-16 w-40 mb-3 relative flex items-center justify-center">
                      <Image 
                        src={brand.image} 
                        alt={brand.name}
                        className="object-contain group-hover:scale-110 transition-transform duration-300 max-h-16"
                        height={64}
                        width={160}
                      />
                    </div>
                    <h3 className="font-medium">{brand.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Browse by location */}
      <section className="py-12 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="flex items-center mb-8">
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Explorer par région</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topCities.map((city) => (
              <Link 
                key={city} 
                href={`/products?location=${city}`}
                className="bg-card hover:bg-primary/5 transition-colors rounded-lg border px-4 py-3 flex items-center justify-between"
              >
                <span>{city}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Advertisement middle */}
      <section className="container px-4 mx-auto py-8">
        <Advertisement position="home-middle" maxHeight={200} />
      </section>
      
      {/* Popular searches */}
      <PopularSearchTerms />
      
      {/* Why use Moutouri */}
      <section className="py-12 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Pourquoi choisir Moutouri ?</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-card rounded-lg p-6 border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Le plus grand choix</h3>
              <p className="text-muted-foreground">Des milliers d'annonces de motos, scooters et pièces détachées partout en Tunisie.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité et confiance</h3>
              <p className="text-muted-foreground">Annonces vérifiées et vendeurs évalués pour des transactions en toute sécurité.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% gratuit</h3>
              <p className="text-muted-foreground">Dépôt et consultation d'annonces entièrement gratuits pour les particuliers.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-10">
            <Button asChild size="lg">
              <Link href="/register">
                Rejoindre Moutouri
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* SEO content */}
      <SEOContentSection />
      
      {/* Advertisement bottom */}
      <section className="container px-4 mx-auto py-8">
        <Advertisement position="home-bottom" maxHeight={200} />
      </section>
    </div>
  );
}