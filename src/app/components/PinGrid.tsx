'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Pin } from '@/app/types/pin';

type PinGridProps = {
  initialPins: Pin[];
  initialCursor: string | null;
};

export function PinGrid({ initialPins, initialCursor }: PinGridProps) {
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(true); // 多分画面一番したに移動した時に無限スクロールする用の機能
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    const loadMore = async () => {
      // console.log("Status Check:");
      // console.log("- inView:", inView);
      // console.log("- loading:", loading);
      // console.log("- cursor:", cursor);
      // console.log("- hasMore:", hasMore);
      
      if (inView && !loading && cursor && hasMore) {
        setLoading(true);
        try {
          const response = await fetch(`/api/pins?cursor=${cursor}`);
          const data = await response.json();
          console.log("Fetched Data:", data);
          
          if (data.pins.length > 0) {
            setPins(prev => [...prev, ...data.pins]);
            setCursor(data.nextCursor);
          } else {
            setHasMore(false);
          }
          
          if (!data.nextCursor) {
            setHasMore(false);
          }
        } catch (error) {
          console.error('Error loading more pins:', error);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMore();
  }, [inView, loading, cursor, hasMore]);

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="break-inside-avoid mb-4 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="relative group">
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{pin.title}</h3>
              {pin.description && (
                <p className="text-gray-600 text-sm mb-3">{pin.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* {pin.user.image ? (
                    <img
                      src={pin.user.image}
                      alt={pin.user.name || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )} */}
                  {/* <span className="text-sm font-medium">{pin.user.name}</span> */}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-gray-600">
                    <Heart className="w-4 h-4" />
                    {/* <span className="text-sm">{pin._count.likes}</span> */}
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">0</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {(hasMore || loading) && (
        <div 
          ref={ref}
          className="w-full py-8 flex justify-center items-center"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="h-16" /> // スペーサー
          )}
        </div>
      )}
    </>
  );
}
