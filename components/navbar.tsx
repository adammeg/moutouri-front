import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const Navbar = () => {
    const { isAuthenticated, isLoading } = useAuth();
    
    // Don't show auth-dependent buttons while loading
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          {/* Skeleton loading state */}
          <div className="h-9 w-24 bg-muted/20 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-muted/20 rounded animate-pulse"></div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Mon compte</Link>
            </Button>
            <Button asChild>
              <Link href="/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Publier
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Inscription</Link>
            </Button>
          </>
        )}
      </div>
    );
  };

export default Navbar
