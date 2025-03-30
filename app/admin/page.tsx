"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart4, Users, ShoppingBag, Tag, AlertCircle, CheckCircle, Loader2, ChevronRight } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AdminStats, getAdminStats, getAllUsers } from "@/services/admin"
import ProtectedRoute from "@/components/protected-route"
import UsersList from "@/components/admin/users-list"
import StatsCard from "@/components/admin/stats-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const { user, isAdmin, getAuthToken } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])

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
        console.log("🔍 Starting admin data fetch...")
        setIsLoading(true)
        setError(null)
        
        // Log authentication state
        console.log("🔐 Auth state:", { 
          isAuthenticated: !!user, 
          isAdmin, 
          tokenExists: !!(user?.token || user?.accessToken || getAuthToken())
        })
        
        // Get admin stats
        const statsResponse = await getAdminStats()
        console.log("📊 Admin stats response:", statsResponse)
        
        if (statsResponse.success) {
          console.log("✅ Stats fetched successfully:", statsResponse.data)
          setStats(statsResponse.data)
        } else {
          console.error("❌ Failed to fetch stats:", statsResponse.message)
          setError(statsResponse.message || "Failed to fetch admin statistics")
          toast({
            title: "Error",
            description: statsResponse.message || "Failed to fetch admin statistics",
            variant: "destructive"
          })
        }
        
        // Get users list
        console.log("👥 Fetching users...")
        const usersResponse = await getAllUsers()
        console.log("👤 Users response:", usersResponse)
        
        if (usersResponse.success) {
          setUsers(usersResponse.users || [])
        } else {
          console.error("❌ Failed to fetch users:", usersResponse.message)
          toast({
            title: "Warning",
            description: "Could not load users list",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("❌ Error fetching admin data:", error)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin && !isLoading) {
      fetchAdminData()
    }
  }, [isAdmin, user, router, toast, getAuthToken])

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
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Chargement des statistiques...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Utilisateurs"
                    value={stats?.totalUsers || 0}
                    description="Utilisateurs inscrits"
                    icon={<Users className="h-4 w-4" />}
                  />
                  
                  <StatsCard
                    title="Produits"
                    value={stats?.totalProducts || 0}
                    description="Produits publiés"
                    icon={<ShoppingBag className="h-4 w-4" />}
                  />
                  
                  <StatsCard
                    title="Catégories"
                    value={stats?.totalCategories || 0}
                    description="Catégories disponibles"
                    icon={<Tag className="h-4 w-4" />}
                  />
                  
                  <StatsCard
                    title="À Vérifier"
                    value={stats?.pendingListings || 0}
                    description="Produits en attente de vérification"
                    icon={<AlertCircle className="h-4 w-4" />}
                  />
                </div>
              )}
              
              {/* Add more overview content here like charts and recent activity */}
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <UsersList users={users} isLoading={isLoading} />
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

