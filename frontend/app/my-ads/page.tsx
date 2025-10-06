'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Listing } from '@/types';
import toast from 'react-hot-toast';

export default function MyAdsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchMyListings();
  }, [isAuthenticated]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/listings/user/my-listings');
      const myListings = response.data?.data?.listings || response.data?.listings || [];
      setListings(myListings);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(listing => listing._id !== id));
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-2">
            You have {listings.length} active listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/post-ad')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Post New Ad
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No listings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start selling by posting your first ad
          </p>
          <button
            onClick={() => router.push('/post-ad')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Post Your First Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="relative">
              <ProductCard listing={listing} />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => router.push(`/my-ads/edit/${listing._id}`)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(listing._id)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}