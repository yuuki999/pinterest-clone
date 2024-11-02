'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/shadcn/ui/button';
import ProfileAvatar from '@/app/profile/components/ProfileAvatar';
import { ScrollArea, ScrollBar } from '@/app/components/shadcn/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { Comment } from '@/app/types/comment';

interface PinCommentsProps {
  pinId: string;
  onCommentSubmit: (comment: string) => Promise<void>;
}

export function PinComments({ pinId, onCommentSubmit }: PinCommentsProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${pinId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [pinId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/comments/${pinId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error('Failed to submit comment');

      const newComment = await response.json();
      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>コメントを読み込み中...</div>;
  }

  // メールアドレスから@より前の部分を取得する関数
  const getDisplayName = (name: string | null, email?: string | null): string => {
    return (name || (email?.split('@')[0])) ?? '?';
  };


  return (
    <div className="flex flex-col h-full">
      {/* コメントセクション - 残りの高さを埋める */}
      <div className="flex-1 overflow-hidden">
        <h2 className="font-semibold text-lg mb-4 text-gray-900">コメント</h2>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-4 pr-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-gray-900">
                <ProfileAvatar
                  imageKey={comment.user.image}
                  fallback={(getDisplayName(comment.user.name, comment.user.email))[0]}
                  className="h-8 w-8 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {getDisplayName(comment.user.name, session?.user?.email)}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* コメント入力フォーム - 固定位置 */}
      {session ? (
        <form onSubmit={handleSubmit} className="mt-2 pt-4 border-t">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              imageKey={session.user?.image}
              fallback={session.user?.email?.[0] || '?'}
              className="h-8 w-8 flex-shrink-0"
            />
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button 
              type="submit" 
              disabled={!comment.trim() || isSubmitting}
              className="flex-shrink-0"
            >
              投稿
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
          コメントを投稿するにはログインしてください
        </p>
      )}
    </div>
  );
}
