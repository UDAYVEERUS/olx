'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useListings } from '@/context/ListingsContext';
import ProductCard from '@/components/ProductCard';
import { Category } from '@/types';
import api from '@/lib/api';

export default function CategoryPage() {
  const params = useParams();
  const { listings, loading: contextLoading, filterByCategory } = useListings();
  const [category, setCategory] = useState<Category | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // New state to prevent flash

  useEffect(() => {
    fetchCategoryAndListings();
  }, [params.slug]);

  const fetchCategoryAndListings = async () => {
    setIsInitializing(true); // Start initialization
    try {
      // Get category by slug
      const categoryResponse = await api.get(`/categories/slug/${params.slug}`);
      const categoryData = categoryResponse.data?.data?.category || categoryResponse.data?.category || categoryResponse.data;
      
      setCategory(categoryData);
      
      // Filter listings by category ID
      if (categoryData._id) {
        await filterByCategory(categoryData._id);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setIsInitializing(false); // End initialization
    }
  };

  // Show loading state during initialization OR while context is loading
  const isLoading = isInitializing || contextLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {category && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          <p className="text-gray-600">
            Browse all items in {category.name} category ({listings.length} items)
          </p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">
            No listings available in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ProductCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}