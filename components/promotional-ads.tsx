 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getAdsByPosition } from '@/services/ads';

interface Ad {
  _id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  position: string;
}

interface PromotionalAdsProps {
  position: string;
  className?: string;
}

export default function PromotionalAds({ position, className = '' }: PromotionalAdsProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const response = await getAdsByPosition(position);
        if (response.success && response.ads.length > 0) {
          setAds(response.ads);
        }
      } catch (error) {
        console.error('Error fetching promotional ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  useEffect(() => {
    // Auto-rotate ads if there are multiple
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (loading) {
    return <div className={`h-32 bg-muted/50 animate-pulse rounded-lg ${className}`}></div>;
  }

  if (ads.length === 0) {
    return null; // Don't show anything if no ads are available
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <motion.div
        key={currentAd._id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {currentAd.link ? (
          <Link href={currentAd.link} className="block relative aspect-[3/1] rounded-lg overflow-hidden group">
            <Image
              src={currentAd.image}
              alt={currentAd.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
              <h3 className="text-xl font-bold mb-1">{currentAd.title}</h3>
              <p className="text-sm max-w-xl">{currentAd.description}</p>
            </div>
          </Link>
        ) : (
          <div className="relative aspect-[3/1] rounded-lg overflow-hidden">
            <Image
              src={currentAd.image}
              alt={currentAd.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
              <h3 className="text-xl font-bold mb-1">{currentAd.title}</h3>
              <p className="text-sm max-w-xl">{currentAd.description}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dots indicator for multiple ads */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentAdIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentAdIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}