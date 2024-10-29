'use client';

import { PinCard } from '@/app/components/PinCard';
import { Pin } from '@/app/types/pin';
import { useImageLoader } from '@/app/hooks/useImageLoader';

interface SimilarPinsProps {
  pins: Pin[];
}

export function SimilarPins({ pins }: SimilarPinsProps) {
  const { imageLoadingStates } = useImageLoader(pins);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pins.map((pin) => (
        <PinCard 
          key={pin.id} 
          pin={pin} 
          isLoaded={imageLoadingStates[pin.id]}
        />
      ))}
    </div>
  );
}
