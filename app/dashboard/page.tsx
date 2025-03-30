"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import DashboardLayout from "@/components/dashboard-layout"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserProducts, deleteProduct } from "@/services/products"
import { getLatestProducts } from "@/services/products"
import ProtectedRoute from "@/components/protected-route"
import { SearchBar } from "@/components/search-bar"
import { createProductWithImages } from '@/services/client-products'

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userProducts, setUserProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Only fetch if user is authenticated
        if (user) {
          // Fetch user's products
          const userProductsResponse = await getUserProducts(user._id)
          setUserProducts(userProductsResponse.products || [])
          // Fetch latest products for featured section
          const latestProductsResponse = await getLatestProducts(4)
          setFeaturedProducts(latestProductsResponse.products || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])
  // Function to handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.")) {
      try {
        const response = await deleteProduct(productId);
        if (response.success) {
          toast({
            title: "Produit supprimé",
            description: "Votre annonce a été supprimée avec succès.",
          });
          
          // Update the products list
          setUserProducts(userProducts.filter((product: any) => product._id !== productId));
        } else {
          throw new Error(response.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer ce produit. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Bienvenue, {user?.firstName || "Utilisateur"}</CardTitle>
                <CardDescription>Voici ce qui se passe sur votre compte Moutouri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Vos Annonces</p>
                    <p className="text-2xl font-bold">{userProducts.length}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Articles Sauvegardés</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>Tâches courantes que vous pourriez vouloir effectuer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="w-full" asChild>
                    <Link href="/products/new">Publier une Annonce</Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Link href="/products">Parcourir les Motos</Link> 
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Link href="/profile">Modifier le Profil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Annonces en Vedette</CardTitle>
              <CardDescription>Articles populaires de notre communauté</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Aucune annonce disponible actuellement.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vos Annonces</CardTitle>
              <CardDescription>Gérez vos annonces publiées</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2].map(i => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : userProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userProducts.map((product: any) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      actions={
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <Link href={`/products/edit/${product._id}`}>Modifier</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1" 
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'annonces.</p>
                  <Button asChild>
                    <Link href="/products/new">Publier votre première annonce</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières mises à jour de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

