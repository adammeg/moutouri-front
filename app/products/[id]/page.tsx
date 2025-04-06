"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getProductDetails } from "@/services/products"
import { useToast } from "@/components/ui/use-toast"
import SafeImage from "@/components/safe-image"
import DashboardLayout from "@/components/dashboard-layout"
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

export default function ProductDetailsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        // Get the product ID from the URL params
        const productId = params?.id as string
        const response = await getProductDetails(productId)
        if (product) {
          console.log("Product seller data:", {
            hasPublisher: !!product.publisher,
            hasUser: !!product.user,
            contactData: product.publisher || product.user
          });
        }
        if (response.success) {
          console.log("Product data:", response.product)
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

    fetchProductDetails()
  }, [params?.id, toast, product])

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des détails du produit...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state
  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-5xl">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Produit introuvable</h2>
            <p className="mb-4">Nous n'avons pas pu trouver les détails de ce produit.</p>
            <Button asChild>
              <Link href="/products">Retour aux produits</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Functions to navigate images
  const nextImage = () => {
    if (product.images && product.images.length > 0) {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  // Updated function to show contact dialog instead of toast
  const handleContactSeller = () => {
    setContactDialogOpen(true)
  }

  const handleCallSeller = () => {
    if (product.publisher?.phone) {
      window.location.href = `tel:${product.publisher.phone}`
    } else {
      toast({
        title: "Numéro non disponible",
        description: "Le numéro de téléphone du vendeur n'est pas disponible.",
        variant: "destructive",
      })
    }
  }

  const handleCopyPhone = () => {
    if (product.publisher?.phone) {
      navigator.clipboard.writeText(product.publisher.phone)
      toast({
        title: "Numéro copié",
        description: "Le numéro de téléphone a été copié dans le presse-papiers.",
      })
    }
  }

  const handleCopyEmail = () => {
    if (product.publisher?.email) {
      navigator.clipboard.writeText(product.publisher.email)
    toast({
        title: "Email copié",
        description: "L'adresse email a été copiée dans le presse-papiers.",
    })
    }
  }

  const handleSaveProduct = () => {
    toast({
      title: "Produit sauvegardé",
      description: "Ce produit a été ajouté à vos articles sauvegardés.",
    })
  }

  const handleShareProduct = () => {
    setShareDialogOpen(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Lien copié",
      description: "Le lien du produit a été copié dans votre presse-papiers.",
    })
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Découvrez ${product.title} à ${product.price} DT`,
          url: window.location.href,
        })
        toast({
          title: "Partage réussi",
          description: "Le produit a été partagé avec succès.",
        })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          toast({
            title: "Erreur de partage",
            description: "Une erreur s'est produite lors du partage.",
            variant: "destructive",
          })
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Découvrez ${product.title} à ${product.price} DT`)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`
        break
      default:
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return 'Date inconnue'
    }
  }

  return (
    <DashboardLayout>
      {product && (
        <>
          <SEO 
            title={`${product.title} - ${product.price.toLocaleString()} DT | Moutouri`}
            description={product.description.substring(0, 160)}
            ogImage={product.images && product.images.length > 0 ? product.images[0] : '/og-image.png'}
            canonical={`/products/${product.title}`}
          />
          <ProductJsonLd 
            product={product}
            url={typeof window !== 'undefined' ? window.location.href : `https://moutouri.tn/products/${product.title}`}
          />
        </>
      )}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux Produits
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {product.category?.name || "Non catégorisé"}
              </Badge>
              <span className="text-muted-foreground flex items-center text-sm">
                <MapPin className="mr-1 h-3 w-3" />
                {product.location || "Emplacement non spécifié"}
              </span>
              <span className="text-muted-foreground flex items-center text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                Publié le {formatDate(product.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShareProduct}>
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[currentImageIndex]}
                    alt={`${product.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">Pas d'image disponible</span>
                    </div>
                  )}
                  
                  {product.images && product.images.length > 1 && (
                    <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 text-foreground hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Image précédente</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 text-foreground hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Image suivante</span>
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2 py-1 rounded-full bg-background/80">
                        {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-muted"}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <span className="sr-only">Voir image {index + 1}</span>
                      </button>
                    ))}
                  </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Description</TabsTrigger>
                <TabsTrigger value="features">Caractéristiques</TabsTrigger>
                <TabsTrigger value="seller">Vendeur</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Description du Produit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none dark:prose-invert">
                      <p>{product.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Caractéristiques Principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">État</p>
                        <p className="font-medium">{product.condition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Année</p>
                        <p className="font-medium">{product.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kilométrage</p>
                        <p className="font-medium">{product.kilometrage?.toLocaleString() || 0} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cylindrée</p>
                        <p className="font-medium">{product.cylinder} cc</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Couleur</p>
                        <p className="font-medium">{product.color}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium">{product.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="seller" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>À propos du Vendeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.publisher ? (
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                          <AvatarImage src={product.publisher.image} alt={product.publisher.firstName} />
                          <AvatarFallback>{product.publisher.firstName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {product.publisher.firstName} {product.publisher.lastName}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                            <span>Membre depuis {formatDate(product.publisher.createdAt)}</span>
                        </div>
                        </div>
                        <Advertisement 
            position="sidebar" 
            maxHeight={400}
          />
                      </div>
                      
                    ) : (
                      <p>Information sur le vendeur non disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{product.price?.toLocaleString() || 0} DT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">État</p>
                    <p className="font-medium">{product.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Année</p>
                    <p className="font-medium">{product.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilométrage</p>
                    <p className="font-medium">{product.kilometrage?.toLocaleString() || 0} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cylindrée</p>
                    <p className="font-medium">{product.cylinder} cc</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Couleur</p>
                    <p className="font-medium">{product.color}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleContactSeller}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contacter le Vendeur
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleSaveProduct}>
                    <Heart className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium mb-1">Conseils de Sécurité</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Rencontrez-vous dans un lieu public</li>
                    <li>• Ne payez pas à l'avance</li>
                    <li>• Inspectez l'article avant d'acheter</li>
                    <li>• Vérifiez tous les documents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter le vendeur</DialogTitle>
            <DialogDescription>
              Vous pouvez contacter {product?.publisher?.firstName} {product?.publisher?.lastName} par téléphone ou email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {product?.publisher?.phone ? (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 rounded-md border px-3 py-2">
                    {product.publisher.phone}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyPhone}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="icon" onClick={handleCallSeller}>
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Numéro de téléphone non disponible</p>
            )}
            
            {product?.publisher?.email && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 rounded-md border px-3 py-2">
                    {product.publisher.email}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyEmail}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="icon" 
                    onClick={() => window.location.href = `mailto:${product.publisher.email}`}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Pour votre sécurité, ne partagez jamais vos informations bancaires et privilégiez les rencontres dans des lieux publics.
            </p>
          </div>
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
          
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex justify-start items-center gap-2" 
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              Copier le lien
            </Button>
            
            {typeof navigator !== 'undefined' && (
              <Button 
                variant="outline" 
                className="flex justify-start items-center gap-2"
                onClick={handleNativeShare}
              >
                <Smartphone className="h-4 w-4" />
                Partager sur votre appareil
              </Button>
            )}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex justify-start items-center gap-2"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              

              

              
              <Button 
                variant="outline" 
                className="flex justify-start items-center gap-2"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <MessagesSquare className="h-4 w-4 text-green-500" />
                WhatsApp
              </Button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Le lien partagé dirigera vers cette page de détails du produit.</p>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

