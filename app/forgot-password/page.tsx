 "use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import PublicLayout from "@/components/public-layout"

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true)
      
      // TODO: Implement actual password reset API call
      // This is a placeholder to simulate API behavior
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEmailSent(true)
      toast({
        title: "Email envoyé",
        description: "Si votre email existe dans notre base de données, vous recevrez un lien pour réinitialiser votre mot de passe.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de l'email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="text-sm text-muted-foreground">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {emailSent ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h3 className="font-medium text-green-800">Email envoyé!</h3>
            <p className="text-sm text-green-700 mt-1">
              Nous avons envoyé un email avec les instructions pour réinitialiser votre mot de passe.
              Vérifiez votre boîte de réception et vos spams.
            </p>
            <div className="mt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="vous@exemple.com" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer les instructions"
                )}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm underline text-primary/80 hover:text-primary"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}