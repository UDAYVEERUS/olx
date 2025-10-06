'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CameraIcon } from '@heroicons/react/24/outline';

interface ProfileForm {
  name: string;
  phone: string;
  email: string;
}

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [stats, setStats] = useState({ activeListings: 0, totalListings: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone || '');
      fetchUserStats();
    }
  }, [user, isAuthenticated, setValue]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/listings/user/my-listings');
      const listings = response.data?.data?.listings || response.data?.listings || [];
      setStats({
        activeListings: listings.filter((l: any) => l.status === 'active').length,
        totalListings: listings.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const response = await api.patch('/auth/me', {
        name: data.name,
        phone: data.phone
      });
      const updatedUser = response.data?.data?.user || response.data?.user;
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = response.data?.data?.user || response.data?.user;
      updateUser(updatedUser);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const userAvatar = user.avatar || user.picture;
  const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-2xl font-bold text-gray-600">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}

              {/* Upload Button Overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading}
                />
                {imageUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
                ) : (
                  <CameraIcon className="h-6 w-6 text-white" />
                )}
              </label>
            </div>

            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="opacity-90">{user.email}</p>
              <p className="text-sm opacity-75">
                Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Account Stats */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeListings}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalListings}</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}