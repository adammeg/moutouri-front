"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Edit, 
  Trash2, 
  Plus, 
  Package, 
  Loader2, 
  AlertCircle,
  Eye
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { getUserProducts, deleteProduct } from "@/services/products"
import { useAuth } from "@/contexts/auth-context"
import { ProductCard } from "@/components/product-card"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (!user?._id) {
          throw new Error("Utilisateur non trouvé")
        }
        
        const response = await getUserProducts(user._id)
        
        if (response.success) {
          setProducts(response.products || [])
        } else {
          throw new Error(response.message || "Erreur lors de la récupération des produits")
        }
      } catch (error: any) {
        console.error("Error fetching user products:", error)
        setError(error.message || "Une erreur s'est produite")
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger vos produits",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProducts()
  }, [user, toast])
  
  const handleDelete = async (productId: string) => {
    try {
      setIsDeleting(true)
      
      const response = await deleteProduct(productId)
      
      if (response.success) {
        // Remove product from state
        setProducts(products.filter(product => product._id !== productId))
        
        toast({
          title: "Produit supprimé",
          description: "Votre produit a été supprimé avec succès",
        })
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes Annonces</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Publier une annonce
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Vous n'avez pas encore d'annonces</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Commencez par publier votre première annonce pour vendre votre moto ou scooter.
          </p>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Publier une annonce
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted/20">
                <Image
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded 
                  ${product.isActive ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                  {product.isActive ? 'Actif' : 'En attente'}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-1">{product.title}</h3>
                <p className="text-lg font-bold text-primary mt-1">{product.price} DT</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Publié {formatDistanceToNow(new Date(product.createdAt), { locale: fr, addSuffix: true })}
                </p>
              </CardContent>
              
              <CardFooter className="px-4 pb-4 pt-0 flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  asChild
                >
                  <Link href={`/products/${product._id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  asChild
                >
                  <Link href={`/products/${product._id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={() => setProductToDelete(product._id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Votre annonce sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDelete(productToDelete)}
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

