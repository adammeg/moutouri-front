"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Home,
  Package,
  User,
  Settings,
  LogOut,
  PlusCircle,
  Heart,
  ShoppingBag,
  Bell,
  MessageSquare,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!isMounted) {
    return null
  }

  const navItems = [
    { label: "Accueil", icon: Home, href: "/products" },
    { label: "Mes annonces", icon: Package, href: "/dashboard", active: pathname === "/dashboard" },
    { label: "Publier une annonce", icon: PlusCircle, href: "/products/new" },
    { label: "Mon profil", icon: User, href: "/profile" },
  ]

  // Admin-only items
  const adminItems = [
    { label: "Administration", icon: ShieldCheck, href: "/admin" },
  ]

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - FIXED: improved mobile sidebar with higher z-index and full width */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-[280px] border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:z-0 lg:max-w-[280px] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/products" className="flex items-center gap-2">
            <Image
              src="/logo-moutouri.png"
              alt="Moutouri"
              width={40}
              height={40}
              className="rounded-md"
              onError={(e) => {
                console.error("Error loading sidebar logo");
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <span className="text-xl font-bold">Moutouri</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="px-4 mb-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {user.image ? (
                    <Image 
                      src={user.image} 
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-user.png";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-medium text-muted-foreground">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Connectez-vous pour accéder à toutes les fonctionnalités
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </div>
            )}
          </div>
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || 
                  (item.href === "/dashboard" && pathname?.startsWith("/dashboard/")) ||
                  (item.href === "/profile" && pathname?.startsWith("/profile/"))
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <Separator className="my-4 bg-sidebar-border" />
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-sidebar-border text-sidebar-foreground/80"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content - FIXED: Better mobile padding and width */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Header - FIXED: Better positioning for mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-2 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="ml-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" asChild className="whitespace-nowrap">
                  <Link href="/products">Parcourir</Link>
                </Button>
                <Button size="sm" asChild className="whitespace-nowrap">
                  <Link href="/products/new">Publier</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="whitespace-nowrap">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild className="whitespace-nowrap">
                  <Link href="/register">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>
        </header>
        
        {/* Main content area - FIXED: Better padding for mobile */}
        <main className="flex-1 p-2 sm:p-4 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

