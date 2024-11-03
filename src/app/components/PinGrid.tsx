'use client';

import { useRouter } from 'next/navigation';
import { usePinLoader } from '../hooks/usePinLoader';
import { PinCardSkeleton } from './PinCardSkeleton';
import { useEffect } from 'react';
import { fetchBoardsAtom } from '../atoms/boardAtom';
import { useAtom } from 'jotai';
import { PinCard } from './PinCard';
import { Pin } from '../types/pin';

interface PinGridProps {
  initialPins: Pin[];
  initialCursor: string | null;
}

export function PinGrid({ initialPins, initialCursor }: PinGridProps) {
  const router = useRouter();
  const { pins, loading, hasMore, ref } = usePinLoader(initialPins, initialCursor);
  const [, fetchBoards] = useAtom(fetchBoardsAtom);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handlePinClick = (pin: Pin) => {
    router.push(`/pins/${pin.id}`);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <div key={`skeleton-${index}`}>
        <PinCardSkeleton />
      </div>
    ));
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pins.map((pin) => (
          <div 
            key={pin.id} 
            onClick={() => handlePinClick(pin)}
            className="cursor-pointer"
          >
            <PinCard
              pin={pin}
              isSaved={pin.saved}
            />
          </div>
        ))}
      </div>
      
      {(hasMore || loading) && (
        <div 
          ref={ref}
          className="w-full py-8 flex justify-center items-center"
        >
          {loading && renderSkeletons()}
        </div>
      )}
    </div>
  );
}
