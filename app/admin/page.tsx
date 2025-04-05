"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, Package, CreditCard, BarChart3, ListFilter, 
  ShieldAlert, Calendar, ArrowUpRight, ArrowDownRight,
  Activity, RefreshCcw, Search, Download, FileSpreadsheet,
  Filter
} from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getAdminStats } from "@/services/admin"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import StatsCard from "@/components/admin/stats-card"
import UsersList from "@/components/admin/users-list"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Create a chart component
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Define a proper interface for the AdminStats type
interface AdminStatsData {
  totalUsers: number;
  totalProducts: number;
  totalViews: number;
  systemAlerts: number;
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
  users: Array<any>; // Use a more specific type if possible
  totalCategories: number;
  pendingListings: number;
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")
  const [productFilter, setProductFilter] = useState("all")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await getAdminStats()
        if (response.success) {
          setStats(response.data)
        } else {
          console.error("Failed to fetch admin stats:", response.message)
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, timeframe])

  // Sample data for charts
  const salesData = [
    { name: "Lun", value: 1200 },
    { name: "Mar", value: 1900 },
    { name: "Mer", value: 1500 },
    { name: "Jeu", value: 2100 },
    { name: "Ven", value: 2400 },
    { name: "Sam", value: 2800 },
    { name: "Dim", value: 1800 },
  ]

  const categoryData = [
    { name: "Motos", value: 42 },
    { name: "Scooters", value: 28 },
    { name: "Pièces", value: 15 },
    { name: "Accessoires", value: 10 },
    { name: "Autres", value: 5 },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const recentUsers = stats?.recentUsers || []
  const recentProducts = stats?.recentProducts || []

  return (
    <ProtectedRoute adminOnly>
    <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble et gestion de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Utilisateurs totaux"
                value={isLoading ? "..." : stats?.totalUsers as number || 0}
                description="+12% par rapport au mois dernier"
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Produits publiés"
                value={isLoading ? "..." : stats?.totalProducts || 0}
                description="+8% par rapport au mois dernier"
                icon={<Package className="h-4 w-4" />}
              />
              <StatsCard
                title="Vues des produits"
                value={isLoading ? "..." : (stats?.totalViews || 0).toLocaleString()}
                description="+24% par rapport au mois dernier"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <StatsCard
                title="Alertes système"
                value={isLoading ? "..." : stats?.systemAlerts || 0}
                description="2 nécessitent une attention"
                icon={<ShieldAlert className="h-4 w-4" />}
              />
            </div>
            
            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
                <CardHeader>
                  <CardTitle>Activité de la plateforme</CardTitle>
                  <CardDescription>Vues et publications par jour</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            name="Vues"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#82ca9d" 
                            name="Publications"
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
            </CardContent>
          </Card>
              
          <Card>
                <CardHeader>
                  <CardTitle>Répartition des catégories</CardTitle>
                  <CardDescription>Distribution des produits par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
            </CardContent>
          </Card>
            </div>
            
            {/* Recent Activity Tables */}
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Derniers utilisateurs</CardTitle>
                    <CardDescription>Utilisateurs récemment inscrits</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
                    Voir tout
                  </Button>
            </CardHeader>
            <CardContent>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {recentUsers.slice(0, 5).map((user: { _id: string; image?: string; firstName?: string; lastName?: string; email: string; role: string }) => (
                        <div key={user._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={user.image} />
                              <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                            {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>
          </Card>
              
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Derniers produits</CardTitle>
                    <CardDescription>Produits récemment publiés</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
                    Voir tout
                  </Button>
            </CardHeader>
            <CardContent>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {recentProducts.slice(0, 5).map((product: { _id: string; images?: string[]; title: string; price: number; isVerified: boolean }) => (
                        <div key={product._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="rounded-md h-10 w-10">
                              <AvatarImage src={product.images?.[0]} className="object-cover" />
                              <AvatarFallback className="rounded-md">P</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{product.title}</p>
                              <p className="text-xs text-muted-foreground">{product.price.toLocaleString()} TND</p>
                            </div>
                          </div>
                          <Badge variant={product.isVerified ? 'default' : 'outline'} className={product.isVerified ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                            {product.isVerified ? 'Vérifié' : 'En attente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Gérez les utilisateurs de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList 
                  users={stats?.users || []} 
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Gestion des produits</CardTitle>
                  <CardDescription>Contrôlez les annonces publiées sur la plateforme</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits</SelectItem>
                      <SelectItem value="verified">Vérifiés</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="featured">Mis en avant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres avancés
                  </Button>
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
                        <TableHead>Publié le</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Skeleton className="h-10 w-10 rounded" />
                                <Skeleton className="h-4 w-[140px]" />
                  </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        (stats?.recentProducts || []).map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="rounded-md h-10 w-10">
                                  <AvatarImage src={product.images?.[0]} className="object-cover" />
                                  <AvatarFallback className="rounded-md">P</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{product.title}</span>
                        </div>
                            </TableCell>
                            <TableCell>
                              {product.category?.name || 'Non catégorisé'}
                            </TableCell>
                            <TableCell>{product.price.toLocaleString()} TND</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <span>Utilisateur</span>
                        </div>
                            </TableCell>
                            <TableCell>
                              {product.createdAt ? format(new Date(product.createdAt), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.isVerified ? 'default' : 'outline'} className={product.isVerified ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                                {product.isVerified ? 'Vérifié' : 'En attente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Voir
                  </Button>
                              <Button variant="outline" size="sm" className={product.isVerified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}>
                                {product.isVerified ? 'Suspendre' : 'Approuver'}
                  </Button>
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
                  Affichage de <strong>1-10</strong> sur <strong>{stats?.totalProducts || 0}</strong> produits
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>Précédent</Button>
                  <Button variant="outline" size="sm">Suivant</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytiques détaillées</CardTitle>
                <CardDescription>Métriques et statistiques de votre plateforme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                      <div className="text-2xl font-bold">4.2%</div>
                      <div className="flex items-center pt-1 text-xs text-green-500">
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                        <span>+0.5% depuis le mois dernier</span>
                </div>
              </CardContent>
            </Card>
            <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Temps moyen sur page</CardTitle>
              </CardHeader>
              <CardContent>
                      <div className="text-2xl font-bold">2m 32s</div>
                      <div className="flex items-center pt-1 text-xs text-green-500">
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                        <span>+12s depuis le mois dernier</span>
                    </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Rebond</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">32.8%</div>
                      <div className="flex items-center pt-1 text-xs text-red-500">
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                        <span>+2.1% depuis le mois dernier</span>
                  </div>
                    </CardContent>
                  </Card>
                    </div>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Nombre de visiteurs" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
    </ProtectedRoute>
  )
}

