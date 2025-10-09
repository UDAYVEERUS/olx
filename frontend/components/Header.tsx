"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Menu, Plus, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Reduced from 500ms to 300ms for faster response

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/listings/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const results = data?.data?.listings || data?.listings || [];
      setSearchResults(results.slice(0, 5));
      setIsOpen(true);
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

    setIsOpen(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              MarketPlace
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div
            ref={searchRef}
            className="hidden lg:flex flex-1 max-w-2xl mx-8 relative"
          >
            <form onSubmit={handleSubmit} className="relative w-full">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                <Search className="h-5 w-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-900"
                />

                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                ) : (
                  query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mr-2 p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )
                )}
              </div>

              {/* Dropdown Results */}
              {isOpen && searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((listing) => (
                      <Link
                        key={listing._id}
                        href={`/listings/${listing._id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between gap-4 p-3 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {listing.images?.[0] ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Search className="h-5 w-5 text-gray-400" />
                            </div>
                          )}

                          <div className="flex flex-col justify-center flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">
                              {listing.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="truncate">
                                {listing.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <p className="font-bold text-sm text-blue-600">
                            ₹{listing.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                        setIsOpen(false);
                      }}
                      className="w-full mt-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                    >
                      View all results →
                    </button>
                  </div>
                </div>
              )}

              {isOpen &&
                query.length >= 2 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border p-4 text-center">
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No results found</p>
                  </div>
                )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/post-ad"
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Post Ad</span>
                </Link>

                <Link
                  href="/chat"
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    {user?.avatar || user?.picture ? (
                      <Image
                        src={user.avatar || user.picture || ""}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible transition-all">
                    <Link
                      href="/my-ads"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Ads
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Icons */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Search className="h-6 w-6" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300">
                <Search className="h-5 w-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-900"
                />
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                ) : (
                  query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mr-2 p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )
                )}
              </div>

              {/* Mobile Search Results */}
              {isOpen && searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((listing) => (
                      <Link
                        key={listing._id}
                        href={`/listings/${listing._id}`}
                        onClick={() => {
                          setIsOpen(false);
                          setMobileSearchOpen(false);
                        }}
                        className="flex items-center justify-between gap-3 p-2 hover:bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {listing.images?.[0] ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-xs">
                              {listing.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {listing.location}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-xs text-blue-600">
                          ₹{listing.price.toLocaleString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/post-ad"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Post Ad</span>
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
                <Link
                  href="/my-ads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  My Ads
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
