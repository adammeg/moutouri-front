'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background z-10" />
      
      {/* Animated motorcycle silhouettes */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.15, x: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-[10%] left-[5%] opacity-15 z-0"
      >
        <Image 
          src="images/motorcycle-silhouette1.png"   
          alt="" 
          width={300} 
          height={180} 
          className="object-contain"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-[50%] right-[5%] opacity-20 z-0"
      >
        <Image 
          src="images/motorcycle-silhouette2.png" 
          alt="" 
          width={350} 
          height={200} 
          className="object-contain"
        />
      </motion.div>
      
      {/* Main background image */}
      <Image 
        src="images/hero-background.png" 
        alt="Motorcycle background" 
        fill
        priority
        className="object-cover object-center opacity-30"
      />
    </div>
  );
} 