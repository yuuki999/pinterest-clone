import { useState } from 'react';

interface UseLikeProps {
  pinId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export const useLike = ({ 
  pinId, 
  initialLiked = false, 
  initialCount = 0 
}: UseLikeProps) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // いいねをつける機能
  const toggleLike = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/likes/${pinId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ピンに対する、いいねの状態を取得する。
  const fetchLikeStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/likes/${pinId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch like status');
      }

      const { liked, count } = await response.json();

      console.log("ピンに対するいいねの状態")
      console.log(liked)
      
      setIsLiked(liked);
      setLikeCount(count);
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLoading,
    toggleLike,
    fetchLikeStatus
  };
};
