"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, Package, CreditCard, BarChart3, ListFilter, 
  ShieldAlert, Calendar, ArrowUpRight, ArrowDownRight,
  Activity, RefreshCcw, Search, Download, FileSpreadsheet,
  Filter, AlertCircle, Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { featureProduct, getAdminStats, getAllProducts, getAllUsers,  updateUserRole, verifyProduct } from "@/services/admin"
import { getProducts, deleteProduct } from "@/services/products"
import { getAllAds, getAdStats, deleteAd } from "@/services/ads"
import ProtectedRoute from "@/components/protected-route"
import UsersList from "@/components/admin/users-list"
import StatsCard from "@/components/admin/stats-card"

// Define types for stats data
interface AdminStatsData {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders?: number;
  totalViews: number;
  revenue?: number;
  pendingProducts: number;
  recentUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    role: string;
    createdAt: string;
  }>;
  recentProducts: Array<{
    _id: string;
    title: string;
    price: number;
    images?: string[];
    isVerified: boolean;
    createdAt: string;
    category?: {
      _id: string;
      name: string;
    };
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      image?: string;
    };
  }>;
  users: Array<any>;
}

// Define type for ad stats
interface AdStatsData {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, getAuthToken } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [adStats, setAdStats] = useState<AdStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingAds, setIsLoadingAds] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [productFilter, setProductFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAdmin || !user) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching admin data...")
        
        const token = getAuthToken()
        if (!token) {
          throw new Error("No auth token available")
        }

        const response = await getAdminStats()
        
        if (response.success) {
          console.log("Admin stats:", response.data)
          setStats(response.data)
        } else {
          console.error("Failed to fetch admin stats:", response.message)
          setError(`Erreur de chargement: ${response.message}`)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
        setError("Une erreur est survenue lors du chargement des données")
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques d'administration.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [user, isAdmin, router, toast, getAuthToken])

  // Fetch products data when products tab is active
  useEffect(() => {
    if (activeTab === "products" && isLoadingProducts) {
      const fetchProducts = async () => {
        try {
          setIsLoadingProducts(true)
          const token = getAuthToken()
          
          if (!token) {
            throw new Error("No auth token available")
          }
          
          const response = await getAllProducts(token)
          
          if (response.success) {
            setProducts(response.products || [])
          } else {
            toast({
              title: "Erreur",
              description: "Impossible de charger les produits.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching products:", error)
        } finally {
          setIsLoadingProducts(false)
        }
      }

      fetchProducts()
    }
  }, [activeTab, isLoadingProducts, toast])

  // Fetch ads data when ads tab is active
  useEffect(() => {
    if (activeTab === "ads" && isLoadingAds) {
      const fetchAds = async () => {
        try {
          setIsLoadingAds(true)
          const token = getAuthToken()
          
          if (!token) {
            throw new Error("No auth token available")
          }
          
          // Fetch all ads
          const adsResponse = await getAllAds(token)
          
          if (adsResponse.success) {
            setAds(adsResponse.ads || [])
          }
          
          // Fetch ad stats
          const statsResponse = await getAdStats(token)
          
          if (statsResponse.success) {
            setAdStats(statsResponse.stats)
          }
        } catch (error) {
          console.error("Error fetching ads data:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les données publicitaires.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingAds(false)
        }
      }

      fetchAds()
    }
  }, [activeTab, isLoadingAds, getAuthToken, toast])

  // Handle product verification
  const handleVerifyProduct = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await verifyProduct(productId, !currentStatus)
      
      if (response.success) {
        setProducts(products.map(product => 
          product._id === productId 
            ? { ...product, isVerified: !currentStatus } 
            : product
        ))
        
        toast({
          title: "Succès",
          description: `Produit ${!currentStatus ? 'vérifié' : 'non vérifié'} avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la mise à jour du statut du produit.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying product:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification du produit.",
        variant: "destructive",
      })
    }
  }

  // Handle featuring a product
  const handleFeatureProduct = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await featureProduct(productId, !currentStatus)
      
      if (response.success) {
        setProducts(products.map(product => 
          product._id === productId 
            ? { ...product, isFeatured: !currentStatus } 
            : product
        ))
        
        toast({
          title: "Succès",
          description: `Produit ${!currentStatus ? 'mis en avant' : 'retiré de la mise en avant'} avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la mise à jour du statut du produit.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error featuring product:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise en avant du produit.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await deleteProduct(productId)
      
      if (response.success) {
        setProducts(products.filter(product => product._id !== productId))
        
        toast({
          title: "Succès",
          description: "Produit supprimé avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la suppression du produit.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting an ad
  const handleDeleteAd = async (adId: string) => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("No auth token available")
      }
      
      const response = await deleteAd(adId, token)
      
      if (response.success) {
        setAds(ads.filter(ad => ad._id !== adId))
        
        toast({
          title: "Succès",
          description: "Annonce publicitaire supprimée avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: response.message || "Échec de la suppression de l'annonce.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting ad:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'annonce.",
        variant: "destructive",
      })
    }
  }

  // Filter products based on search term and filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (productFilter === "all") return matchesSearch;
    if (productFilter === "verified") return matchesSearch && product.isVerified;
    if (productFilter === "unverified") return matchesSearch && !product.isVerified;
    if (productFilter === "featured") return matchesSearch && product.isFeatured;
    
    return matchesSearch;
  });

  // Prepare recent items for display
  const recentUsers = stats?.recentUsers || [];
  const recentProducts = stats?.recentProducts || [];

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tableau de bord administrateur</h1>
              <p className="text-muted-foreground">
                Gérez votre plateforme, supervisez les activités et suivez les statistiques.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button asChild size="sm">
                <Link href="/admin/ads/new">
                  <Package className="mr-2 h-4 w-4" />
                  Nouvelle Publicité
                </Link>
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="ads">Publicités</TabsTrigger>
              <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p>Chargement des données...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                      title="Utilisateurs totaux"
                      value={stats?.totalUsers ?? 0}
                      description="Utilisateurs inscrits sur la plateforme"
                      icon={<Users className="h-4 w-4" />}
                    />
                    <StatsCard
                      title="Produits"
                      value={stats?.totalProducts ?? 0}
                      description={`${stats?.pendingProducts ?? 0} en attente de vérification`}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <StatsCard
                      title="Catégories"
                      value={stats?.totalCategories ?? 0}
                      description="Types de véhicules et pièces"
                      icon={<ListFilter className="h-4 w-4" />}
                    />
                    <StatsCard
                      title="Vues"
                      value={stats?.totalViews ?? 0}
                      description="Vues de produits"
                      icon={<BarChart3 className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle>Produits récents</CardTitle>
                        <CardDescription>
                          Les derniers produits ajoutés sur la plateforme
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recentProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Package className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Aucun produit récent</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentProducts.slice(0, 5).map((product) => (
                              <div key={product._id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                                    {product.images && product.images[0] ? (
                                      <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 m-2 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium leading-none">{product.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {product.price.toLocaleString()} TND
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Badge variant={product.isVerified ? "default" : "secondary"}>
                                    {product.isVerified ? "Vérifié" : "En attente"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/admin?tab=products">
                            Voir tous les produits
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Utilisateurs récents</CardTitle>
                        <CardDescription>
                          Les derniers utilisateurs inscrits
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recentUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Aucun utilisateur récent</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentUsers.slice(0, 5).map((user) => (
                              <div key={user._id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback>
                                      {user.firstName?.charAt(0) || "U"}
                                      {user.lastName?.charAt(0) || ""}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium leading-none">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                  {user.role === "admin" ? "Admin" : "Utilisateur"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/admin?tab=users">
                            Voir tous les utilisateurs
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérez les comptes utilisateurs et leurs permissions
                    </CardDescription>
                  </div>
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    className="max-w-sm"
                  />
                </CardHeader>
                <CardContent>
                  <UsersList 
                    users={stats?.users || []} 
                    isLoading={isLoading} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Gestion des produits</CardTitle>
                    <CardDescription>
                      Vérifiez et gérez les annonces publiées sur la plateforme
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Rechercher un produit..."
                      className="max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="verified">Vérifiés</option>
                      <option value="unverified">Non vérifiés</option>
                      <option value="featured">Mis en avant</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Vendeur</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>État</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingProducts ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                </div>
                              </TableCell>
                              <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-6 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
                              <TableCell><div className="h-8 w-24 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Aucun produit trouvé
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => (
                            <TableRow key={product._id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                                    {product.images && product.images[0] ? (
                                      <Image 
                                        src={product.images[0]} 
                                        alt={product.title}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 m-2 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="font-medium truncate max-w-[150px]">{product.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {product.category?.name || 'Non catégorisé'}
                              </TableCell>
                              <TableCell>{product.price?.toLocaleString()} TND</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={product.user?.image} />
                                    <AvatarFallback>
                                      {product.user?.firstName?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-[100px]">
                                    {product.user?.firstName || 'Utilisateur'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {product.createdAt ? format(new Date(product.createdAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.isVerified ? "default" : "outline"}>
                                  {product.isVerified ? "Vérifié" : "En attente"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant={product.isVerified ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => handleVerifyProduct(product._id, product.isVerified)}
                                  >
                                    {product.isVerified ? "Annuler" : "Vérifier"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeatureProduct(product._id, product.isFeatured)}
                                  >
                                    {product.isFeatured ? "Retirer" : "Promouvoir"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
                                        handleDeleteProduct(product._id)
                                      }
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Affichage de <strong>{filteredProducts.length}</strong> produits sur <strong>{products.length}</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>Précédent</Button>
                    <Button variant="outline" size="sm">Suivant</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Publicités totales"
                  value={adStats?.totalAds ?? 0}
                  description="Nombre total d'annonces publiées"
                  icon={<Package className="h-4 w-4" />}
                />
                <StatsCard
                  title="Publicités actives"
                  value={adStats?.activeAds ?? 0}
                  description="Annonces actuellement visibles"
                  icon={<ShieldAlert className="h-4 w-4" />}
                />
                <StatsCard
                  title="Impressions"
                  value={adStats?.totalImpressions ?? 0}
                  description="Nombre total de vues"
                  icon={<BarChart3 className="h-4 w-4" />}
                />
                <StatsCard
                  title="Clics"
                  value={adStats?.totalClicks ?? 0}
                  description="Utilisateurs ayant cliqué"
                  icon={<Activity className="h-4 w-4" />}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Gestion des publicités</CardTitle>
                    <CardDescription>
                      Gérez les annonces publicitaires sur votre plateforme
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/admin/ads/new">
                      Créer une publicité
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Impressions</TableHead>
                          <TableHead>Clics</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingAds ? (
                          Array(3).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-10 w-20 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-6 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
                              <TableCell><div className="h-8 w-24 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : ads.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Aucune publicité trouvée. <Link href="/admin/ads/new" className="text-primary underline">Créer une nouvelle publicité</Link>
                            </TableCell>
                          </TableRow>
                        ) : (
                          ads.map((ad) => (
                            <TableRow key={ad._id}>
                              <TableCell>
                                <span className="font-medium">{ad.title}</span>
                              </TableCell>
                              <TableCell>
                                <div className="h-10 w-20 rounded bg-muted overflow-hidden">
                                  {ad.image ? (
                                    <Image 
                                      src={ad.image} 
                                      alt={ad.title}
                                      width={80}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="h-6 w-6 m-2 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  switch(ad.position) {
                                    case 'home-hero': return 'Bannière accueil';
                                    case 'home-middle': return 'Milieu page accueil';
                                    case 'home-bottom': return 'Bas de page accueil';
                                    case 'sidebar': return 'Barre latérale';
                                    case 'product-page': return 'Page produit';
                                    default: return ad.position;
                                  }
                                })()}
                              </TableCell>
                              <TableCell>{ad.impressions || 0}</TableCell>
                              <TableCell>{ad.clicks || 0}</TableCell>
                              <TableCell>
                                <Badge variant={ad.isActive ? "default" : "secondary"}>
                                  {ad.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={`/admin/ads/${ad._id}`}>
                                      Modifier
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Voulez-vous vraiment supprimer cette publicité ?")) {
                                        handleDeleteAd(ad._id)
                                      }
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytiques détaillées</CardTitle>
                  <CardDescription>Vue d'ensemble des performances de votre plateforme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Le module d'analytiques avancées est en cours de développement.
                      Des fonctionnalités supplémentaires seront bientôt disponibles.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="rounded-lg border p-8 text-center">
                    <h3 className="text-lg font-medium mb-4">Rapport d'activité</h3>
                    <p className="text-muted-foreground mb-6">
                      Les rapports détaillés vous permettront de suivre les tendances de votre plateforme,
                      y compris les vues de produits, les inscriptions d'utilisateurs et les interactions.
                    </p>
                    <Button disabled>Générer un rapport</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

