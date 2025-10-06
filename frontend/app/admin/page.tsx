'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Listing, User } from '@/types';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  activeListings: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'listings' | 'reports'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    activeListings: 0,
    totalRevenue: 0,
  });
  
  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    if (!user?.isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const response = await api.get('/admin/listings');
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    try {
      await api.patch(`/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ned successfully`);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/admin/listings/${listingId}/${action}`);
      toast.success(`Listing ${action}d successfully`);
      fetchListings(); // Refresh listings list
      fetchDashboardData(); // Update stats
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      toast.error(`Failed to ${action} listing`);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => {
        setActiveTab(id as any);
        if (id === 'users' && users.length === 0) fetchUsers();
        if (id === 'listings' && listings.length === 0) fetchListings();
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  if (!user?.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="text-red-600 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, listings, and monitor platform activity</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        <TabButton 
          id="dashboard" 
          label="Dashboard" 
          icon={<ChartBarIcon className="h-5 w-5" />} 
        />
        <TabButton 
          id="users" 
          label="Users" 
          icon={<UserIcon className="h-5 w-5" />} 
        />
        <TabButton 
          id="listings" 
          label="Listings" 
          icon={<DocumentTextIcon className="h-5 w-5" />} 
        />
        <TabButton 
          id="reports" 
          label="Reports" 
          icon={<ExclamationTriangleIcon className="h-5 w-5" />} 
        />
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<UserIcon className="h-6 w-6" />}
                color="blue"
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings}
                icon={<DocumentTextIcon className="h-6 w-6" />}
                color="green"
              />
              <StatCard
                title="Pending Approval"
                value={stats.pendingListings}
                icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                color="yellow"
              />
              <StatCard
                title="Total Revenue"
                value={formatPrice(stats.totalRevenue)}
                icon={<ChartBarIcon className="h-6 w-6" />}
                color="purple"
              />
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    New user registered: user{i}@example.com
                  </p>
                  <span className="text-xs text-gray-500 ml-auto">
                    {i} hours ago
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
          </div>

          {usersLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.picture ? (
                            <Image
                              src={user.picture}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt || Date.now().toString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleUserAction(user._id, user.isActive ? 'ban' : 'unban')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Ban' : 'Unban'}
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Listing Management</h3>
            <p className="text-sm text-gray-600">Review and moderate listings</p>
          </div>

          {listingsLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <div key={listing._id} className="p-6 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {listing.title}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {listing.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatPrice(listing.price)}</span>
                      <span>•</span>
                      <span>{listing.location}</span>
                      <span>•</span>
                      <span>{formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : listing.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {listing.status}
                    </span>
                    
                    {listing.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleListingAction(listing._id, 'approve')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                          title="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleListingAction(listing._id, 'reject')}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
          <div className="text-center py-12 text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Reports functionality coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}