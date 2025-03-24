"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LogOut,
  MessageSquare,
  BikeIcon as Motorcycle,
  Package,
  Settings,
  ShieldCheck,
  User,
  Plus,
  ShoppingBag,
  Heart,
  ShieldAlert,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()

  const navigation = [
    { name: "Tableau de Bord", href: "/dashboard", icon: Home },
    { name: "Produits à vendre", href: "/products", icon: ShoppingBag },
    ...(isAdmin ? [{ name: "Administration", href: "/admin", icon: ShieldAlert }, { name: 'Categories', href: '/admin/categories', icon: Tag, admin: true }, { name: 'Ads', href: '/admin/ads', icon: Tag, admin: true }] : []),
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r w-[260px] hidden lg:block">
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <Image 
                src="/logo-moutouri.png" 
                alt="Moutouri" 
                width={32} 
                height={32} 
                className="h-8 w-auto" 
              />
              <span>Moutouri</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="w-full lg:w-auto">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user?.image || "/placeholder.svg?height=32&width=32"} alt={user?.firstName || "User"} />
                  <AvatarFallback>{user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "email@exemple.com"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Déconnexion</span>
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="block lg:hidden" />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/products">Parcourir les Produits</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/products/new">
                  <span className="hidden sm:inline">Publier une Annonce</span>
                  <span className="sm:hidden">Publier</span>
                </Link>
              </Button>
            </div>
          </header>
          <main className="p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

