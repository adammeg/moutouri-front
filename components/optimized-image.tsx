import { useState } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/cloudinary-client';
import { IMAGE_BASE_URL } from '@/config/config';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 300,
  className,
  fallbackSrc = '/placeholder-image.png',
  priority = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  
  // If no source provided, show fallback
  if (!src) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt || 'Placeholder image'}
        width={width}
        height={height}
        className={className}
      />
    );
  }
  
  // Process the src to determine if it's a Cloudinary URL
  let imageSrc = src;
  
  // If it's a relative path, add the base URL
  if (src.startsWith('/')) {
    imageSrc = `${IMAGE_BASE_URL}${src.slice(1)}`;
  }
  
  // If it's a Cloudinary URL, use our optimized version
  if (src.includes('cloudinary.com') || src.includes('res.cloudinary.com')) {
    imageSrc = getOptimizedImageUrl(src, { width, height });
  }
  
  return (
    <Image
      src={error ? fallbackSrc : imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      priority={priority}
      sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`}
    />
  );
}