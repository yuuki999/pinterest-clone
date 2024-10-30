'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/shadcn/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/shadcn/ui/avatar";
import { Button } from "@/app/components/shadcn/ui/button";
import { UserMinus, UserPlus } from "lucide-react";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";

export interface FollowUser {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing: boolean;
}

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  users: FollowUser[];
  onFollowToggle: (userId: string) => Promise<void>;
}

export function FollowModal({ isOpen, onClose, type, users, onFollowToggle }: FollowModalProps) {

  // TODO: フォロー中なら「フォロー解除とする。」
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'フォロワー' : 'フォロー中'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {users.length === 0 ? (
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
                    onClick={() => onFollowToggle(user.id)}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        フォロー解除
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
