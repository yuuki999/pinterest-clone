'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MasonryGrid from '@/app/components/grid/MasonryGrid';
import { PinCard } from '@/app/components/PinCard';
import { Pin } from '@/app/types/pin';

interface RecommendedPinsProps {
  currentPinId: string;
  initialPins?: Pin[];
}

export function RecommendedPinsSection({ currentPinId, initialPins = [] }: RecommendedPinsProps) {
  const router = useRouter();
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [isLoading, setIsLoading] = useState(!initialPins?.length);

  useEffect(() => {
    const loadRecommendedPins = async () => {
      try {
        // TODO: ここでvertex aiを使用する。
        const response = await fetch(`/api/pins/recommended?excludePinId=${currentPinId}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('Failed to fetch recommended pins');
        const data = await response.json();
        setPins(data.pins);
      } catch (error) {
        console.error('Error loading recommended pins:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // TODO: フェーズ2の機能
    // loadRecommendedPins();
  }, [currentPinId]);

  const handlePinClick = (pin: Pin) => {
    router.push(`/pins/${pin.id}`);
  };

  if (isLoading) {
    return (
      <div className="mt-12 pb-12">
        <div className="w-full">
          <h2 className="text-xl font-bold mb-6 text-gray-900">おすすめ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 rounded-lg" style={{ height: '280px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pb-12">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-6 text-gray-900">おすすめ</h2>
        
        <MasonryGrid columnWidth={236} gap={16}>
          {pins.map((pin) => (
            <div 
              key={pin.id} 
              onClick={() => handlePinClick(pin)}
              className="w-full cursor-pointer"
            >
              <PinCard
                pin={pin}
                isSaved={pin.saved}
              />
            </div>
          ))}
        </MasonryGrid>
      </div>
    </div>
  );
}

export default RecommendedPinsSection;
