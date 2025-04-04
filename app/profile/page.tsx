"use client"

import { useState, useEffect, useRef, use } from "react"
import Image from "next/image"
import { Camera, LoaderCircle } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserProfile, updateUserPassword, uploadProfilePicture } from "@/services/user"
import ProtectedRoute from "@/components/protected-route"
import { getUserProducts } from "@/services/products"

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const [user, setUser] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    profileImage: "/placeholder.svg?height=200&width=200",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [userProducts, setUserProducts] = useState([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?._id) return

      try {
        setIsLoading(true)
        const response = await getUserProfile(authUser._id)

        if (response.success) {
          setUser({
            _id: authUser._id,
            firstName: authUser.firstName || "",
            lastName: authUser.lastName || "",
            email: authUser.email || "",
            profileImage: authUser.image || "/placeholder.svg?height=200&width=200",
          })
          await fetchUserProducts()
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [authUser, toast])

  const fetchUserProducts = async () => {
    if (!user || !user._id) {
      console.warn("Cannot fetch products: No user available or missing _id")
      return
    }
    
    try {
      console.log("📊 Fetching products for user ID:", user._id)
      setIsLoadingProducts(true)
      const result = await getUserProducts(user._id)
      if (result.success) {
        setUserProducts(result.products || [])
      } else {
        console.error("Failed to fetch user products:", result.message)
      }
    } catch (error) {
      console.error("Error fetching user products:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUser?._id) return

    setIsSaving(true)

    try {
      const response = await updateUserProfile(authUser._id, {
        firstName: user.firstName,
        lastName: user.lastName,
      })

      if (response.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        })

        // Update the user in the auth context if available
        if (typeof window !== 'undefined' && authUser && 'updateUser' in authUser) {
          (authUser as any).updateUser({
            firstName: user.firstName,
            lastName: user.lastName,
          })
        }
      } else {
        throw new Error(response.message || "Une erreur s'est produite")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUser?._id) return

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await updateUserPassword(authUser._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.success) {
        toast({
          title: "Mot de passe mis à jour",
          description: "Votre mot de passe a été changé avec succès.",
        })

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        throw new Error(response.message || "Une erreur s'est produite")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de changer votre mot de passe. Vérifiez que votre mot de passe actuel est correct.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (file: File) => {
    if (!authUser?._id) return

    try {
      setIsUploading(true)

      const response = await uploadProfilePicture(authUser._id, file)

      if (response.success) {
        setUser({
          ...user,
          profileImage: response.imageUrl
        })

        // Update the user in the auth context if available
        if (typeof window !== 'undefined' && authUser && 'updateUser' in authUser) {
          (authUser as any).updateUser({
            image: response.imageUrl
          })
        }

        toast({
          title: "Photo de profil mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès.",
        })
      } else {
        throw new Error(response.message || "Une erreur s'est produite")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger votre photo de profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Paramètres du Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et vos paramètres de compte
            </p>
          </div>
          <Separator />

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement de votre profil...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Votre Photo de Profil</CardTitle>
                    <CardDescription>Cette image sera visible par les autres utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div
                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 cursor-pointer"
                        onClick={handleImageClick}
                      >
                        {isUploading ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <LoaderCircle className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <Image
                            src={user.profileImage}
                            alt="Photo de profil"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={handleImageClick}
                        disabled={isUploading}
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Télécharger une nouvelle photo</span>
                      </Button>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleImageUpload(e.target.files[0])
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleImageClick}
                      disabled={isUploading}
                    >
                      {isUploading ? "Téléchargement..." : "Changer de Photo"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations Personnelles</CardTitle>
                    <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Votre adresse email ne peut pas être modifiée. Contactez le support pour assistance.
                        </p>
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Enregistrement..." : "Enregistrer les Modifications"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité du Compte</CardTitle>
                  <CardDescription>Gérez votre mot de passe et la sécurité de votre compte</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de Passe Actuel</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau Mot de Passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Le mot de passe doit contenir au moins 6 caractères.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le Nouveau Mot de Passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? "Mise à jour..." : "Mettre à Jour le Mot de Passe"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

