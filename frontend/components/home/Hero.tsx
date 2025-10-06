import React from "react";
import {
  ShoppingBag,
  Zap,
  Shield,
  Headphones,
  TrendingUp,
  Users,
  Search,
  Heart,
} from "lucide-react";

// Hero Section with Search
function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Find Anything You Need
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Buy and sell thousands of products in your area
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
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
