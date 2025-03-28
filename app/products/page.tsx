"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Package, AlertCircle } from "lucide-react"
import Image from 'next/image'
import SEO from "@/components/seo"
import DashboardLayout from "@/components/dashboard-layout"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProducts } from "@/services/products"
import { getCategories } from "@/services/categories"
import { SearchBar } from "@/components/search-bar"
import GoogleAdSense from "@/components/google-adsense"
// Components that use search params need to be separated
function ProductsContent() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch categories and products
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
        
        // Fetch products with filters
        const response = await getProducts(filters)
        setProducts(response.products || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Impossible de charger les données. Veuillez réessayer.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoriesAndProducts()
  }, [toast, searchParams, isMounted])

  const handleSearchResults = (results: any[], query: string) => {
    setProducts(results)
    setSearchQuery(query)
  }

  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    setIsLoading(true)
    
    try {
      const filters: any = {}
      
      // If not "all", add category filter
      if (value !== "all") {
        filters.category = value
      }
      
      // Keep search query if exists
      if (searchQuery) {
        filters.search = searchQuery
      }
      
      const response = await getProducts(filters)
      setProducts(response.products || [])
    } catch (error) {
      console.error("Error fetching filtered products:", error)
      toast({
        title: "Erreur",
        description: "Impossible de filtrer les produits.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get products for a specific category
  const getProductsByCategory = (categoryId: string) => {
    return products.filter((product: any) => 
      typeof product.category === 'object' 
        ? product.category._id === categoryId 
        : product.category === categoryId
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground">
              Découvrez les motos, scooters et pièces disponibles
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products/new">Publier une Annonce</Link>
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="w-full">
          <SearchBar searchQuery={searchQuery} onSearch={handleSearchResults} />
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full border-b pb-px overflow-x-auto flex-nowrap">
          <TabsTrigger value="all">Tous les Produits</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category._id} value={category._id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Chargement des produits</h3>
            <p className="text-muted-foreground max-w-md">
              Veuillez patienter pendant que nous récupérons les produits...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground max-w-md mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product: any) => (
                      <ProductCard 
                        key={product._id}
                        product={product}
                      >
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="h-48 w-full object-cover rounded-t"
                            unoptimized
                          />
                        ) : (
                          <div className="h-48 w-full bg-gray-200 flex items-center justify-center rounded-t">
                            <span className="text-gray-500">Pas d'image</span>
                          </div>
                        )}
                      </ProductCard>
                    ))}
                  </div>
                  <div className="my-6 w-full">
                    <GoogleAdSense 
                      slot="2488891530"
                      className="adsense-container"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products.slice(4).map((product: any) => (
                      <ProductCard 
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun produit disponible</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Soyez le premier à publier une annonce sur notre plateforme.
                  </p>
                  <Button asChild>
                    <Link href="/products/new">Publier une annonce</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Dynamic category tabs */}
            {categories.map((category) => (
              <TabsContent key={category._id} value={category._id} className="mt-6">
                {getProductsByCategory(category._id).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {getProductsByCategory(category._id).map((product: any) => (
                      <ProductCard 
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun produit dans {category.name}</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Soyez le premier à publier une annonce dans cette catégorie.
                    </p>
                    <Button asChild>
                      <Link href="/products/new">Publier une annonce</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>
    </div>
  );
}

// Main page component with Suspense
export default function ProductsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      }>
        <ProductsContent />
      </Suspense>
    </DashboardLayout>
  )
}