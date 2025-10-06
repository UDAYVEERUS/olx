'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { Listing } from '@/types';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MapPinIcon,
  ClockIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { createChat } = useChat();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${params.id}`);
      // Handle nested response structure
      const listingData = response.data?.data?.listing || response.data?.listing || response.data;
      setListing(listingData);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Listing not found');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
  if (!isAuthenticated) {
    toast.error('Please login to start a chat');
    router.push('/auth/login');
    return;
  }

  if (!listing || !user) {
    toast.error('Unable to start chat');
    return;
  }

  // Check if trying to chat with yourself
  const sellerId = typeof listing.sellerId === 'object' ? listing.sellerId._id : listing.sellerId;
  if (user._id === sellerId) {
    toast.error('You cannot chat with yourself');
    return;
  }

  try {
    console.log('Creating chat with listing:', listing._id); // DEBUG
    const chatId = await createChat(user._id, sellerId, listing._id);
    console.log('Chat created, ID:', chatId); // DEBUG
    router.push(`/chat?chatId=${chatId}`);
  } catch (error: any) {
    console.error('Error starting chat:', error);
    toast.error(error.message || 'Failed to start chat');
  }
};

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Listing not found</h1>
      </div>
    );
  }

  // Extract seller data safely
  const seller = typeof listing.sellerId === 'object' ? listing.sellerId : null;
  const sellerId = seller?._id || listing.sellerId;
  const sellerName = seller?.name || 'Anonymous Seller';
  const sellerPicture = seller?.picture;
  const sellerPhone = seller?.phone;
  const sellerEmail = seller?.email;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <>
                <Image
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {listing.title}
            </h1>
            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(listing.price)}
            </p>
          </div>

          {/* Meta Information */}
          <div className="space-y-3 text-sm text-gray-600">
            {listing.category && (
              <div className="flex items-center space-x-2">
                <TagIcon className="h-5 w-5" />
                <span>{typeof listing.category === 'object' ? listing.category.name : listing.category}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span>Posted {formatDate(listing.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Seller Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="flex items-center space-x-4 mb-4">
              {sellerPicture ? (
                <Image
                  src={sellerPicture}
                  alt={sellerName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {sellerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">{sellerName}</p>
                <p className="text-sm text-gray-600">Seller</p>
              </div>
            </div>

            {/* Contact Actions */}
            {isAuthenticated && user?._id !== sellerId ? (
              <div className="space-y-3">
                <button
                  onClick={handleStartChat}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Start Chat</span>
                </button>
                
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
                </button>

                {showContactInfo && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {sellerPhone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-5 w-5 text-gray-600" />
                        <a 
                          href={`tel:${sellerPhone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {sellerPhone}
                        </a>
                      </div>
                    )}
                    {sellerEmail && (
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                        <a 
                          href={`mailto:${sellerEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {sellerEmail}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : !isAuthenticated ? (
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login to Contact Seller
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
                This is your own listing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}