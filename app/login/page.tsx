"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BikeIcon as Motorcycle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

import { loginUser } from "@/services/auth"

// Extract login form to a separate component to use useSearchParams inside Suspense
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get("redirectTo") || "/dashboard"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the loginUser function from our auth service
      const response = await loginUser({ email, password });
      
      if (response.success) {
        // The loginUser function should already store tokens and user data
        console.log(response)
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${response.user.firstName}!`,
        });
        
        // Store user info manually to ensure it's available
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Add a small delay to ensure state is updated before navigation
        setTimeout(() => {
          // Navigate to the redirectTo URL or admin/dashboard
          router.push(redirectTo);
        }, 300);
      } else {
        throw new Error(response.message || "Une erreur s'est produite");
      }
    } catch (error: any) {
      toast({
        title: "Échec de connexion",
        description: error.response?.data?.message || error.message || "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Mot de passe oublié?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
}

// Main login page component with Suspense
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Motorcycle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Accédez à votre compte Moutouri</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted/20 rounded-lg"></div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Vous n&apos;avez pas de compte?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
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

