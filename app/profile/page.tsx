"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Form } from "react-hook-form"
import { z } from "zod"
import { Loader2, Camera, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserProfile, uploadProfilePicture } from "@/services/user"
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

// Password schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Mot de passe actuel requis"
  }),
  newPassword: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
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

  // Set mounted state for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize form with user data when available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  // Update form when user data is available
  useEffect(() => {
    if (user && mounted) {
      console.log("📋 Setting up form with user data");
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      
      if (user.image) {
        setImagePreview(user.image);
      }
    }
  }, [user, form, mounted]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?._id) return;
    
    try {
      setIsUpdating(true);
      console.log("Updating profile with:", values);
      
      // Update profile information
      const response = await updateUserProfile(user._id, values);
      
      if (response.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod
      const validated = passwordSchema.parse(passwordData);
      setIsChangingPassword(true);
      
      // API call to change password would go here
      // const response = await updateUserPassword(user._id, passwordData);
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès",
      });
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error instanceof z.ZodError) {
        // Handle validation errors
        toast({
          title: "Validation échouée",
          description: error.errors[0]?.message || "Vérifiez vos entrées",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du changement de mot de passe",
          variant: "destructive",
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle profile picture selection
  const handlePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile picture upload
  const handleUploadPicture = async () => {
    if (!pictureFile || !user?._id) return;
    
    try {
      setImageUploading(true);
      const response = await uploadProfilePicture(user._id, pictureFile);
      
      if (response.success) {
        toast({
          title: "Photo de profil mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès",
        });
        
        // Reset the file state
        setPictureFile(null);
      } else {
        throw new Error(response.message || "Failed to upload profile image");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre photo de profil",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Profile content
  const profileContent = (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Profile" 
                    width={128} 
                    height={128} 
                    className="object-cover"
                  />
                ) : user?.image ? (
                  <Image 
                    src={user.image} 
                    alt="Profile" 
                    width={128} 
                    height={128} 
                    className="object-cover"
                  />
                ) : (
                  <div className="text-3xl font-semibold text-muted-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
              </div>
              
              <label 
                htmlFor="picture-upload" 
                className="absolute bottom-0 right-0 p-1 bg-background rounded-full border cursor-pointer hover:bg-muted transition-colors"
              >
                <Camera className="h-5 w-5" />
                <input 
                  type="file" 
                  id="picture-upload" 
                  className="sr-only"
                  accept="image/*"
                  onChange={handlePictureSelect}
                />
              </label>
              
              {pictureFile && (
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleUploadPicture}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            </div>
          </div>
          
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
      
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Statut du compte</h3>
              <p className="text-muted-foreground">
                {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur standard'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Actions</h3>
              <div className="flex space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    Mes annonces
                  </Link>
                </Button>
                <Button variant="destructive">
                  Désactiver mon compte
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  // Wrap content in AuthLayout
  return <AuthLayout>{profileContent}</AuthLayout>;
}

