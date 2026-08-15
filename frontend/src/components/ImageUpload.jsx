import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useUploadImageMutation } from '../store/adminApiSlice';
import { toast } from 'sonner';
import { getApiOrigin } from '../utils/apiConfig';
import { Skeleton } from './ui/skeleton';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() || '';

const ImageUpload = ({ value, onChange, label, shape = 'rectangle', category = 'general' }) => {
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    const ext = getExtension(file.name);
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext) || !ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WebP images are allowed');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('File size exceeds 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
      const res = await uploadImage(formData).unwrap();
      // res now contains the full Cloudinary asset object
      onChange(res); 
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // Helper to get image URL from either string or object
  const getImageUrl = (val) => {
    if (!val) return '';
    const url = typeof val === 'string' ? val : val.url;
    if (!url) return '';
    return url.startsWith('http') ? url : `${getApiOrigin()}${url}`;
  };

  const displayUrl = getImageUrl(value);

  const shapeClasses = shape === 'circle' ? 'rounded-full aspect-square' : 'rounded-xl aspect-video';

  return (
    <div className="space-y-2 w-full h-full flex flex-col">
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
      
      {displayUrl ? (
        <div className={`relative group overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 w-full h-full ${shapeClasses}`}>
          <img 
            src={displayUrl} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`
            relative border-2 border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center text-center gap-1 w-full h-full
            ${shape === 'circle' ? 'rounded-full p-2' : 'rounded-xl p-4'}
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          {isLoading ? (
            <div className="w-full px-4 space-y-3">
              <Skeleton className="mx-auto h-10 w-10 rounded-full" />
              {shape !== 'circle' && (
                <>
                  <Skeleton className="mx-auto h-3 w-20" />
                  <Skeleton className="mx-auto h-2 w-28" />
                </>
              )}
            </div>
          ) : (
            <>
              <div className={`bg-primary/10 rounded-full text-primary ${shape === 'circle' ? 'p-1.5' : 'p-2'}`}>
                <Upload size={shape === 'circle' ? 18 : 20} />
              </div>
              <div className={shape === 'circle' ? 'hidden' : 'block'}>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Upload
                </p>
                <p className="text-[8px] text-gray-400">
                  Max 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
