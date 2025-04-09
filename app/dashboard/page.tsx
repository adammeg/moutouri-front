"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Package, AlertCircle, PlusCircle, Edit, Trash2, Eye } from "lucide-react"
import { getUserProducts, deleteProduct } from "@/services/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
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
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user products when authentication is confirmed
  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        if (!user?._id) {
          throw new Error("Utilisateur non identifié");
        }
        
        setIsLoading(true);
        const response = await getUserProducts(user._id);
        
        if (response.success) {
          setProducts(response.products || []);
        } else {
          throw new Error(response.message || "Erreur lors de la récupération des produits");
        }
      } catch (error: any) {
        console.error("Error fetching user products:", error);
        setError(error.message || "Une erreur s'est produite");
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger vos produits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (mounted && isAuthenticated && user?._id) {
      fetchUserProducts();
    }
  }, [user, isAuthenticated, mounted, toast]);

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      const response = await deleteProduct(productId);
      
      if (response.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast({
          title: "Succès",
          description: "Produit supprimé avec succès",
        });
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // Dashboard content
  const dashboardContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes annonces</h1>
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publier une annonce
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-medium mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Aucune annonce</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Vous n'avez pas encore publié d'annonces. Commencez par en créer une nouvelle !
          </p>
          <Button asChild>
            <Link href="/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Publier une annonce
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted/20">
                <Image
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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
                  <Link href={`/products/edit/${product._id}`}>
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
  );

  // Initial loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // Use AuthLayout to ensure consistent dashboard appearance
  return <AuthLayout>{dashboardContent}</AuthLayout>;
}