'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/shadcn/ui/avatar';
import { FollowButton } from '@/app/components/follow/FollowButton';
import ProfileAvatar from '@/app/profile/components/ProfileAvatar';

interface PinAuthorProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string | Date;
  currentUserId?: string | null;
  initialIsFollowing?: boolean;
  className?: string;
}

export function PinAuthorSection({
  author,
  createdAt,
  currentUserId,
  initialIsFollowing,
  className = ''
}: PinAuthorProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ProfileAvatar
        imageKey={author.image}
        fallback={author.name?.[0] || '?'}
        className="h-8 w-8"
      />
      <div className="flex items-center justify-between flex-1">
        <div>
          <p className="font-semibold text-gray-900">{author.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        {/* 自分自身の時はフォローボタンを表示しない. */}
        {currentUserId && currentUserId !== author.id && (
          <FollowButton
            targetUserId={author.id}
            currentUserId={currentUserId}
            initialIsFollowing={initialIsFollowing}
          />
        )}
      </div>
    </div>
  );
}
