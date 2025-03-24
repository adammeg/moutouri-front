'use client';

import { useEffect, useRef } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  responsive?: boolean;
  className?: string;
}

export default function GoogleAdSense({
  slot,
  format = 'auto',
  style = {},
  responsive = true,
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Check if the adsense script is loaded
    const hasAdsenseScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    
    // Only insert ads when the adsense script has been loaded
    if (hasAdsenseScript && adRef.current) {
      try {
        // Clean the current ad container to avoid duplicated ads
        adRef.current.innerHTML = '';
        
        // Push ad to the slot
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error loading AdSense ad:', error);
      }
    }
  }, [slot]);

  // Add default styling based on responsive setting
  const defaultStyle: React.CSSProperties = responsive
    ? {
        display: 'block',
        textAlign: 'center',
        ...style,
      }
    : {
        display: 'inline-block',
        ...style,
      };

  return (
    <div className={className} style={{ overflow: 'hidden', ...defaultStyle }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8717268919598293"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}