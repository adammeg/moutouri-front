"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

type SafeImageProps = ImageProps & {
  fallbackWidth?: number;
  fallbackHeight?: number;
}

export default function SafeImage({ src, alt, fallbackWidth, fallbackHeight, ...props }: SafeImageProps) {
  const [imgError, setImgError] = useState(false)
  
  // If Next/Image fails, use regular img tag
  if (imgError) {
    return (
      <img 
        src={src as string} 
        alt={alt as string}
        width={fallbackWidth || props.width}
        height={fallbackHeight || props.height}
        style={{ objectFit: 'cover', ...props.style }}
        className={props.className}
      />
    )
  }
  
  // First try Next/Image
  return (
    <Image 
      {...props}
      src={src}
      alt={alt || ""}
      onError={() => setImgError(true)}
    />
  )
} 