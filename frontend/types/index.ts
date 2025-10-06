export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  picture?: string;  // ✅ Must be included
  phone?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;  // ✅ Must be included
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
  category: Category;
  images: string[];
  sellerId: User | string;
  location: string;
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