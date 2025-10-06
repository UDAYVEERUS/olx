// src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  picture?: string;
  phone?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: Category | string;
  images: string[];
  seller: User | string;  // ✅ Changed from sellerId to seller
  location: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  isNegotiable?: boolean;
  status: 'active' | 'sold' | 'deleted' | 'pending';
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id?: string;
  sender: User | string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Chat {
  _id: string;
  buyerId: User;
  sellerId: User;
  listingId: Listing;
  messages: Message[];
  lastActivity: Date;
  isActive: boolean;
}