"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Package, AlertCircle, PlusCircle } from "lucide-react"
import Image from 'next/image'
import SEO from "@/components/seo"
import ProductCard from "@/components/product-card"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProducts } from "@/services/products"
import { getCategories } from "@/services/categories"
import { ProductSearch } from "@/components/product-search"
import { Advertisement } from '@/components/advertisement'
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import AuthLayout from "@/components/auth-layout"
import { AdvancedAd } from "@/components/advanced-ad"
import { AD_POSITIONS } from "@/config/ad-positions"
import ProductListingWithAds from "@/components/product-listing-with-ads"

// Components that use search params need to be separated
function ProductsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    setIsMounted(true);
    if (isMounted){
      window.location.reload()
    }
  }, []);

  // Fetch categories and products when search parameters change
  useEffect(() => {
    if (!isMounted) return;

    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch categories first
        const categoriesResponse = await getCategories()
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.categories || [])
        }

        // Parse search parameters
        const query = searchParams?.get('q') || ""
        const categoryParam = searchParams?.get('category') || ""
        const minPrice = searchParams?.get('minPrice') || ""
        const maxPrice = searchParams?.get('maxPrice') || ""
        setSearchQuery(query)

        // Set active tab based on category param if present
        if (categoryParam) {
          setActiveTab(categoryParam)
        } else {
          setActiveTab("all")
        }

        // Build filter object from URL parameters
        const filters: any = {}

        if (query) {
          filters.search = query
        }

        if (categoryParam) {
          filters.category = categoryParam
        }

        if (minPrice) {
          filters.minPrice = minPrice
        }

        if (maxPrice) {
          filters.maxPrice = maxPrice
        }

        console.log("Fetching products with filters:", filters)
        // Fetch products with filters
        const productsResponse = await getProducts(filters)
        
        if (productsResponse.success) {
          console.log(`Found ${productsResponse.products.length} products matching filters`)
          setProducts(productsResponse.products || [])
        } else {
          setError(productsResponse.message || "Failed to load products")
        }
      } catch (error: any) {
        console.error("Error in fetchCategoriesAndProducts:", error)
        setError(error.message || "An error occurred while loading the page")
        toast({
          title: "Error",
          description: error.message || "Failed to load products",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoriesAndProducts()
    // This effect should run whenever searchParams changes
  }, [searchParams, isMounted, toast])

  // Function to handle search submission
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    
    router.push(`/products?${params.toString()}`)
  }

  // Function to handle tab change (category filter)
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    const params = new URLSearchParams(searchParams?.toString() || "")
    
    if (value === "all") {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    
    router.push(`/products?${params.toString()}`)
  }

  // Helper function to get products by category
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => 
      product.category && product.category._id === categoryId
    )
  }

  // Render product grid with integrated ads
  const renderProductGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun produit disponible</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Soyez le premier à publier une annonce sur notre plateforme."}
          </p>
          <div className="flex justify-end mb-6">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/products/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Publier une annonce
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login?redirectTo=/products/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Connexion pour publier
                </Link>
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    // Inject ads into the product listing at calculated positions
    const productsWithAds = [...products];
    
    // Add an ad after the first 4 products if we have enough products
    if (products.length >= 4) {
      productsWithAds.splice(4, 0, { isAd: true, position: AD_POSITIONS.PRODUCT_IN_LIST });
    }
    
    // Add another ad after the 12th product if we have enough products
    if (products.length >= 12) {
      productsWithAds.splice(12, 0, { isAd: true, position: AD_POSITIONS.PRODUCT_IN_LIST });
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productsWithAds.map((item, index) => {
          // If this is an ad placeholder, render the ad component
          if (item.isAd) {
            return (
              <div key={`ad-${index}`} className="col-span-1 sm:col-span-1 md:col-span-1">
                <AdvancedAd
                  position={item.position}
                  variant="card"
                  className="h-full"
                />
              </div>
            );
          }
          
          // Otherwise render a normal product card
          return (
            <ProductCard key={item._id} product={item} />
          );
        })}
      </div>
    );
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-96">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* SEO */}
      <SEO 
        title="Motos et Scooters à vendre en Tunisie | Moutouri"
        description="Trouvez votre prochaine moto ou scooter parmi des centaines d'annonces en Tunisie. Achetez et vendez facilement des motos, scooters et pièces détachées."
      />
      
      {/* Search Bar */}
      <ProductSearch 
        onSearch={handleSearch} 
        className="mb-6"
      />
      
      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* "Publish Ad" button for authenticated users, "Login to publish" for guests */}
      <div className="flex justify-end mb-6">
  {!authLoading && (isAuthenticated ? (
    <Button asChild>
      <Link href="/products/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        Publier une annonce
      </Link>
    </Button>
  ) : (
    <Button asChild>
      <Link href="/login?redirectTo=/products/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        Connexion pour publier
      </Link>
    </Button>
  ))}
</div>

      {/* Advertisement */}
      <Advertisement position="home-top" className="mb-8" />

      {/* Products Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto mb-6 hide-scrollbar">
          <TabsList className="inline-flex w-auto flex-nowrap space-x-2">
            <TabsTrigger value="all" className="whitespace-nowrap">Tous</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger 
                key={category._id} 
                value={category._id}
                className="whitespace-nowrap"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {!isLoading && !error && products.length > 0 && (
          <ProductListingWithAds products={products} />
        )}
        
        {/* Bottom advertisement */}
        <Advertisement position="home-bottom" className="mt-12" />
      </Tabs>
    </div>
  );
}

// Main Products page with conditional layout based on auth state
export default function ProductsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Initial loading or not yet mounted
  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      {isAuthenticated ? (
        <AuthLayout>
          <ProductsContent />
        </AuthLayout>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <ProductsContent />
          </main>
        </div>
      )}
    </Suspense>
  )
}