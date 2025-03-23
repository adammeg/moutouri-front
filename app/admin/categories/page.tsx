"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/categories"
import ProtectedRoute from "@/components/protected-route"
import { IMAGE_BASE_URL } from "@/config/config"

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  })
  
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  useEffect(() => {
    // Redirect non-admin users
    if (user && !isAdmin) {
      router.push("/dashboard")
    }
    
    fetchCategories()
  }, [user, isAdmin, router])
  
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await getCategories()
      
      if (response.success) {
        console.log("Categories received:", response.categories);
        // Log the image paths to debug
        response.categories.forEach((cat: Category) => {
          console.log(`Category: ${cat.name}, Image path: ${cat.image}`);
        });
        
        setCategories(response.categories)
      } else {
        throw new Error(response.message || "Failed to load categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setCategoryImage(file)
      
      // Preview image
      setImagePreview(URL.createObjectURL(file))
    }
  }
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCategory.name) {
      toast({
        title: "Champ requis",
        description: "Le nom de la catégorie est requis.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("name", newCategory.name)
      formData.append("description", newCategory.description)
      
      if (categoryImage) {
        formData.append("image", categoryImage)
      }
      
      const response = await createCategory(formData)
      
      if (response.success) {
        toast({
          title: "Catégorie créée",
          description: "La catégorie a été créée avec succès.",
        })
        
        // Reset form
        setNewCategory({ name: "", description: "" })
        setCategoryImage(null)
        setImagePreview(null)
        
        // Refresh categories
        fetchCategories()
      } else {
        throw new Error(response.message || "Failed to create category")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryToEdit) return
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("name", categoryToEdit.name)
      formData.append("description", categoryToEdit.description || "")
      formData.append("isActive", String(categoryToEdit.isActive))
      
      if (categoryImage) {
        formData.append("image", categoryImage)
      }
      
      const response = await updateCategory(categoryToEdit._id, formData)
      
      if (response.success) {
        toast({
          title: "Catégorie mise à jour",
          description: "La catégorie a été mise à jour avec succès.",
        })
        
        // Reset form
        setCategoryToEdit(null)
        setCategoryImage(null)
        setImagePreview(null)
        
        // Refresh categories
        fetchCategories()
      } else {
        throw new Error(response.message || "Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      setIsSubmitting(true)
      
      const response = await deleteCategory(categoryToDelete)
      
      if (response.success) {
        toast({
          title: "Catégorie supprimée",
          description: "La catégorie a été supprimée avec succès.",
        })
        
        // Refresh categories
        fetchCategories()
      } else {
        throw new Error(response.message || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer la catégorie. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setCategoryToDelete(null)
    }
  }
  
  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category)
    setImagePreview(category.image ? `${IMAGE_BASE_URL}${category.image}` : null)
    setCategoryImage(null)
  }
  
  if (!isAdmin) {
    return null
  }
  
  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
              <p className="text-muted-foreground">
                Gérez les catégories de produits de la plateforme
              </p>
            </div>
            
            {/* Add Category Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une Catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie de produits pour organiser les annonces.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la catégorie *</Label>
                    <Input 
                      id="name" 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="ex: Scooters" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Description de la catégorie" 
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image (optionnelle)</Label>
                    {imagePreview && (
                      <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden border">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryImage(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 rounded-full bg-primary p-1 text-primary-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {!imagePreview && (
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-md border border-dashed hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image</p>
                        </div>
                        <input 
                          type="file" 
                          id="image" 
                          className="hidden"
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        'Créer la Catégorie'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category._id}>
                  <CardHeader className="p-0">
                    <div className="relative h-40 w-full">
                      {category.image && (
                        <div className="relative w-full h-40 rounded-md overflow-hidden mb-4">
                          <img 
                            src={`${IMAGE_BASE_URL}categories/${category.image}`} 
                            alt={category.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-md" />
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <CardTitle className="text-xl font-bold">
                          {category.name}
                        </CardTitle>
                        <p className="text-xs text-white/70">Slug: {category.slug}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description || "Aucune description disponible"}
                    </p>
                    
                    <div className="flex justify-end gap-2">
                      {/* Edit Dialog */}
                      <Dialog open={!!categoryToEdit && categoryToEdit._id === category._id} onOpenChange={(open) => {
                        if (!open) setCategoryToEdit(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(category)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Modifier la catégorie</DialogTitle>
                            <DialogDescription>
                              Modifiez les détails de la catégorie.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {categoryToEdit && (
                            <form onSubmit={handleUpdateCategory} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Nom de la catégorie *</Label>
                                <Input 
                                  id="edit-name" 
                                  value={categoryToEdit.name}
                                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                                  placeholder="ex: Scooters" 
                                  required 
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea 
                                  id="edit-description" 
                                  value={categoryToEdit.description || ''}
                                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, description: e.target.value })}
                                  placeholder="Description de la catégorie" 
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="active" 
                                  checked={categoryToEdit.isActive}
                                  onCheckedChange={(checked) => setCategoryToEdit({ ...categoryToEdit, isActive: checked })}
                                />
                                <Label htmlFor="active">Catégorie active</Label>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-image">Image</Label>
                                {imagePreview && (
                                  <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden border">
                                    <img 
                                      src={imagePreview} 
                                      alt="Preview" 
                                      className="object-cover w-full h-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCategoryImage(null)
                                        setImagePreview(null)
                                      }}
                                      className="absolute top-2 right-2 rounded-full bg-primary p-1 text-primary-foreground"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                
                                {!imagePreview && (
                                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-md border border-dashed hover:bg-muted transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                      <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image</p>
                                    </div>
                                    <input 
                                      type="file" 
                                      id="edit-image" 
                                      className="hidden"
                                      accept="image/*" 
                                      onChange={handleImageChange}
                                    />
                                  </label>
                                )}
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Mise à jour...
                                    </>
                                  ) : (
                                    'Enregistrer les Modifications'
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {/* Delete Dialog */}
                      <AlertDialog open={categoryToDelete === category._id} onOpenChange={(open) => {
                        if (!open) setCategoryToDelete(null)
                      }}>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setCategoryToDelete(category._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                        
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Cela supprimera définitivement la catégorie "{category.name}".
                              <br /><br />
                              Attention: Si des produits sont associés à cette catégorie, vous ne pourrez pas la supprimer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              disabled={isSubmitting}
                              onClick={handleDeleteCategory}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Suppression...
                                </>
                              ) : (
                                'Supprimer'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 