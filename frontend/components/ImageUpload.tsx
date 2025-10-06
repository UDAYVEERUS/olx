'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  existingImages = [] 
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - images.length - existingImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = [...images, ...filesToAdd];
    setImages(newImages);

    // Create previews for new files
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    onImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const isExistingImage = index < existingImages.length;
    
    if (isExistingImage) {
      // Remove from existing images
      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setPreviews(prev => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    } else {
      // Remove from new images
      const newImageIndex = index - existingImages.length;
      const newImages = [...images];
      newImages.splice(newImageIndex, 1);
      setImages(newImages);
      
      // Clean up preview URL
      const previewToRemove = previews[index];
      if (previewToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(previewToRemove);
      }
      
      setPreviews(prev => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
      
      onImagesChange(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={preview}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add Image Button */}
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <PhotoIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500 mt-2">Add Image</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <p className="text-sm text-gray-500">
        {previews.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}