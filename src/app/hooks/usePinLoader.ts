import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Pin } from '../types/pin';

// 無限スクロールするためのカスタムフック
export const usePinLoader = (initialPins: Pin[], initialCursor: string | null) => {
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(initialCursor); // ページネーションのために次のデータの位置を追跡
  const [hasMore, setHasMore] = useState(true); // データがさらにあるかどうか(スクロールできるかどうか)
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // 要素が画面に入る100px手前で検知を開始
  });

  // pinsテーブルからデータを取得する。
  useEffect(() => {
    const loadMore = async () => {
      // console.log("データが実行されるかどうか")
      if (inView && !loading && cursor && hasMore) {
        setLoading(true);
        try {
          const response = await fetch(`/api/pins?cursor=${cursor}`);
          const data = await response.json();
          
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
  // }, [inView, loading, cursor, hasMore]);
  }, []);

  return { pins, loading, hasMore, ref };
};
