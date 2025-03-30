'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  className = '',
  placeholder = 'Rechercher...',
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with query from URL if it exists
  const initialQuery = searchParams?.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many requests
  const debouncedQuery = useDebounce(query, 500);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Create new URL with search params
      const params = new URLSearchParams(searchParams?.toString());
      params.set('q', query);
      
      // Trigger the search callback if provided
      if (onSearch) {
        onSearch(query);
      } else {
        // Otherwise navigate to the products page with the search query
        router.push(`/products?${params.toString()}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, router, searchParams, onSearch]);

  // Auto-search when debounced query changes (if enabled)
  useEffect(() => {
    if (debouncedQuery !== initialQuery && onSearch) {
      handleSearch();
    }
  }, [debouncedQuery, handleSearch, initialQuery, onSearch]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Clear search and reset
  const clearSearch = () => {
    setQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative flex w-full items-center ${className}`}
    >
      <Input
        ref={searchInputRef}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pr-16 rounded-r-none focus-visible:ring-1"
        autoFocus={autoFocus}
        aria-label="Rechercher"
      />
      
      {/* Clear button - only show when there's text */}
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-14 h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* Search button */}
      <Button 
        type="submit" 
        className="rounded-l-none h-[38px]"
        disabled={isSearching || !query.trim()}
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SearchIcon className="h-4 w-4" />
        )}
        <span className="ml-2 hidden sm:inline">Rechercher</span>
      </Button>
    </form>
  );
}

// Also export a smaller search component for mobile/compact views
export function CompactSearchBar(props: SearchBarProps) {
  return (
    <SearchBar 
      {...props} 
      className="max-w-full" 
      placeholder="Rechercher des produits..."
    />
  );
}