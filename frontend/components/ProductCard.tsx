import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/product/${listing._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {listing.title}
          </h3>
          <p className="text-xl font-bold text-blue-600 mt-2">
            {formatPrice(listing.price)}
          </p>
          <p className="text-sm text-gray-600 mt-1 truncate">
            {listing.location}
          </p>
        </div>
      </div>
    </Link>
  );
}