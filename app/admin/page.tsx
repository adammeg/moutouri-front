"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart4, Users, ShoppingBag, Tag, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AdminStats, getAdminStats } from "@/services/admin"
import ProtectedRoute from "@/components/protected-route"

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Redirect non-admin users
    if (user && !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions d'administrateur.",
        variant: "destructive",
      })
      router.push("/login")
    }

    const fetchAdminData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch admin statistics
        const statsResponse = await getAdminStats()
        if (statsResponse.success) {
          setStats(statsResponse.data)
        } else {
          throw new Error(statsResponse.message || "Erreur lors du chargement des statistiques")
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données administrateur. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchAdminData()
    }
  }, [isAdmin, user, router, toast])

  if (!isAdmin) {
    return null
  }

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
            <p className="text-muted-foreground">
              Gérez les utilisateurs, les produits et les catégories du site
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="reports">Signalements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Utilisateurs Total
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        Utilisateurs enregistrés sur la plateforme
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Produits Total
                      </CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalProducts}</div>
                      <p className="text-xs text-muted-foreground">
                        Produits listés sur la plateforme
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Catégories
                      </CardTitle>
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalCategories}</div>
                      <p className="text-xs text-muted-foreground">
                        Catégories disponibles
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        À Vérifier
                      </CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.recentProducts?.filter(p => !p.isVerified)?.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Produits en attente de vérification
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Add more overview content here like charts and recent activity */}
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              {/* Users table and management interface */}
              <h2 className="text-xl font-semibold mb-4">Gestion des Utilisateurs</h2>
              {/* Table of users would go here */}
            </TabsContent>
            
            <TabsContent value="products" className="mt-6">
              {/* Products management interface */}
              <h2 className="text-xl font-semibold mb-4">Gestion des Produits</h2>
              {/* Table of products would go here */}
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              {/* Categories management interface */}
              <h2 className="text-xl font-semibold mb-4">Gestion des Catégories</h2>
              {/* Categories management would go here */}
            </TabsContent>
            
            <TabsContent value="reports" className="mt-6">
              {/* Reports and moderation interface */}
              <h2 className="text-xl font-semibold mb-4">Signalements et Modération</h2>
              {/* Reports table would go here */}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

