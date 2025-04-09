"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Menu, X, PlusCircle, User, LogOut, Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Don't render anything until client-side hydration
  if (!isMounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo-moutouri.png" 
                alt="Moutouri Logo" 
                width={40} 
                height={40}
                className="rounded-md"
              />
              <span className="font-bold text-xl hidden sm:inline-block">Moutouri</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/products" 
              className={`text-sm font-medium ${
                pathname === "/products" 
                  ? "text-primary" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Parcourir
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium ${
                pathname === "/about" 
                  ? "text-primary" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium ${
                pathname === "/contact" 
                  ? "text-primary" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-9 w-24 bg-muted/20 rounded animate-pulse hidden sm:block"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="relative"
                  asChild
                >
                  <Link href="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost"
                  size="icon"
                  className="relative hidden sm:flex"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
                
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link href="/products/new">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Publier
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt={user.firstName || 'User'}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Tableau de bord</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/products/new">Publier une annonce</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" asChild size="sm" className="hidden sm:flex">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-20 bg-background md:hidden">
          <nav className="container flex flex-col p-4 space-y-4">
            <Link 
              href="/products" 
              className="px-4 py-2 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Parcourir
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className="px-4 py-2 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <hr className="border-muted" />
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-md hover:bg-muted text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link 
                  href="/products/new" 
                  className="px-4 py-2 rounded-md hover:bg-muted text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Publier une annonce
                </Link>
                <Link 
                  href="/favorites" 
                  className="px-4 py-2 rounded-md hover:bg-muted text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favoris
                </Link>
                <Link 
                  href="/profile" 
                  className="px-4 py-2 rounded-md hover:bg-muted text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon profil
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-md hover:bg-destructive/10 text-destructive text-lg text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <hr className="border-muted" />
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-md hover:bg-muted text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-lg flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}