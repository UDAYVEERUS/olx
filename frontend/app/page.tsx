"use client";
import { useEffect } from "react";
import { useListings } from "@/context/ListingsContext";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import HeroSection from "@/components/home/Hero";
import FeaturesSection from "@/components/home/Features";
import HowItWorksSection from "@/components/home/Howitworks";
import StatsSection from "@/components/home/Stats";
import CTASection from "@/components/home/CTA";
import { Search } from "lucide-react";

export default function HomePage() {
  const { listings, categories, loading, fetchListings, fetchCategories } =
    useListings();

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <HeroSection /> */}
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buy & Sell Everything
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover amazing deals from people around you
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-2 flex gap-2">
            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-lg">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 bg-transparent text-gray-900 outline-none"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
          <Link
            href="/post-ad"
            className=" mt-6 inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Selling
          </Link>
        </div>
      </section>
      <FeaturesSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Browse Categories
            </h2>
            <Link
              href="/categories"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              View All
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>
        {/* <HowItWorksSection /> */}
        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Listings
            </h2>
            <Link
              href="/listings"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              View All
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.slice(0, 8).map((listing) => (
                <ProductCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No listings found</p>
              <Link
                href="/post-ad"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Post the first ad
              </Link>
            </div>
          )}
        </section>
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </div>
    </div>
  );
}
