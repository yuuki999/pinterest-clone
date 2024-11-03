"use client";

import { useRouter } from 'next/navigation';
import { usePinLoader } from '../hooks/usePinLoader';
import { PinCardSkeleton } from './PinCardSkeleton';
import { useEffect } from 'react';
import { fetchBoardsAtom } from '../atoms/boardAtom';
import { useAtom } from 'jotai';
import { PinCard } from './PinCard';
import { Pin } from '../types/pin';
import MasonryGrid from './grid/MasonryGrid';

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
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
      <MasonryGrid columnWidth={300} gap={16}>
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
      
      {(hasMore || loading) && (
        <div 
          ref={ref}
          className="w-full py-8"
        >
          {loading && (
            <MasonryGrid columnWidth={300} gap={16}>
              {renderSkeletons()}
            </MasonryGrid>
          )}
        </div>
      )}
    </div>
  );
}
