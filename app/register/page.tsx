"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BikeIcon as Motorcycle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/services/auth"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the registerUser function from our auth service
      const response = await registerUser({
        firstName,
        lastName,
        email,
        password,
        phone
      });
      
      if (response.success) {
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur BikerZone! Vous pouvez maintenant vous connecter.",
        })
        router.push("/login")
      } else {
        throw new Error(response.message || "Une erreur s'est produite");
      }
    } catch (error: any) {
      toast({
        title: "Échec d'inscription",
        description: error.response?.data?.message || error.message || "Une erreur s'est produite lors de la création de votre compte. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Motorcycle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Créer un Compte</CardTitle>
          <CardDescription>Rejoignez la communauté BikerZone aujourd'hui</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+216 20 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 6 caractères.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Création du compte..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Retour à l&apos;Accueil</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

