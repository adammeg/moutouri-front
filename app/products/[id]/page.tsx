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
  Package,
  Check
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog-compat"
import SEO from "@/components/seo"
import { ProductJsonLd } from "@/components/product-json-ld"
import { Advertisement } from '@/components/advertisement'
import ProtectedRoute from "@/components/protected-route"
import AuthLayout from "@/components/auth-layout"
import Navbar from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
  const [shareUrl, setShareUrl] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [product])

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
            url={`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/products/${product.title}`}
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
                      const seller = product.user;
                      
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
                              {product.user.firstName} {product.user.lastName}
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
                      const seller = product.user;
                      
                      return (
                        <div className="space-y-2">
                          {product.user.phone ? (
                            <div className="flex">
                              <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => {
                                  if (product.user.phone) {
                                    navigator.clipboard.writeText(product.user.phone);
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

      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter le vendeur</DialogTitle>
            <DialogDescription>
              Vous pouvez contacter {product?.user?.firstName} {product?.user?.lastName} par téléphone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {product?.user?.phone ? (
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.user.phone}</p>
                    <p className="text-xs text-muted-foreground">Numéro de téléphone</p>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    window.location.href = `tel:${product.user.phone}`;
                  }}
                >
                  Appeler
                </Button>
              </div>
            ) : (
              <div className="flex items-center p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">Le vendeur n'a pas partagé son numéro de téléphone.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4 sm:mt-6">
            <DialogClose asChild>
              <Button>Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Product Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager ce produit</DialogTitle>
            <DialogDescription>
              Partagez "{product?.title}" avec vos amis ou sur les réseaux sociaux.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Copy link */}
            <div className="flex space-x-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={() => handleCopyLink(shareUrl, setCopySuccess, toast)}
              >
                {copySuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Social sharing */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => handleShare(product, "facebook", setShareDialogOpen, toast)}
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => handleShare(product, "twitter", setShareDialogOpen, toast)}
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => handleShare(product, "whatsapp", setShareDialogOpen, toast)}
              >
                <span className="text-green-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                WhatsApp
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button>Fermer</Button>
            </DialogClose>
          </DialogFooter>
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

async function handleCopyLink(
  shareUrl: string, 
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>, 
  toast: any
) {
  try {
    await navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papiers",
    });
  } catch (err) {
    console.error("Failed to copy:", err);
    toast({
      title: "Échec de la copie",
      description: "Impossible de copier le lien",
      variant: "destructive",
    });
  }
}

function handleShare(
  product: { title?: string; id?: string },
  platform: string,
  setShareDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  toast: any
) {
  if (!product) return;

  const title = product.title || "Produit sur Moutouri";
  let shareLink = "";

  switch (platform) {
    case "facebook":
      const facebookShareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moutouri.com'}/products/${product.id}`;
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookShareUrl)}`;
      break;
    case "twitter":
      const twitterShareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moutouri.com'}/products/${product.id}`;
      shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(twitterShareUrl)}`;
      break;
    case "whatsapp":
      const whatsappShareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://moutouri.com'}/products/${product.id}`;
      shareLink = `https://wa.me/?text=${encodeURIComponent(title + ' ' + whatsappShareUrl)}`;
      break;
    default:
      return;
  }

  window.open(shareLink, '_blank', 'noopener,noreferrer');
}