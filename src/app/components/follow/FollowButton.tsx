'use client';

import { useState } from 'react';
import { Button } from '@/app/components/shadcn/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  currentUserId?: string;
  initialIsFollowing: boolean;
  onSuccess?: () => void;
}

export function FollowButton({ 
  targetUserId, 
  currentUserId, 
  initialIsFollowing,
  onSuccess 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUserId) {
      // ログインページへリダイレクトするなどの処理
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: targetUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow');
      }

      setIsFollowing(!isFollowing);
      onSuccess?.();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUserId === targetUserId) {
    return null; // 自分自身の場合はボタンを表示しない
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="lg"
      onClick={handleFollow}
      disabled={isLoading || !currentUserId}
      className="ml-8 font-medium hover:opacity-90"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          フォロー
        </>
      )}
    </Button>
  );
}
