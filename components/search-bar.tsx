"use client"

import { useState, useEffect, useRef } from "react"
import { Search as SearchIcon, X, Filter, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { getProducts } from "@/services/products"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface SearchBarProps {
  onSearch?: (results: any[], query: string) => void
  placeholder?: string
  className?: string
  showFilters?: boolean
  initialQuery?: string
  searchQuery?: string
  variant?: "default" | "simple"
  clearOnSearch?: boolean
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Rechercher des produits...", 
  className, 
  showFilters = true,
  initialQuery = "",
  searchQuery = "",
  variant = "default",
  clearOnSearch = false
}: SearchBarProps) {
  const [query, setQuery] = useState(searchQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  // Categories for the filter
  const categories = [
    { id: "motos", name: "Motos" },
    { id: "scooters", name: "Scooters" },
    { id: "pieces", name: "Pièces" },
    { id: "accessoires", name: "Accessoires" },
  ]

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
    // If there's a query parameter, use it
    const queryParam = searchParams?.get("q")
    if (queryParam) {
      setQuery(queryParam)
    }
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchParams])

  useEffect(() => {
    // If there's a query parameter, use it
    const queryParam = searchParams?.get("q")
    if (queryParam) {
      setQuery(queryParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([])
      return
    }

    try {
      // Get suggestions from API
      const response = await getProducts({ search: searchTerm, limit: 5 })
      
      // Extract unique terms from product titles and ensure they're all strings
      const stringTitles = (response.products || [])
        .map((product: any) => product.title)
        .filter((title: any): title is string => 
          typeof title === 'string' && title.trim() !== ''
        )
      
      // Create a unique list of titles
      const uniqueTitles = [...new Set(stringTitles)].slice(0, 5)
      setSuggestions(uniqueTitles as string[])
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Debounce API calls for suggestions
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }
  
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!query.trim()) return
    
    setIsSubmitting(true)
    setShowSuggestions(false)
    
    try {
      // Save to recent searches
      const updatedSearches = [
        query, 
        ...recentSearches.filter(item => item !== query)
      ].slice(0, 5)
      
      setRecentSearches(updatedSearches)
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
      
      // If onSearch is provided, use that
      if (onSearch) {
        const response = await getProducts({ search: query })
        onSearch(response.products || [], query)
      } else {
        // Otherwise, navigate to search results page
        const params = new URLSearchParams(searchParams?.toString() || "")
        params.set("q", query)
        router.push(`/products?${params.toString()}`)
      }
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    
    // Submit the search with the selected suggestion
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("q", suggestion)
    
    // Save to recent searches
    const updatedSearches = [
      suggestion, 
      ...recentSearches.filter(item => item !== suggestion)
    ].slice(0, 5)
    
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    
    if (onSearch) {
      getProducts({ search: suggestion }).then(response => {
        onSearch(response.products || [], suggestion)
      })
    } else {
      router.push(`/products?${params.toString()}`)
    }
  }
  
  const clearSearch = () => {
    setQuery("")
    searchInputRef.current?.focus()
    
    if (onSearch) {
      onSearch([], "")
    }
  }
  
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }
  
  const resetFilters = () => {
    setMinPrice(0)
    setMaxPrice(50000)
    setSelectedCategories([])
  }
  
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    
    if (query) {
      params.set("q", query)
    }
    
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    } else {
      params.delete("categories")
    }
    
    if (minPrice > 0) {
      params.set("minPrice", minPrice.toString())
    } else {
      params.delete("minPrice")
    }
    
    if (maxPrice < 50000) {
      params.set("maxPrice", maxPrice.toString())
    } else {
      params.delete("maxPrice")
    }
    
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div 
      ref={searchContainerRef}
      className={cn(
        "relative w-full max-w-3xl mx-auto",
        className
      )}
    >
      <form 
        className="flex w-full items-center space-x-2"
        onSubmit={handleSearch}
      >
        <div className="relative flex-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pr-10 h-10"
            data-testid="search-input"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Effacer la recherche</span>
            </button>
          )}
        </div>
        
        <Button 
          type="submit" 
          size="icon" 
          variant="default"
          disabled={isSubmitting}
          className="shrink-0 h-10 w-10"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Rechercher</span>
        </Button>
        
        {showFilters && (
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                className="shrink-0 h-10 w-10 md:hidden"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtres</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche avec des filtres spécifiques
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Catégories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`mobile-category-${category.id}`} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label 
                          htmlFor={`mobile-category-${category.id}`}
                          className="text-sm font-normal"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Prix</h3>
                    <p className="text-sm text-muted-foreground">
                      {minPrice} DT - {maxPrice} DT
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Slider
                      value={[minPrice, maxPrice]}
                      min={0}
                      max={50000}
                      step={500}
                      onValueChange={(values) => {
                        setMinPrice(values[0])
                        setMaxPrice(values[1])
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <SheetFooter>
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
        
        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="hidden md:flex items-center gap-1"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtres
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] p-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Catégories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`desktop-category-${category.id}`} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label 
                          htmlFor={`desktop-category-${category.id}`}
                          className="text-sm font-normal"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Prix</h3>
                    <p className="text-sm text-muted-foreground">
                      {minPrice} DT - {maxPrice} DT
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Slider
                      value={[minPrice, maxPrice]}
                      min={0}
                      max={50000}
                      step={500}
                      onValueChange={(values) => {
                        setMinPrice(values[0])
                        setMaxPrice(values[1])
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">
                    Réinitialiser
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="flex-1">
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-background border shadow-lg max-h-[300px] overflow-auto">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded-md"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          {recentSearches.length > 0 && (
            <div className="p-2 border-t">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Recherches récentes
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={`recent-${index}`}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded-md flex items-center justify-between"
                  onClick={() => handleSuggestionClick(search)}
                >
                  <span>{search}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSearches(prev => prev.filter((_, i) => i !== index));
                      localStorage.setItem(
                        "recentSearches", 
                        JSON.stringify(recentSearches.filter((_, i) => i !== index))
                      );
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {variant === "default" && (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            placeholder="Rechercher des motos, scooters..."
            value={query}
            onValueChange={(value) => {
              setQuery(value)
              fetchSuggestions(value)
            }}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            
            {suggestions.length > 0 && (
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onSelect={() => handleSuggestionClick(suggestion)}
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recherches récentes">
                {recentSearches.map((term) => (
                  <CommandItem
                    key={term}
                    onSelect={() => handleSuggestionClick(term)}
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    {term}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      )}
    </div>
  )
}