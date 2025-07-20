"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Package, AlertCircle, PlusCircle, Edit, Trash2, Eye } from "lucide-react"
import { getUserProducts, deleteProduct } from "@/services/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import AuthLayout from "@/components/auth-layout"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Product } from "@/types/product"

// Wrap dashboard content in this component so we can keep AuthLayout for consistent UI
// while still controlling data fetching timing
function DashboardContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // DIAGNOSTIC LOG: Component mounting
  console.log("[Dashboard] Component mounting:", { 
    authLoading, 
    isAuthenticated, 
    userId: user?._id 
  })

  // Set mounted state for client-side rendering
  useEffect(() => {
    setMounted(true)
    console.log("[Dashboard] Component mounted")
  }, [])

  // Fetch user products when authenticated
  useEffect(() => {
    // DIAGNOSTIC LOG: Data fetch effect triggered
    console.log("[Dashboard] Data fetch effect running:", {
      mounted,
      authLoading,
      isAuthenticated,
      userId: user?._id,
      token: localStorage.getItem('accessToken')?.substring(0, 10) + '...'
    })

    const fetchUserProducts = async () => {
      // Early exit conditions
      if (!mounted || authLoading) {
        console.log(`[Dashboard] Skipping fetch - ${!mounted ? 'not mounted yet' : 'auth still loading'}`)
        return
      }
    
      if (!isAuthenticated || !user?._id) {
        console.log("[Dashboard] Skipping fetch - not authenticated or no user ID")
        setIsLoading(false)
        return
      }
    
      try {
        setIsLoading(true)
        setError(null) // Clear previous errors
        console.log("[Dashboard] Starting product fetch for user:", user._id)
        
        const response = await getUserProducts(user._id)
        console.log("[Dashboard] API response:", response)
        
        if (response.success) {
          console.log("[Dashboard] Fetch successful:", response.data?.length, "products")
          setProducts(response.data || []) // Note: Changed from response.products to response.data
        } else {
          console.error("[Dashboard] API returned error:", response.message)
          setError(response.message || "Failed to fetch your products")
          setProducts([]) // Clear products on error
        }
      } catch (err) {
        console.error("[Dashboard] Exception during fetch:", err)
        const errorMessage =
          (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string")
            ? (err as any).message
            : "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        setProducts([]); // Clear products on error
      } finally {
        setIsLoading(false);
        console.log("[Dashboard] Fetch completed");
      }
    }

    fetchUserProducts()
  }, [mounted, authLoading, isAuthenticated, user])

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true)
      
      const response = await deleteProduct(productId)
      
      if (response.success) {
        // Update the local state to remove the deleted product
        setProducts(products.filter(product => product._id !== productId))
        
        toast({
          title: "Produit supprimé",
          description: "Votre produit a été supprimé avec succès",
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  // DIAGNOSTIC LOG: Component rendering
  console.log("[Dashboard] Rendering with state:", { 
    mounted,
    authLoading, 
    isAuthenticated, 
    isLoading, 
    productsCount: products.length,
    hasError: !!error
  })

  // Show loading state if not mounted or auth is still loading
  if (!mounted || authLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Mes annonces</h1>
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publier une annonce
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des produits...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Une erreur est survenue</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">Aucune annonce publiée</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Vous n'avez pas encore publié d'annonces. Cliquez sur le bouton ci-dessous pour créer votre première annonce.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Publier une annonce
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.isFeatured && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                      Mis en avant
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {product.status === 'active' ? 'Active' : 'En attente'}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                <p className="text-primary font-medium">{product.price.toLocaleString()} DT</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Publié {formatDistanceToNow(new Date(product.createdAt), { locale: fr, addSuffix: true })}
                </p>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${product._id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/products/${product._id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setProductToDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Main Dashboard Page that uses AuthLayout for consistent UI
export default function DashboardPage() {
  console.log("[DashboardPage] Main component rendering")
  
  return (
    <AuthLayout>
      <DashboardContent />
    </AuthLayout>
  )
}