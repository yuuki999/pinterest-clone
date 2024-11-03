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

    // メイソンリーレイアウトを採用
    // https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout/Masonry_layout
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {pins.map((pin) => (
            <div 
              key={pin.id} 
              onClick={() => handlePinClick(pin)}
              className="flex justify-center"
            >
              <div className="w-full max-w-[300px] cursor-pointer">
                <div className="aspect-[3/4] relative">
                  <PinCard
                    pin={pin}
                    isSaved={pin.saved}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(hasMore || loading) && (
          <div 
            ref={ref}
            className="w-full py-8"
          >
            {loading && renderSkeletons()}
          </div>
        )}
      </div>
    );
}
