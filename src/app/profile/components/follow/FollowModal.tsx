'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/shadcn/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/shadcn/ui/avatar";
import { Button } from "@/app/components/shadcn/ui/button";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";

interface FollowUser {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing: boolean;
}

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: string;
}

export function FollowModal({ isOpen, onClose, type, userId }: FollowModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // フォロワー/フォロー中のユーザーを取得
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}/${type}`);
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, isOpen]);

  // フォロー/アンフォロー処理
  const handleFollowToggle = async (targetUserId: string) => {
    const isFollowing = users.find(u => u.id === targetUserId)?.isFollowing;
    
    try {
      const response = await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: targetUserId }),
      });

      if (!response.ok) throw new Error('Failed to toggle follow');

      // ユーザーリストを更新
      setUsers(users.map(user => {
        if (user.id === targetUserId) {
          return { ...user, isFollowing: !isFollowing };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'フォロワー' : 'フォロー中'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {type === 'followers' ? 'フォロワーはいません' : 'フォロー中のユーザーはいません'}
            </p>
          ) : (
            <div className="space-y-4 p-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                    </div>
                  </div>
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollowToggle(user.id)}
                  >
                    {user.isFollowing ? (
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
