'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/shadcn/ui/button';
import { useSession } from 'next-auth/react';
import ProfileAvatar from '@/app/profile/components/ProfileAvatar';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PinCommentsProps {
  pinId: string;
}

export function PinComments({ pinId }: PinCommentsProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // コメントを取得
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

  // コメントを作成
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

  return (
    <>
      <div className="flex-1 min-h-0">
        <h2 className="font-semibold text-lg mb-4">コメント</h2>
        <div className="space-y-4 overflow-y-auto max-h-[400px]">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 text-gray-900">
              <ProfileAvatar
                imageKey={comment.user.image}
                fallback={comment.user.name?.[0] || '?'}
                className="h-8 w-8"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {comment.user.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              imageKey={session.user?.image}
              fallback={session.user?.name?.[0] || 'U'}
              className="h-8 w-8"
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
            >
              投稿
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-center text-sm text-gray-500">
          コメントを投稿するにはログインしてください
        </p>
      )}
    </>
  );
}
