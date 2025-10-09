import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {/* 404 Number */}
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      
      {/* Error Message */}
      <h2 className="text-3xl font-semibold text-gray-700 mt-4">
        Page Not Found
      </h2>
      
      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
}