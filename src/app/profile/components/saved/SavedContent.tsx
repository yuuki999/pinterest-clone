'use client';

import { PinCard } from '@/app/components/PinCard';
import { PinCardSkeleton } from '@/app/components/PinCardSkeleton';
import { useState, useEffect } from 'react';


interface SavedPin {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  savedAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface SavedContentProps {
  userId: string;
}

export function SavedContent({ userId }: SavedContentProps) {
  const [savedPins, setSavedPins] = useState<SavedPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSavedPins();
    }
  }, [userId]);

  const fetchSavedPins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/profile/saved-pins');
      if (!response.ok) {
        throw new Error('Failed to fetch saved pins');
      }
      const data = await response.json();
      setSavedPins(data.pins);
      
      // 画像のプリロード
      await preloadImages(data.pins);
    } catch (err) {
      setError('Failed to load saved pins');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const preloadImages = (pins: SavedPin[]) => {
    return Promise.all(
      pins.map(
        (pin) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.src = pin.imageUrl;
            img.onload = resolve;
            img.onerror = reject;
          })
      )
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <PinCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (savedPins.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        保存したピンはまだありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {savedPins.map((pin) => (
        <PinCard
          key={pin.id}
          pin={pin}
          isLoaded={true}
          showTitle={true}
          isSaved={true}
          onSaveToggle={fetchSavedPins}
        />
      ))}
    </div>
  );
}
