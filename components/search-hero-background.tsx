'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SearchHeroBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/90 z-10" />
      
      {/* Main background image */}
      <Image 
        src="/images/hero-background.jpg" 
        alt="" 
        fill
        priority
        className="object-cover object-center"
      />
    </div>
  );
} 