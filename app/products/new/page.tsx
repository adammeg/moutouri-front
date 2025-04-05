"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload, X } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createProductWithImages } from "@/services/client-products"
import ProtectedRoute from "@/components/protected-route"
import axios from "axios"
import { getCategories } from "@/services/categories"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "motorcycle",
    condition: "new",
    year: new Date().getFullYear().toString(),
    mileage: "",
    engineSize: "",
    color: "",
    location: ""
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const newImages = [...images, ...files].slice(0, 10) // Limit to 10 images
      setImages(newImages)
      
      // Create preview URLs
      const newPreviews = newImages.map(file => URL.createObjectURL(file))
      
      // Revoke previous object URLs to avoid memory leaks
      imagesPreviews.forEach(url => URL.revokeObjectURL(url))
      setImagesPreviews(newPreviews)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    
    // Update previews
    URL.revokeObjectURL(imagesPreviews[index])
    const newPreviews = [...imagesPreviews]
    newPreviews.splice(index, 1)
    setImagesPreviews(newPreviews)
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagesPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagesPreviews])

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories || []);
        console.log(response.categories)
        console.log(response)
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    };
    
    fetchCategories();
  }, [toast]);

  // Add validation before submitting
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title) errors.title = "Le titre est requis";
    if (!formData.description) errors.description = "La description est requise";
    if (!formData.price || Number(formData.price) <= 0) errors.price = "Un prix valide est requis";
    if (!formData.category) errors.category = "La catégorie est requise";
    if (!formData.condition) errors.condition = "L'état est requis";
    if (!formData.year || Number(formData.year) <= 0) errors.year = "L'année est requise";
    if (!formData.mileage || Number(formData.mileage) < 0) errors.kilometrage = "Le kilométrage est requis";
    if (!formData.engineSize || Number(formData.engineSize) <= 0) errors.cylinder = "La cylindrée est requise";
    if (!formData.color) errors.color = "La couleur est requise";
    if (!formData.location) errors.location = "La localisation est requise";
    if (images.length === 0) errors.images = "Veuillez ajouter au moins une image";
    
    return errors;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Make sure we have at least one image
      if (images.length === 0) {
        toast({
          title: "Image requise",
          description: "Veuillez ajouter au moins une image du produit",
          variant: "destructive",
        });
        return;
      }
      
      // Create a complete product object with all required fields
      const productData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition || 'Used',  // Provide default value
        location: formData.location,
        year: formData.year || '2023',  // Add required field
        kilometrage: formData.mileage || '0',  // Add required field
        cylinder: formData.engineSize || '0',  // Add required field
      };
      
      console.log("Submitting product data:", productData);
      
      // Pass both the product data and images to the create function
      const result = await createProductWithImages({
        ...productData,
        location: formData.location, // Use the string location from formData instead of Location object
      }, images);
      
      if (result.success) {
      toast({
          title: "Produit créé",
          description: "Votre annonce a été publiée avec succès",
        });
        
        router.push(`/products/${result.product._id}`);
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de la création du produit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du produit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publier une Nouvelle Annonce</h1>
          <p className="text-muted-foreground">Créez une annonce détaillée pour attirer des acheteurs potentiels</p>
        </div>
        <Separator />

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Catégorie du Produit</CardTitle>
              <CardDescription>Sélectionnez la catégorie qui décrit le mieux votre produit</CardDescription>
            </CardHeader>
            <CardContent>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails du Produit</CardTitle>
              <CardDescription>Fournissez des informations détaillées sur votre produit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                  <Input 
                    id="title" 
                    placeholder="ex: Ducati Panigale V4 2023" 
                    value={formData.title}
                    onChange={handleChange}
                    required 
                  />
                <p className="text-sm text-muted-foreground">
                  Soyez précis et incluez des détails clés comme la marque, le modèle et l'année
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (DT)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.price}
                      onChange={handleChange}
                      required 
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">État</Label>
                    <Select 
                      value={formData.condition}
                      onValueChange={(value) => handleSelectChange('condition', value)}
                    >
                      <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neuf</SelectItem>
                        <SelectItem value="like-new">Comme neuf</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Bon</SelectItem>
                      <SelectItem value="fair">Correct</SelectItem>
                        <SelectItem value="salvage">Pour pièces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year">Année</Label>
                    <Input 
                      id="year" 
                      type="number" 
                      min="1900" 
                      max={new Date().getFullYear()} 
                      placeholder={new Date().getFullYear().toString()}
                      value={formData.year}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Kilométrage (km)</Label>
                    <Input 
                      id="mileage" 
                      type="number" 
                      min="0" 
                      placeholder="0"
                      value={formData.mileage}
                      onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="engineSize">Cylindrée (cc)</Label>
                    <Input 
                      id="engineSize" 
                      placeholder="ex: 1000"
                      value={formData.engineSize}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="color">Couleur</Label>
                    <Input 
                      id="color" 
                      placeholder="ex: Rouge"
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre produit en détail..."
                  className="min-h-[200px]"
                    value={formData.description}
                    onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Incluez l'état, les caractéristiques, l'historique et la raison de la vente
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images du Produit</CardTitle>
              <CardDescription>Ajoutez des images de haute qualité de votre produit (jusqu'à 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagesPreviews.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md border overflow-hidden group">
                    <img
                        src={image}
                      alt={`Image du produit ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Supprimer l'image</span>
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                    <label className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors cursor-pointer">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ajouter une Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange} 
                        className="sr-only"
                      />
                    </label>
                )}
              </div>
              {images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Aucune image ajoutée</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez des images de haute qualité pour attirer plus d'acheteurs
                  </p>
                    <label>
                      <Button type="button" variant="outline">
                    Ajouter des Images
                  </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange} 
                        className="sr-only"
                      />
                    </label>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                La première image sera utilisée comme image principale de votre annonce
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
              <CardDescription>
                Indiquez votre localisation pour aider les acheteurs à trouver votre annonce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                  <Input 
                    id="location" 
                    placeholder="ex: Tunis, TN" 
                    value={formData.location}
                    onChange={handleChange}
                    required 
                  />
              </div>
            </CardContent>
          </Card>

          <CardFooter className="flex justify-end gap-4 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publication en cours..." : "Publier l'Annonce"}
            </Button>
          </CardFooter>
        </form>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}

