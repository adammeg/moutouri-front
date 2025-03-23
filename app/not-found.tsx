import Link from 'next/link'
import { Button } from '@/components/ui/button'

// This is a server component by default (no 'use client' directive)
export default function NotFound() {
  // Log to verify this version is being used
  console.log("Server component not-found page rendering");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page non trouvée</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Retourner à l'accueil</Link>
      </Button>
    </div>
  )
}

// Server component metadata export
export const metadata = {
  title: 'Page non trouvée | Moutouri',
  description: "La page que vous recherchez n'existe pas ou a été déplacée."
}