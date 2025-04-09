import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PublicLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
}

export default function PublicLayout({ 
  children,
  showBackButton = true
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background/60 to-background">
      <header className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo-moutouri.png" 
            alt="Moutouri Logo" 
            width={40} 
            height={40}
            className="w-auto h-10"
            onError={(e) => {
              // If logo fails to load, fallback to text-only
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="font-bold text-xl">Moutouri</span>
        </Link>
        
        {showBackButton && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        )}
      </header>
      
      <main className="flex-1 container flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg border shadow-sm">
          {children}
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Moutouri. Tous droits réservés.</p>
      </footer>
    </div>
  )
} 