 "use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, Filter, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCategories } from "@/services/categories"
import { searchProductSuggestions } from "@/services/products"
import { cn } from "@/lib/utils"

interface ProductSearchProps {
  onSearch?: (query: string, filters: any) => void;
  className?: string;
}

export function ProductSearch({ onSearch, className }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [condition, setCondition] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial search query from URL
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setInputValue(query);
    
    // Load categories
    const loadCategories = async () => {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    };
    
    loadCategories();
    
    // Load other filters from URL
    const categoryParam = searchParams?.get("category");
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","));
    }
    
    const minPrice = searchParams?.get("minPrice");
    const maxPrice = searchParams?.get("maxPrice");
    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    }
    
    const conditionParam = searchParams?.get("condition");
    if (conditionParam) {
      setCondition(conditionParam.split(","));
    }
    
  }, [searchParams]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    if (condition.length > 0) count++;
    setActiveFilters(count);
  }, [selectedCategories, priceRange, condition]);

  // Debounce input value for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length >= 2) {
        const response = await searchProductSuggestions(debouncedValue);
        if (response.success) {
          setSuggestions(response.suggestions);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  // Handle search submission
  const handleSearch = useCallback(() => {
    setShowSuggestions(false);
    
    // Build query string
    const params = new URLSearchParams();
    
    if (inputValue) {
      params.set("q", inputValue);
    }
    
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      params.set("minPrice", priceRange[0].toString());
      params.set("maxPrice", priceRange[1].toString());
    }
    
    if (condition.length > 0) {
      params.set("condition", condition.join(","));
    }
    
    // Navigate to search results
    router.push(`/products?${params.toString()}`);
    
    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(inputValue, {
        categories: selectedCategories,
        priceRange,
        condition
      });
    }
  }, [inputValue, selectedCategories, priceRange, condition, router, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle condition selection
  const toggleCondition = (value: string) => {
    setCondition(prev => 
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setCondition([]);
  };

  // Apply filters and close filter sheet
  const applyFilters = () => {
    setIsFilterOpen(false);
    handleSearch();
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("relative w-full max-w-3xl mx-auto", className)}>
      <div className="flex items-center w-full rounded-md border bg-background">
        <div className="flex items-center w-full">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher un véhicule, une pièce..."
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={() => setInputValue("")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Effacer</span>
            </Button>
          )}
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-l-none border-l h-full px-3 relative"
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-md sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            
            <div className="py-4 space-y-4">
              <Collapsible defaultOpen className="space-y-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-medium">Catégories</h3>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2 p-1">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              selectedCategories.includes(category._id) 
                                ? "bg-primary text-primary-foreground" 
                                : "opacity-50"
                            )}
                            onClick={() => toggleCategory(category._id)}
                          >
                            {selectedCategories.includes(category._id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible defaultOpen className="space-y-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-medium">Prix</h3>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-1">
                    <div className="mb-4">
                      <Slider
                        defaultValue={[0, 50000]}
                        max={50000}
                        step={500}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="my-6"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="border rounded-md px-2 py-1">
                        <span className="text-xs text-muted-foreground">Min</span>
                        <p className="font-medium">{priceRange[0]} DT</p>
                      </div>
                      <div className="border rounded-md px-2 py-1">
                        <span className="text-xs text-muted-foreground">Max</span>
                        <p className="font-medium">{priceRange[1]} DT</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible defaultOpen className="space-y-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-medium">État</h3>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 p-1">
                    {[
                      { value: "new", label: "Neuf" },
                      { value: "like-new", label: "Comme neuf" },
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Bon" },
                      { value: "fair", label: "Correct" },
                      { value: "salvage", label: "Pour pièces" }
                    ].map((item) => (
                      <div
                        key={item.value}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            condition.includes(item.value) 
                              ? "bg-primary text-primary-foreground" 
                              : "opacity-50"
                          )}
                          onClick={() => toggleCondition(item.value)}
                        >
                          {condition.includes(item.value) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            <SheetFooter className="flex flex-row gap-2 mt-4">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={applyFilters}>
                Appliquer les filtres
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full w-full mt-1 rounded-md border bg-background shadow-md z-10">
          <Command>
            <CommandList>
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {suggestions.length === 0 && (
              <CommandEmpty>Aucune suggestion trouvée</CommandEmpty>
            )}
          </Command>
        </div>
      )}
      
      {/* Active filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((categoryId) => {
            const category = categories.find(c => c._id === categoryId);
            return category ? (
              <Badge 
                key={categoryId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {category.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleCategory(categoryId)}
                />
              </Badge>
            ) : null;
          })}
          
          {(priceRange[0] > 0 || priceRange[1] < 50000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {priceRange[0]}-{priceRange[1]} DT
              <X 
                className="h-3 w-3 cursor-pointer"
                onClick={() => setPriceRange([0, 50000])}
              />
            </Badge>
          )}
          
          {condition.map((c) => {
            const conditionLabel = {
              "new": "Neuf",
              "like-new": "Comme neuf",
              "excellent": "Excellent",
              "good": "Bon",
              "fair": "Correct",
              "salvage": "Pour pièces"
            }[c];
            return (
              <Badge 
                key={c}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {conditionLabel}
                <X 
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleCondition(c)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}