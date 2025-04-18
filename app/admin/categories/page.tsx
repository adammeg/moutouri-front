"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
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
        console.log("Categories received:", response.categories)
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
  
  // Helper function to get complete image URL
  const getCategoryImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // If it's a relative path without leading slash, add it
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    
    // Add the categories folder prefix if it's not already there
    if (!normalizedPath.includes('/categories/')) {
      return `${IMAGE_BASE_URL}categories${normalizedPath}`
    } else {
      return `${IMAGE_BASE_URL}${normalizedPath.replace(/^\//, '')}`
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
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
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
          title: "Succès",
          description: "Catégorie créée avec succès",
        })
        
        // Reset form
        setNewCategory({
          name: "",
          description: "",
        })
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
  
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category)
    // If the category has an image, set it for preview
    if (category.image) {
      setImagePreview(getCategoryImageUrl(category.image))
    } else {
      setImagePreview(null)
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
      formData.append("isActive", categoryToEdit.isActive ? "true" : "false")
      
      if (categoryImage) {
        formData.append("image", categoryImage)
      }
      
      const response = await updateCategory(categoryToEdit._id, formData)
      
      if (response.success) {
        toast({
          title: "Succès",
          description: "Catégorie mise à jour avec succès",
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
          title: "Succès",
          description: "Catégorie supprimée avec succès",
        })
        
        // Reset state
        setCategoryToDelete(null)
        
        // Refresh categories
        fetchCategories()
      } else {
        throw new Error(response.message || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestion des Catégories</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie pour organiser vos produits.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Nom de la catégorie"
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
                    <Label htmlFor="image">Image</Label>
                    
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
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des catégories...</span>
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  Aucune catégorie trouvée. Ajoutez votre première catégorie pour commencer.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category._id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-xl">{category.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-4">
                      {category.image ? (
                        <img
                          src={getCategoryImageUrl(category.image) || ''}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image for category: ${category.name}`, { 
                              originalPath: category.image,
                              constructedPath: getCategoryImageUrl(category.image)
                            });
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {category.description || "Aucune description"}
                    </p>
                    
                    <div className="flex justify-end space-x-2">
                      {/* Edit Dialog */}
                      <Dialog open={categoryToEdit?._id === category._id} onOpenChange={(open) => {
                        if (!open) {
                          setCategoryToEdit(null);
                          setCategoryImage(null);
                          setImagePreview(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent>
                          {categoryToEdit && (
                            <form onSubmit={handleUpdateCategory} className="space-y-4">
                              <DialogHeader>
                                <DialogTitle>Modifier la Catégorie</DialogTitle>
                                <DialogDescription>
                                  Mettez à jour les informations de la catégorie.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Nom <span className="text-red-500">*</span></Label>
                                <Input
                                  id="edit-name"
                                  value={categoryToEdit.name}
                                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                                  placeholder="Nom de la catégorie"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={categoryToEdit.description || ""}
                                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, description: e.target.value })}
                                  placeholder="Description de la catégorie"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-active"
                                  checked={categoryToEdit.isActive}
                                  onCheckedChange={(checked) => setCategoryToEdit({ ...categoryToEdit, isActive: checked })}
                                />
                                <Label htmlFor="edit-active">Active</Label>
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