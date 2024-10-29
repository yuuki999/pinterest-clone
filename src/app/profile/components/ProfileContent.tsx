"use client"

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Share2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/app/components/shadcn/ui/button';
import { Card, CardContent } from '@/app/components/shadcn/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/shadcn/ui/tabs';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/app/components/shadcn/ui/hover-card';
import { Skeleton } from '@/app/components/shadcn/ui/skeleton';
import ProfileAvatar from './ProfileAvatar';
import { User } from '@/app/types/user';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PinCard } from '@/app/components/PinCard';
import { PinCardSkeleton } from '@/app/components/PinCardSkeleton';

type Board = {
  id: number;
  title: string;
  pinCount: number;
  imageUrl: string;
};

type SavedPin = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  savedAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
};

const boards: Board[] = [
  { id: 1, title: "DIYアイデア", pinCount: 128, imageUrl: "" },
  { id: 2, title: "インテリア", pinCount: 85, imageUrl: "" },
  { id: 3, title: "レシピ", pinCount: 246, imageUrl: "" }
];

const ProfileSkeleton = () => (
  <div className="flex flex-col items-center space-y-4 pt-20">
    <Skeleton className="w-32 h-32 rounded-full" />
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-32" />
  </div>
);

const BoardCard = ({ board }: { board: Board }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <Card className="overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]">
        <CardContent className="p-0 aspect-[4/3] relative">
          <img
            src={board.imageUrl}
            alt={board.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg">{board.title}</h3>
            <p className="text-sm opacity-90">{board.pinCount} ピン</p>
          </div>
        </CardContent>
      </Card>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="flex justify-between space-x-4">
        <div>
          <h4 className="text-sm font-semibold">{board.title}</h4>
          <p className="text-sm text-muted-foreground">
            {board.pinCount} 個のピン • 最終更新 1日前
          </p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);

const CreateBoardCard = () => (
  <Card className="cursor-pointer hover:bg-primary/10 transition-colors border-2 border-dashed">
    <CardContent className="aspect-[4/3] flex items-center justify-center">
      <div className="text-center space-y-2">
        <Plus className="w-8 h-8 mx-auto text-primary" />
        <span className="font-semibold text-primary">ボードを作成</span>
      </div>
    </CardContent>
  </Card>
);

// ユーザー名を生成する関数
const generateDisplayName = (user: User) => {
  if (user?.name) return user.name;
  if (user?.email) {
    return user.email.split('@')[0].replace(/\./g, '');
  }
  return 'Unknown User';
};

// ハンドルネームを生成する関数
const generateHandle = (user: User) => {
  if (user?.email) {
    return user.email.split('@')[0].replace(/\./g, '');
  }
  return 'unknown';
};

// 画像プリフェッチ関数を追加
const preloadImages = (pins: SavedPin[]) => {
  return Promise.all(
    pins.map(
      (pin) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.src = pin.imageUrl;
          img.onload = resolve;
          img.onerror = reject;
        })
    )
  );
};

export default function ProfilePage() {
  const [savedPins, setSavedPins] = useState<SavedPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setImagesPreloaded] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // タブが切り替わったときにデータを取得
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedPins();
    }
  }, [status]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  // 保存したピンを取得する関数を更新
  const fetchSavedPins = async () => {
    setIsLoading(true);
    setError(null);
    setImagesPreloaded(false);
    try {
      const response = await fetch('/api/user/profile/saved-pins');
      if (!response.ok) {
        throw new Error('Failed to fetch saved pins');
      }
      const data = await response.json();
      setSavedPins(data.pins);
      
      // 画像のプリロード
      await preloadImages(data.pins);
      setImagesPreloaded(true);
    } catch (err) {
      setError('Failed to load saved pins');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = generateDisplayName(session?.user); // TODO: nullを許可する、nullの場合はUnknown Userを返す
  const handle = generateHandle(session?.user);

  // AvatarFallbackの表示用に頭文字を取得
  const initials = displayName.slice(0, 2).toUpperCase();


  // TODO: 保存済みの部分を別コンポーネントを作成して分離する
  // TODO: 画像のサイズを調整する。プリフェッチする必要がある。
  return (
    <main className="container mx-auto pt-20 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        <ProfileAvatar
          imageKey={session?.user?.image}
          fallback={initials}
          className="w-32 h-32 ring-4 ring-primary/20"
        />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="text-muted-foreground">@{handle}</p>
          <p className="text-sm text-muted-foreground">
            0 フォロワー • 5 フォロー中
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 編集ボタン */}
          <Button
            variant="default"
            size="sm"
            onClick={handleEditProfile}
            className="bg-primary hover:bg-primary/90"
          >
            <Pencil className="w-4 h-4 mr-2" />
            プロフィールを編集
          </Button>

          {/* 共有ボタン */}
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            共有
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="created" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            作成済み
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            保存済み
          </TabsTrigger>
        </TabsList>
        {/* ここは自分が投稿したピンが表示される。 */}
        <TabsContent value="created" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CreateBoardCard />
            {boards.map(board => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </TabsContent>
        {/* カテゴリみたいなやつをつけて保存するとまとまる機能がある。pintarestだと */}
        {/* 全てのピンが一番左上に表示される */}
        <TabsContent value="saved" className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <PinCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              {error}
            </div>
          ) : savedPins.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              保存したピンはまだありません
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedPins.map((pin) => (
                <PinCard
                  key={pin.id}
                  pin={pin}
                  isLoaded={true}
                  showTitle={true}
                  isSaved={true}
                  onSaveToggle={() => {
                    // 保存解除時にリストを更新
                    fetchSavedPins();
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
