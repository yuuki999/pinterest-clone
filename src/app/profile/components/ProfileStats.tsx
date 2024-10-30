'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FollowModal } from './follow/FollowModal';

interface FollowStats {
  followersCount: number;
  followingCount: number;
}

interface ProfileStatsProps {
  userId: string;
  displayName: string;
  handle: string;
}

export function ProfileStats({ userId, displayName, handle }: ProfileStatsProps) {
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold">{displayName}</h1>
      <p className="text-muted-foreground">@{handle}</p>
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          <p className="flex items-center justify-center gap-1">
            <button
              onClick={() => setModalType('followers')}
              className="hover:underline hover:text-foreground transition-colors"
            >
              {stats?.followersCount || 0} フォロワー
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType('following')}
              className="hover:underline hover:text-foreground transition-colors"
            >
              {stats?.followingCount || 0} フォロー中
            </button>
          </p>
        )}
      </div>

      {modalType && (
        <FollowModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type={modalType}
          userId={userId}
        />
      )}
    </div>
  );
}
