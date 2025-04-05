 "use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, UploadIcon } from "lucide-react"
import Image from "next/image"

import DashboardLayout from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from 'date-fns/locale'
import { useAuth } from "@/contexts/auth-context"
import { createAd } from "@/services/ads"
import ProtectedRoute from "@/components/protected-route"

export default function CreateAdPage() {
  const router = useRouter()
  const { getAuthToken } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adTitle, setAdTitle] = useState("")
  const [adDescription, setAdDescription] = useState("")
  const [adLink, setAdLink] = useState("")
  const [adPosition, setAdPosition] = useState("")
  const [adIsActive, setAdIsActive] = useState(true)
  const [adStartDate, setAdStartDate] = useState<Date>(new Date())
  const [adEndDate, setAdEndDate] = useState<Date | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [adImage, setAdImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAdImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adTitle || !adDescription || !adPosition || !adImage) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter une image",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const token = getAuthToken()
      
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Votre session a expiré, veuillez vous reconnecter",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("title", adTitle)
      formData.append("description", adDescription)
      formData.append("position", adPosition)
      formData.append("isActive", String(adIsActive))
      formData.append("startDate", adStartDate.toISOString())
      
      if (adEndDate) {
        formData.append("endDate", adEndDate.toISOString())
      }
      
      if (adLink) {
        formData.append("link", adLink)
      }
      
      if (adImage) {
        formData.append("image", adImage)
      }

      const response = await createAd(formData, token)
      
      if (response.success) {
        toast({
          title: "Annonce créée",
          description: "L'annonce publicitaire a été créée avec succès",
        })
        router.push("/admin?tab=ads")
      } else {
        throw new Error(response.message || "Erreur lors de la création de l'annonce")
      }
    } catch (error) {
      console.error("Error creating ad:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Créer une nouvelle publicité</h1>
            <p className="text-muted-foreground">
              Configurez votre publicité qui sera affichée sur la plateforme
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informations de la publicité</CardTitle>
                <CardDescription>
                  Entrez les détails de votre annonce publicitaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      placeholder="Titre de la publicité"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
                    <Select
                      value={adPosition}
                      onValueChange={setAdPosition}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home-hero">Bannière page d'accueil</SelectItem>
                        <SelectItem value="home-middle">Milieu de page d'accueil</SelectItem>
                        <SelectItem value="home-bottom">Bas de page d'accueil</SelectItem>
                        <SelectItem value="sidebar">Barre latérale</SelectItem>
                        <SelectItem value="product-page">Page produit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder="Description de la publicité"
                      value={adDescription}
                      onChange={(e) => setAdDescription(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="link">Lien (optionnel)</Label>
                    <Input
                      id="link"
                      placeholder="https://exemple.com"
                      value={adLink}
                      onChange={(e) => setAdLink(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Statut</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={adIsActive}
                        onCheckedChange={setAdIsActive}
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">
                        {adIsActive ? "Active" : "Inactive"}
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date de début <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {adStartDate ? format(adStartDate, 'PPP', { locale: fr }) : "Sélectionnez une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={adStartDate}
                          onSelect={(date) => date && setAdStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date de fin (optionnelle)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {adEndDate ? format(adEndDate, 'PPP', { locale: fr }) : "Aucune date de fin"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={adEndDate || undefined}
                          onSelect={setAdEndDate}
                          fromDate={adStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Image <span className="text-red-500">*</span></Label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    required
                  />
                  
                  {imagePreview ? (
                    <div className="relative aspect-[3/1] w-full max-w-md mx-auto border rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => {
                          setAdImage(null);
                          setImagePreview(null);
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center w-full aspect-[3/1] max-w-md mx-auto rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Cliquez pour sélectionner une image</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG ou WebP (ratio 3:1 recommandé)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création en cours..." : "Créer la publicité"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}