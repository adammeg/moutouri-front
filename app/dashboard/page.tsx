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

  // Fetch user products when authenticated
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!isAuthenticated || authLoading || !user?._id) {
        return; // Wait for auth to complete
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`📦 Fetching products for user: ${user._id}`);
        
        const response = await getUserProducts(user._id);
        
        if (response.success) {
          console.log(`✅ Found ${response.products?.length || 0} products`);
          setProducts(response.products || []);
        } else {
          console.error("❌ Failed to fetch products:", response.message);
          setError(response.message || "Failed to fetch your products");
        }
      } catch (error) {
        console.error("❌ Error fetching user products:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted && isAuthenticated && !authLoading && user?._id) {
      fetchUserProducts();
    }
  }, [user, isAuthenticated, authLoading, mounted]);

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      
      const response = await deleteProduct(productId);
      
      if (response.success) {
        setProducts(products.filter(product => product._id !== productId));
        toast({
          title: "Produit supprimé",
          description: "Votre produit a été supprimé avec succès",
        });
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
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
        <h1 className="text-2xl font-bold tracking-tight">Mes annonces</h1>
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publier une annonce
          </Link>
        </Button>
      </div>

      {isLoading && !products.length ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md flex items-start space-x-4">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-medium text-destructive">Erreur de chargement</h3>
            <p className="text-sm text-destructive/90">{error}</p>
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
          {products.map(product => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
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
  );

  // During initial client-side rendering, show a loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // Use AuthLayout to handle protection and layout
  return <AuthLayout>{dashboardContent}</AuthLayout>;
}