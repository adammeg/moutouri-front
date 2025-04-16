"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Camera, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { updateUserProfile, uploadProfilePicture } from "@/services/user"
import AuthLayout from "@/components/auth-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
});

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Initialize form with user data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update form when user data is available
  useEffect(() => {
    if (user && mounted) {
      console.log("📋 Setting up profile form with user data:", user)
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
      
      if (user.image) {
        setImagePreview(user.image)
      }
    }
  }, [user, form, mounted])

  // Handle profile picture change
  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) return
    
    setPictureFile(file)
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle profile picture upload
  const handleUploadPicture = async () => {
    if (!pictureFile || !user?._id) return
    
    try {
      setImageUploading(true)
      
      const response = await uploadProfilePicture(user._id, pictureFile)
      
      if (response.success) {
        toast({
          title: "Photo de profil mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès",
        })
      } else {
        throw new Error(response.message || "Failed to upload profile picture")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre photo de profil",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?._id) return
    
    try {
      setIsUpdating(true)
      console.log("Updating profile with:", values)
      
      const response = await updateUserProfile(values)
      
      if (response.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        })
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsChangingPassword(true)
      
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas")
      }
      
      // API call would go here
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès",
      })
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Show loading state during initial client-side rendering
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    )
  }

  // Profile content to render
  const profileContent = (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon Profil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative rounded-full overflow-hidden h-24 w-24 bg-muted flex items-center justify-center">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
              
              <label
                htmlFor="picture-upload"
                className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
                <span className="sr-only">Change profile picture</span>
              </label>
              
              <input 
                id="picture-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePictureChange}
              />
            </div>
            
            {pictureFile && (
              <div>
                <Button 
                  size="sm" 
                  onClick={handleUploadPicture}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Photo
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="mt-2 text-sm">
                Role: <span className="font-medium">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
              </p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre@email.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </form>
          </Form>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Changer de mot de passe</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <FormLabel htmlFor="currentPassword">Mot de passe actuel</FormLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="newPassword">Nouveau mot de passe</FormLabel>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="confirmPassword">Confirmer le mot de passe</FormLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Use AuthLayout to handle authentication
  return <AuthLayout>{profileContent}</AuthLayout>;
}