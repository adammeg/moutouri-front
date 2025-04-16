"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Menu, X, PlusCircle, User, LogOut, Bell, Heart, Package } from "lucide-react"
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
      <div className="w-full px-2 sm:px-6 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/products" className="flex items-center gap-2">
              <Image 
                src="/logo-moutouri.png" 
                alt="Moutouri Logo" 
                width={40} 
                height={40}
                className="rounded-md"
                onError={(e) => {
                  console.error("Error loading logo image");
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
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
                <div className="h-9 w-16 sm:w-24 bg-muted/20 rounded animate-pulse"></div>
                <div className="h-9 w-16 sm:w-24 bg-muted/20 rounded hidden sm:block"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Button asChild size="sm" className="hidden sm:flex whitespace-nowrap">
                  <Link href="/products/new">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Publier
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2 relative">
                      <span className="hidden sm:inline-block">Mon compte</span>
                      <User className="h-4 w-4 sm:ml-2 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs font-normal text-muted-foreground truncate">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Package className="mr-2 h-4 w-4" />
                        Mes annonces
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="whitespace-nowrap">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild size="sm" className="whitespace-nowrap hidden xs:flex">
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

      {/* Mobile menu - FIXED: Better fullscreen mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background md:hidden">
          <nav className="w-full flex flex-col p-4 space-y-4 h-[calc(100vh-4rem)] overflow-y-auto">
            <Link 
              href="/products" 
              className="px-4 py-3 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Parcourir
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-3 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className="px-4 py-3 rounded-md hover:bg-muted text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <hr className="border-muted" />
                <Link 
                  href="/dashboard" 
                  className="px-4 py-3 rounded-md hover:bg-muted text-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="mr-3 h-5 w-5" />
                  Tableau de bord
                </Link>
                <Link 
                  href="/products/new" 
                  className="px-4 py-3 rounded-md hover:bg-muted text-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="mr-3 h-5 w-5" />
                  Publier une annonce
                </Link>
                <Link 
                  href="/profile" 
                  className="px-4 py-3 rounded-md hover:bg-muted text-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Mon profil
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-md hover:bg-destructive/10 text-destructive text-lg text-left flex items-center w-full"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <hr className="border-muted" />
                <Link 
                  href="/login" 
                  className="px-4 py-3 rounded-md hover:bg-muted text-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-lg flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="mr-3 h-5 w-5" />
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