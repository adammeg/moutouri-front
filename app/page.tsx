"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2, Search, PlusCircle, ChevronRight, BikeIcon, Wrench, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import { getLatestProducts } from "@/services/products"
import { getCategories } from "@/services/categories"
import SEO from "@/components/seo"
import { AdvancedAd } from "@/components/advanced-ad"
import Navbar from "@/components/navbar"
import { AD_POSITIONS } from "@/config/ad-positions"
import HeroBackground from "@/components/hero-background"
import PopularSearchTerms from "@/components/popular-search-terms"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  // Set mounted flag for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch latest products
  useEffect(() => {
    if (!mounted) return;
    
    const fetchLatestProducts = async () => {
      try {
        setIsLoadingProducts(true)
        console.log("📦 Fetching latest products");
        const response = await getLatestProducts(10)
        
        if (response.success) {
          console.log(`✅ Found ${response.products.length} latest products`);
          setFeaturedProducts(response.products as any)
        } else {
          console.error("❌ Failed to fetch products:", response.message);
          setError(response.message || "Failed to load products" as any)
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    
    fetchLatestProducts()
  }, [mounted])
  
  // Fetch categories
  useEffect(() => {
    if (!mounted) return;
    
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        console.log("🏷️ Fetching categories");
        const response = await getCategories()
        
        if (response.success) {
          console.log(`✅ Found ${response.categories.length} categories`);
          setCategories(response.categories)
        } else {
          console.warn("⚠️ Failed to fetch categories:", response.message);
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [mounted])
  
  // If not mounted yet (server-side), return minimal UI to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Moutouri - Premier marketplace de motos et scooters en Tunisie"
        description="Achetez et vendez des motos, scooters et pièces détachées en Tunisie. Trouvez votre prochaine moto ou vendez la vôtre facilement."
      />
      
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-24 text-center">
          <HeroBackground />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Trouvez votre prochaine moto en Tunisie
              </h1>
              <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
                Premier marketplace spécialisé dans l'achat et la vente de motos, scooters et pièces détachées en Tunisie
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <Button asChild size="lg" className="flex-1">
                <Link href="/products">
                  <Search className="mr-2 h-5 w-5" />
                  Parcourir les annonces
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href="/products/new">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Publier une annonce
                </Link>
              </Button>
            </motion.div>
            
            {/* Hero Banner Ad */}
            <div className="max-w-4xl mx-auto mt-10">
              <AdvancedAd 
                position={AD_POSITIONS.HOME_HERO}
                variant="banner"
              />
            </div>
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section className="py-12 md:py-16 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Dernières annonces</h2>
              <Link href="/products" className="text-primary hover:underline flex items-center text-sm sm:text-base">
                Voir toutes les annonces
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isLoadingProducts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                {error}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {featuredProducts.slice(0, 4).map((product: any) => (
                  <motion.div key={product._id} variants={fadeIn}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Middle Ad Banner */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <AdvancedAd 
              position={AD_POSITIONS.HOME_MIDDLE}
              variant="banner"
            />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Pourquoi choisir Moutouri ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border bg-card">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <BikeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Large choix de motos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Des milliers d'annonces de motos, scooters et pièces détachées de particuliers et professionnels dans toute la Tunisie.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border bg-card">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Facile et gratuit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Publiez votre annonce gratuitement en quelques minutes et attirez des acheteurs potentiels rapidement.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border bg-card">
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Pièces détachées</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Trouvez toutes les pièces dont vous avez besoin pour votre moto, des accessoires aux pièces mécaniques.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-muted/5">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Catégories populaires</h2>
            
            {isLoadingCategories ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category: any) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* More Products with Integrated Ad */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">À découvrir également</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* First set of products */}
              {featuredProducts.slice(4, 7).map((product: any) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
              
              {/* Integrated ad as a "product" */}
              <div className="h-full">
                <AdvancedAd 
                  position={AD_POSITIONS.HOME_FEATURED}
                  variant="card"
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Popular Search Terms */}
        <PopularSearchTerms />
        
        {/* Bottom Ad Banner */}
        <section className="py-8 bg-muted/10">
          <div className="container mx-auto px-4">
            <AdvancedAd 
              position={AD_POSITIONS.HOME_BOTTOM}
              variant="banner"
            />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image 
                  src="/logo-moutouri.png" 
                  alt="Moutouri" 
                  width={40} 
                  height={40} 
                  className="rounded-md"
                />
                <span className="text-xl font-bold">Moutouri</span>
              </Link>
              <p className="text-muted-foreground mb-4">
                Premier marketplace spécialisé dans l'achat et la vente de motos, scooters et pièces détachées en Tunisie.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Link>
                <Link href="#" className="hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Parcourir les annonces</Link></li>
                <li><Link href="/products/new" className="text-muted-foreground hover:text-foreground transition-colors">Publier une annonce</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">À propos</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tunis, Tunisie</li>
                <li>contact@moutouri.tn</li>
                <li>+216 90053729</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-muted">
            <p className="text-center text-muted-foreground">
              © {new Date().getFullYear()} Moutouri. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}