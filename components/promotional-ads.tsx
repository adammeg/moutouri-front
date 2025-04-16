'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getAdsByPosition, trackAdView, trackAdClick } from '@/services/ads';
import { Loader2 } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  
  // FIXED: Use ref for interval to ensure proper cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🎯 Fetching ads for position: ${position}`);
        const response = await getAdsByPosition(position);
        
        if (response.success && response.ads.length > 0) {
          console.log(`✅ Found ${response.ads.length} ads for position: ${position}`);
          setAds(response.ads);
          
          // Track impression for the first ad shown
          if (response.ads[0]._id) {
            trackAdView(response.ads[0]._id).catch(err => {
              // Silently handle tracking errors - non-critical
              console.warn('Failed to track ad view:', err);
            });
          }
        } else {
          console.log(`ℹ️ No ads found for position: ${position}`);
          setAds([]);
        }
      } catch (error) {
        console.error('Error fetching promotional ads:', error);
        setError('Failed to load promotional content');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
    
    // FIXED: Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [position]);

  // FIXED: Better ad rotation with cleanup
  useEffect(() => {
    // Auto-rotate ads if there are multiple
    if (ads.length > 1) {
      // Clear any existing interval before setting a new one
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setCurrentAdIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % ads.length;
          
          // Track impression for the new ad
          if (ads[newIndex]?._id) {
            trackAdView(ads[newIndex]._id).catch(err => {
              console.warn('Failed to track ad rotation view:', err);
            });
          }
          
          return newIndex;
        });
      }, 4000); // Rotate every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ads.length, ads]);

  // FIXED: Better error handling for tracking clicks
  const handleAdClick = (adId: string) => {
    trackAdClick(adId).catch(err => {
      console.warn('Failed to track ad click:', err);
      // Continue with click action despite tracking error
    });
  };

  // FIXED: Handle image loading error
  const handleImageError = () => {
    console.error(`Failed to load ad image for position: ${position}`);
    setImgError(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-32 bg-muted/50 animate-pulse rounded-lg ${className}`}>
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error || ads.length === 0 || imgError) {
    // Return null to not display anything if there's an error or no ads
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // FIXED: Better image handling
  const AdContent = () => (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <motion.div
        key={currentAd._id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="relative aspect-[3/1] rounded-lg overflow-hidden group">
          <Image
            src={currentAd.image}
            alt={currentAd.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
            <h3 className="text-xl font-bold mb-1">{currentAd.title}</h3>
            <p className="text-sm max-w-xl">{currentAd.description}</p>
          </div>
        </div>
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
              onClick={() => {
                setCurrentAdIndex(index);
                if (ads[index]._id) {
                  handleAdClick(ads[index]._id);
                }
              }}
              aria-label={`View ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return currentAd.link ? (
    <Link href={currentAd.link} target="_blank" rel="noopener noreferrer" 
          onClick={() => currentAd._id && handleAdClick(currentAd._id)}
          aria-label={currentAd.title}>
      <AdContent />
    </Link>
  ) : (
    <AdContent />
  );
}