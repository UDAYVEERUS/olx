'use client';
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Listing, Category } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ListingsState {
  listings: Listing[];
  categories: Category[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

interface ListingsContextType extends ListingsState {
  fetchListings: (page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchListings: (query: string) => Promise<void>;
  filterByCategory: (categoryId: string) => Promise<void>;
  createListing: (data: any, hasImages: boolean) => Promise<boolean>;
  updateListing: (id: string, data: any) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

type ListingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LISTINGS'; payload: { listings: Listing[]; total: number; pages: number; page: number } }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_LISTING'; payload: Listing }
  | { type: 'UPDATE_LISTING'; payload: Listing }
  | { type: 'DELETE_LISTING'; payload: string }
  | { type: 'SET_FILTERS'; payload: any }
  | { type: 'RESET_FILTERS' };

const initialState: ListingsState = {
  listings: [],
  categories: [],
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {},
};

const listingsReducer = (state: ListingsState, action: ListingsAction): ListingsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LISTINGS':
      return {
        ...state,
        listings: action.payload.listings,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          pages: action.payload.pages,
          page: action.payload.page,
        },
        loading: false,
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_LISTING':
      return {
        ...state,
        listings: [action.payload, ...state.listings],
      };
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map(listing =>
          listing._id === action.payload._id ? action.payload : listing
        ),
      };
    case 'DELETE_LISTING':
      return {
        ...state,
        listings: state.listings.filter(listing => listing._id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: {} };
    default:
      return state;
  }
};

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(listingsReducer, initialState);

  const fetchListings = async (page: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get(`/listings?page=${page}&limit=${state.pagination.limit}`);

      // Handle nested response structure
      const listings = response.data?.data?.listings || response.data?.listings || [];
      const total = response.data?.data?.pagination?.total || response.data?.pagination?.total || response.data?.data?.total || response.data?.total || 0;
      const pages = response.data?.data?.pagination?.pages || response.data?.pagination?.pages || Math.ceil(total / state.pagination.limit);

      dispatch({
        type: 'SET_LISTINGS',
        payload: {
          listings,
          total,
          pages,
          page,
        },
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to fetch listings');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Full API response:', response.data);
      
      // Handle the nested response structure from your backend
      const categories = response.data?.data?.categories || response.data?.categories || [];

      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch({ type: 'SET_CATEGORIES', payload: [] });
    }
  };

  const searchListings = async (query: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get(`/listings/search?q=${encodeURIComponent(query)}`);
      
      console.log('Search response:', response.data);
      
      // Extract listings properly
      const listings = response.data?.data?.listings || response.data?.listings || [];
      const total = response.data?.data?.pagination?.total || response.data?.pagination?.total || response.data?.data?.total || response.data?.total || listings.length;
      const pages = response.data?.data?.pagination?.pages || response.data?.pagination?.pages || Math.ceil(total / state.pagination.limit);
      
      dispatch({
        type: 'SET_LISTINGS',
        payload: {
          listings,
          total,
          pages,
          page: 1,
        },
      });
      dispatch({ type: 'SET_FILTERS', payload: { search: query } });
    } catch (error) {
      console.error('Error searching listings:', error);
      toast.error('Search failed');
      dispatch({
        type: 'SET_LISTINGS',
        payload: { listings: [], total: 0, pages: 0, page: 1 }
      });
    }
  };

  const filterByCategory = async (categoryId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('Filtering by category ID:', categoryId);
      
      const response = await api.get(`/listings?category=${categoryId}`);
      console.log('Filter response:', response.data);
      
      // Extract listings from response
      const listings = response.data?.data?.listings || response.data?.listings || [];
      const total = response.data?.data?.pagination?.total || response.data?.pagination?.total || response.data?.data?.total || response.data?.total || listings.length;
      const pages = response.data?.data?.pagination?.pages || response.data?.pagination?.pages || Math.ceil(total / state.pagination.limit);
      
      console.log('Filtered listings count:', listings.length);
      
      dispatch({
        type: 'SET_LISTINGS',
        payload: {
          listings,
          total,
          pages,
          page: 1,
        },
      });
      dispatch({ type: 'SET_FILTERS', payload: { category: categoryId } });
    } catch (error) {
      console.error('Error filtering by category:', error);
      toast.error('Failed to load category listings');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createListing = async (data: any, hasImages: boolean): Promise<boolean> => {
    try {
      const response = await api.post('/listings', data, {
        headers: { 
          'Content-Type': hasImages ? 'multipart/form-data' : 'application/json'
        },
      });

      const newListing = response.data?.data?.listing;
      dispatch({ type: 'ADD_LISTING', payload: newListing });
      toast.success('Listing created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
      return false;
    }
  };

  const updateListing = async (id: string, data: any): Promise<boolean> => {
    try {
      const response = await api.patch(`/listings/${id}`, data);
      dispatch({ type: 'UPDATE_LISTING', payload: response.data });
      toast.success('Listing updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
      return false;
    }
  };

  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/listings/${id}`);
      dispatch({ type: 'DELETE_LISTING', payload: id });
      toast.success('Listing deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
      return false;
    }
  };

  const setFilters = (filters: any) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <ListingsContext.Provider
      value={{
        ...state,
        fetchListings,
        fetchCategories,
        searchListings,
        filterByCategory,
        createListing,
        updateListing,
        deleteListing,
        setFilters,
        resetFilters,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};