"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getProductDetails } from "@/services/products"
import { useToast } from "@/components/ui/use-toast"
import SafeImage from "@/components/safe-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Star,
  Shield,
  Copy,
  PhoneCall,
  Facebook,
  Twitter,
  Linkedin,
  MessagesSquare,
  Smartphone,
  Loader2,
  AlertCircle,
  Package
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SEO from "@/components/seo"
import { ProductJsonLd } from "@/components/product-json-ld"
import { Advertisement } from '@/components/advertisement'
import ProtectedRoute from "@/components/protected-route"
import AuthLayout from "@/components/auth-layout"
import Navbar from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"

export default function ProductDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [publisherData, setPublisherData] = useState(null)

  useEffect(() => {
    setMounted(true)
    
    // Fetch product details
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        const productId = params?.id as string
        const response = await getProductDetails(productId)
        
        if (response.success) {
          console.log("Product details loaded:", response.product._id)
          setProduct(response.product)
        } else {
          throw new Error(response.message || "Failed to fetch product")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(true)
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du produit.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (mounted && params?.id) {
      fetchProductDetails()
    }
  }, [params?.id, toast, mounted])

  useEffect(() => {
    console.log("FULL PRODUCT DATA:", JSON.stringify(product, null, 2));
    console.log("Seller data availability:", {
      hasPublisher: !!product?.publisher,
      publisherData: product?.publisher,
      hasUser: !!product?.user,
      userData: product?.user
    });
  }, [product]);

  useEffect(() => {
    const fetchPublisherData = async () => {
      if (product && typeof product.publisher === 'string') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${product.publisher}`);
          if (response.ok) {
            const userData = await response.json();
            console.log("Fetched publisher data:", userData);
            setPublisherData(userData.user || userData);
          } else {
            console.error("Failed to fetch publisher data:", await response.text());
          }
        } catch (error) {
          console.error("Error fetching publisher data:", error);
        }
      }
    };

    fetchPublisherData();
  }, [product]);

  // Initial loading or not yet mounted
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }

  // The content to be rendered inside either layout
  const pageContent = (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : error || !product ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Produit non trouvé</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Ce produit n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/products">Voir tous les produits</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* SEO metadata */}
          <SEO
            title={`${product.title} - ${product.price} DT | Moutouri`}
            description={product.description?.slice(0, 160) || "Détails du produit"}
            ogImage={product.images?.[0]}
          />
          
          {/* Product JSON-LD */}
          <ProductJsonLd 
            product={product} 
            url={`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/products/${product._id}`}
          />
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm mb-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />
            <Link href="/products" className="text-muted-foreground hover:text-foreground">
              Produits
            </Link>
            <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />
            <span className="font-medium">{product.title}</span>
          </div>

          {/* Product details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Images */}
            <div className="lg:col-span-2">
              {/* Main product details card */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Image gallery */}
                  <div className="relative aspect-[4/3] bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <SafeImage
                          src={product.images[currentImageIndex]}
                          alt={product.title}
                          fill
                          className="object-contain"
                        />
                        
                        {/* Navigation arrows if multiple images */}
                        {product.images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/50 hover:bg-background/80"
                              onClick={() => setCurrentImageIndex((prev) => 
                                prev === 0 ? product.images.length - 1 : prev - 1
                              )}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/50 hover:bg-background/80"
                              onClick={() => setCurrentImageIndex((prev) => 
                                prev === product.images.length - 1 ? 0 : prev + 1
                              )}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </Button>
                            
                            {/* Image counter */}
                            <div className="absolute bottom-2 right-2 bg-background/70 text-foreground rounded-full text-xs px-2 py-1">
                              {currentImageIndex + 1} / {product.images.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-24 w-24 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail navigation */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex overflow-x-auto gap-2 p-2 hide-scrollbar">
                      {product.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          className={`relative min-w-[80px] h-[60px] rounded overflow-hidden ${
                            index === currentImageIndex ? 'ring-2 ring-primary' : 'opacity-70'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <SafeImage
                            src={image}
                            alt={`${product.title} - image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            
              {/* Advertisement */}
              <Advertisement position="product-detail" className="my-6" />

              {/* Product details tabs */}
              <Card className="mt-6">
                <Tabs defaultValue="description">
                  <CardHeader className="pb-0">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="details">Caractéristiques</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <TabsContent value="description">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Description</h3>
                        <p className="whitespace-pre-line">{product.description}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="details">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Caractéristiques</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">Cylindrée</dt>
                            <dd>{product.cylinder} cc</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">Année</dt>
                            <dd>{product.year}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">Kilométrage</dt>
                            <dd>{product.kilometrage} km</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">État</dt>
                            <dd className="capitalize">{product.condition}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">Lieu</dt>
                            <dd>{product.location}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-muted-foreground">Date de publication</dt>
                            <dd>{new Date(product.createdAt).toLocaleDateString()}</dd>
                          </div>
                        </dl>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
            
            {/* Right column - Price & Contact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{product.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {product.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-primary">{product.price} DT</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs font-normal">
                        {product.condition === "new" ? "Neuf" :
                         product.condition === "excellent" ? "Excellent" : 
                         product.condition === "good" ? "Bon état" : 
                         product.condition === "fair" ? "État moyen" : 
                         product.condition}
                      </Badge>
                      <div className="ml-auto flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button onClick={() => setContactDialogOpen(true)} className="gap-2">
                      <Phone className="h-4 w-4" />
                      Contacter le vendeur
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setShareDialogOpen(true)}>
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Vendeur</h4>
                    {(() => {
                      // Access seller information
                      const seller = product.publisher || product.user;
                      
                      return (
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={seller?.image} alt={seller?.firstName} />
                            <AvatarFallback>
                              {seller?.firstName?.[0]}{seller?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              {seller?.firstName} {seller?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Membre depuis {new Date(seller?.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Contact</h4>
                    {(() => {
                      // Access seller for contact information
                      const seller = product.publisher || product.user;
                      
                      return (
                        <div className="space-y-2">
                          {seller?.phone ? (
                            <div className="flex">
                              <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => {
                                  if (seller?.phone) {
                                    navigator.clipboard.writeText(seller.phone);
                                    toast?.({
                                      title: "Numéro copié !",
                                      description: "Numéro de téléphone copié avec succès.",
                                    });
                                  }
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copier le numéro
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Numéro de téléphone non disponible
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Conseils de Sécurité</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Rencontrez-vous dans un lieu public</li>
                  <li>• Ne payez pas à l'avance</li>
                  <li>• Inspectez l'article avant d'acheter</li>
                  <li>• Vérifiez tous les documents</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dialog components */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter le vendeur</DialogTitle>
            <DialogDescription>
              Vous pouvez contacter {product?.publisher?.firstName} {product?.publisher?.lastName} par téléphone.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog content */}
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager ce produit</DialogTitle>
            <DialogDescription>
              Partagez "{product?.title}" avec vos amis ou sur les réseaux sociaux.
            </DialogDescription>
          </DialogHeader>
          {/* Dialog content */}
        </DialogContent>
      </Dialog>
    </div>
  )

  // Choose the appropriate layout based on authentication
  if (isAuthenticated) {
    // Use dashboard layout for authenticated users
    return <AuthLayout>{pageContent}</AuthLayout>
  }
  
  // Use simpler layout for guests
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {pageContent}
      </main>
    </div>
  )
}