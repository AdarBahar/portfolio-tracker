import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { AvatarProps } from '@/types/profileHeader';

/**
 * ProfileAvatar Component
 * Displays user avatar with optional upload capability
 * Features:
 * - Circular avatar with gradient placeholder
 * - Camera icon overlay for upload
 * - Loading state with spinner
 * - Responsive sizing
 * - Light/dark mode support
 */
export default function ProfileAvatar({
  src,
  size = 'md',
  name,
  editable = false,
  onUpload,
  isLoading = false,
  tier,
}: AvatarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Size mappings
  const sizeMap = {
    sm: { container: 'w-16 h-16', text: 'text-lg', icon: 'w-4 h-4' },
    md: { container: 'w-20 h-20', text: 'text-2xl', icon: 'w-5 h-5' },
    lg: { container: 'w-24 h-24', text: 'text-3xl', icon: 'w-6 h-6' },
  };

  const sizes = sizeMap[size];
  const initials = name.charAt(0).toUpperCase();

  // Generate gradient colors based on name
  const getGradientColor = (str: string) => {
    const colors = [
      'from-purple-500 to-blue-500',
      'from-blue-500 to-cyan-500',
      'from-pink-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-orange-500 to-pink-500',
    ];
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpload) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Avatar Container */}
      <div
        className={`
          ${sizes.container}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          bg-gradient-to-br ${getGradientColor(name)}
          shadow-lg
          transition-all duration-200
          ${editable && isHovering ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          ${isLoading || isUploading ? 'opacity-75' : ''}
        `}
      >
        {src && !imageLoadFailed ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={() => setImageLoadFailed(true)}
          />
        ) : (
          <span className={`${sizes.text} font-bold text-white`}>
            {initials}
          </span>
        )}
      </div>

      {/* Tier Ring (Optional) */}
      {tier && (
        <div className="absolute -bottom-1 -right-1 px-2 py-1 bg-warning text-warning-foreground text-xs font-semibold rounded-full shadow-md">
          {tier}
        </div>
      )}

      {/* Camera Icon Overlay */}
      {editable && (
        <>
          <label
            className={`
              absolute inset-0
              rounded-full
              flex items-center justify-center
              cursor-pointer
              transition-all duration-200
              ${isHovering ? 'bg-black/40' : 'bg-black/0'}
            `}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              aria-label="Upload avatar"
            />

            {isUploading ? (
              <Loader2 className={`${sizes.icon} text-white animate-spin`} />
            ) : (
              <Camera
                className={`
                  ${sizes.icon}
                  text-white
                  transition-all duration-200
                  ${isHovering ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}
                `}
              />
            )}
          </label>
        </>
      )}

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
          <Loader2 className={`${sizes.icon} text-white animate-spin`} />
        </div>
      )}
    </div>
  );
}

