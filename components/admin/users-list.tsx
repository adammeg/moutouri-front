"use client"

import { useState } from "react"
import { 
  CheckIcon, 
  MoreHorizontal, 
  Search, 
  XIcon,
  UserCheck,
  UserX,
  Mail,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  image?: string
}

interface UsersListProps {
  users: User[]
  isLoading: boolean
}

export default function UsersList({ users, isLoading }: UsersListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users)
  
  // Filter users when search query changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    
    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }
  
  // Reset search
  const handleResetSearch = () => {
    setSearchQuery("")
    setFilteredUsers(users)
  }

  // If component is still loading initial data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des utilisateurs...</span>
      </div>
    )
  }
  
  // If no users are found
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <UserX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-muted-foreground max-w-xs">
            Il n'y a pas encore d'utilisateurs enregistrés sur la plateforme.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tous les utilisateurs</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, email..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={handleResetSearch}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Effacer</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(searchQuery ? filteredUsers : users).map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.image} 
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                    {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {user.isActive ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                        <CheckIcon className="h-3 w-3" />
                        <span>Actif</span>
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 bg-red-100 text-red-800">
                        <XIcon className="h-3 w-3" />
                        <span>Inactif</span>
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.createdAt ? (
                    format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <UserCheck className="mr-2 h-4 w-4" />
                        <span>Voir le profil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Envoyer un message</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="mr-2 h-4 w-4" />
                        <span>{user.isActive ? "Désactiver" : "Activer"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 