"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useListings } from "@/context/ListingsContext";
import Image from "next/image";
import Link from "next/link";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showResults?: boolean; // Show dropdown results or redirect to search page
}

export default function SearchBar({ onSearch, showResults = true }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { searchListings } = useListings();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search - triggers 500ms after user stops typing
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;

    setIsSearching(true);
    try {
      // Call your context search function
      await searchListings(query);
      
      // Fetch results for dropdown
      if (showResults) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        // Handle nested response structure
        const results = data?.data?.listings || data?.listings || [];
        setSearchResults(results.slice(0, 5)); // Show top 5 results
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    // Close dropdown and redirect to search results page
    setIsOpen(false);
    
    if (onSearch) {
      onSearch(query);
    } else {
      // Redirect to dedicated search page (you'll need to create this)
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-lg relative">
          <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-gray-900 outline-none placeholder-gray-500"
          />
          
          {/* Loading spinner or Clear button */}
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin ml-2" />
          ) : query && (
            <button
              type="button"
              onClick={clearSearch}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={query.trim().length < 2}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </form>

      {/* Dropdown Results */}
      {showResults && isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-fit overflow-y-auto">
          <div className="p-2">
            {searchResults.map((listing) => (
              <Link
                key={listing._id}
                href={`/listings/${listing._id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-4 p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 border-b border-gray-100 last:border-0"
              >
                {/* Left: Image + Title + Location */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {listing.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Title + Location */}
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm leading-tight text-center">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="flex-shrink-0">
                  <p className="font-bold text-base text-blue-600 whitespace-nowrap">
                    ₹{listing.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}

            {/* View All Results */}
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
              className="w-full mt-2 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold flex items-center justify-center gap-1"
            >
              View all results
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showResults && isOpen && query.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">No results found</p>
          <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
}