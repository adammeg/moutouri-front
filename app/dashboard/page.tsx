"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BikeIcon, Package, PlusCircle, Settings, Trash2, Plus, Check, AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserProducts } from "@/services/products"
import { getLatestProducts, deleteProduct } from "@/services/products"
import ProtectedRoute from "@/components/protected-route"
import { ProductCard } from "@/components/product-card"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [userProducts, setUserProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        console.log("Auth is still loading, waiting...");
        return;
      }
      
      console.log("Dashboard - User state:", user ? `User ID: ${user._id}` : "No user");
      setIsLoading(true)
      
      try {
        if (user && user._id) {
          console.log("Fetching products for user:", user._id);
          
          // Fetch user's products
          const userProductsResponse = await getUserProducts(user._id)
          if (userProductsResponse.success) {
            setUserProducts(userProductsResponse.products || [])
          } else {
            console.error("Error fetching user products:", userProductsResponse.message);
            setError(userProductsResponse.message || 'Failed to fetch your products')
          }
          
          // Fetch latest products for featured section
          const latestProductsResponse = await getLatestProducts(4)
          setFeaturedProducts(latestProductsResponse.products || [])
        } else {
          console.log("⚠️ Not fetching products - no user ID available");
          setError("User information not available. Please log in again.");
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [user, authLoading, toast])

  // Function to handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingProductId(productId)
      
      const response = await deleteProduct(productId)
      
      if (response.success) {
        // Remove the deleted product from state
        setUserProducts(userProducts.filter((product: any) => product._id !== productId))
        
        toast({
          title: "Succès",
          description: "Votre produit a été supprimé",
          variant: "default",
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la suppression du produit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Erreur",
        description: "Échec de la suppression du produit",
        variant: "destructive",
      })
    } finally {
      setDeletingProductId(null)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Publier une Annonce
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  Erreur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Tabs defaultValue="my-listings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="my-listings">Mes Annonces</TabsTrigger>
                <TabsTrigger value="featured">Annonces Populaires</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-listings">
                {userProducts.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Aucune annonce</CardTitle>
                      <CardDescription>
                        Vous n'avez pas encore publié d'annonces.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Publiez votre première annonce pour commencer à vendre vos produits.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/products/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Publier une Annonce
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userProducts.map((product: any) => (
                      <Card key={product._id} className="overflow-hidden">
                        <CardHeader className="p-0">
                          <div className="aspect-video relative w-full overflow-hidden">
                            <img
                              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                              alt={product.title}
                              className="object-cover w-full h-full transition-all hover:scale-105"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                          <p className="text-primary font-bold mt-1">
                            {product.price.toLocaleString('fr-TN')} DT
                          </p>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 pt-0 border-t-0">
                          <Button variant="outline" asChild>
                            <Link href={`/products/${product._id}`}>
                              Voir
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="featured">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredProducts.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

