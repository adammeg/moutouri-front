"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ImageTest() {
  const [imgSrc, setImgSrc] = useState('')
  
  useEffect(() => {
    // This should log your Next.js config
    console.log('Next.js image domains:', process.env.NEXT_PUBLIC_IMAGE_DOMAINS)
  }, [])
  
  return (
    <div>
      <h2>Image Test</h2>
      <p>Testing image from localhost:5000</p>
      <div style={{ position: 'relative', width: '300px', height: '200px' }}>
        {imgSrc ? (
          <Image 
            src={imgSrc} 
            alt="Test image"
            fill
            style={{ objectFit: 'contain' }}
            onError={() => console.error('Image failed to load')}
          />
        ) : (
          <button
            onClick={() => setImgSrc('http://localhost:5000/uploads/products/images-1742525819704-499711994.webp')}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Load Test Image
          </button>
        )}
      </div>
    </div>
  )
} 