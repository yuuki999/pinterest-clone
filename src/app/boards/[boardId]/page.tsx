'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/shadcn/ui/avatar';
import { Skeleton } from '@/app/components/shadcn/ui/skeleton';

interface BoardDetail {
  id: string;
  title: string;
  pins: Pin[];
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Pin {
  id: string;
  imageUrl: string;
  title: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

// TODO: 一覧画面からピンを保存するときに、ボードを選択できるようにして、ボードで保存したらそのボードにピンを表示する。
function BoardSkeleton() {
  return (
    <div className="container mx-auto px-4 pt-8">
      <div className="mb-8">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="flex items-center justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await fetch(`/api/boards/${boardId}`);
        const data = await response.json();
        setBoard(data);
      } catch (error) {
        console.error('Failed to fetch board:', error);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  if (loading) {
    return <BoardSkeleton />;
  }

  if (!board) {
    return <div>ボードが見つかりません</div>;
  }

  const uniqueUsers = board.user ? Array.from(
    new Set([
      board.user.id,
      ...(board.pins?.map(pin => pin.user?.id) || []).filter(Boolean)
    ])
  ).map(userId => 
    [board.user, ...(board.pins?.map(pin => pin.user) || [])]
      .find(user => user?.id === userId)
  ).filter(Boolean) : [];

  return (
    <div className="container mx-auto px-4 pt-8">
      <div className="mb-8">
        <h1 className="text-sm font-normal mb-6">
          ピン：{board.pins?.length || 0}件
        </h1>

        <div className="flex items-center justify-center space-x-2">
          {uniqueUsers.map((user, index) => (
            <Avatar key={user?.id || index} className="w-12 h-12">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>
                {user?.name?.slice(0, 2).toUpperCase() || 'UN'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {board.pins?.map((pin) => (
          <div key={pin.id} className="rounded-lg overflow-hidden">
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
