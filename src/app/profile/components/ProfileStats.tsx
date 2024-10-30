'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FollowModal, FollowUser } from './follow/FollowModal';

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
  const [followData, setFollowData] = useState<{
    followers: FollowUser[];
    following: FollowUser[];
    stats: FollowStats;
  } | null>(null);
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/${userId}/follow-data`);
        const data = await response.json();
        console.log(data)
        setFollowData(data);
      } catch (error) {
        console.error('Failed to fetch follow data:', error);
      }
    };

    fetchData();
  }, [userId]);

  // フォロー/アンフォローの状態を切り替える関数
  const handleFollowToggle = async (targetUserId: string) => {
    try {
      // 現在のフォロー状態を取得
      const currentData = followData!;
      const allUsers = [...currentData.followers, ...currentData.following];
      const targetUser = allUsers.find(u => u.id === targetUserId);
      const isFollowing = targetUser?.isFollowing;
  
      // APIリクエスト
      const response = await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: targetUserId }),
      });
  
      if (!response.ok) throw new Error('フォロー操作に失敗しました');
  
      // フォロー状態の更新
      setFollowData(prev => {
        if (!prev) return null;
  
        const updateUsers = (users: FollowUser[]) =>
          users.map(user => {
            if (user.id === targetUserId) {
              return { ...user, isFollowing: !isFollowing };
            }
            return user;
          });
  
        return {
          ...prev,
          followers: updateUsers(prev.followers),
          following: updateUsers(prev.following),
          stats: {
            followersCount: prev.stats.followersCount,
            followingCount: isFollowing 
              ? prev.stats.followingCount - 1 
              : prev.stats.followingCount + 1
          }
        };
      });
    } catch (error) {
      console.error('フォロー操作エラー:', error);
    }
  };

  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold">{displayName}</h1>
      <p className="text-muted-foreground">@{handle}</p>
      <div className="text-sm text-muted-foreground">
        {!followData ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          <p className="flex items-center justify-center gap-1">
            <button
              onClick={() => setModalType('followers')}
              className="hover:underline hover:text-foreground transition-colors"
            >
              {followData.stats.followersCount} フォロワー
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType('following')}
              className="hover:underline hover:text-foreground transition-colors"
            >
              {followData.stats.followingCount} フォロー中
            </button>
          </p>
        )}
      </div>

      {modalType && followData && (
        <FollowModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type={modalType}
          users={modalType === 'followers' ? followData.followers : followData.following}
          onFollowToggle={handleFollowToggle}
        />
      )}
    </div>
  );
}
