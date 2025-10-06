'use client';
import { useState } from 'react';
import { useListings } from '@/context/ListingsContext';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export default function SearchBar({ 
  className = "", 
  placeholder = "Search for products..." 
}: SearchBarProps) {
  const { searchListings, resetFilters } = useListings();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      await searchListings(query.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    resetFilters();
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            <MagnifyingGlassIcon className={`h-5 w-5 ${isSearching ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
      
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}
    </form>
  );
}