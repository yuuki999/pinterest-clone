"use client"

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Share2, MoreHorizontal, Plus, Settings, LogOut } from 'lucide-react';

import { Button } from '@/app/components/shadcn/ui/button';
import { Card, CardContent } from '@/app/components/shadcn/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/shadcn/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/shadcn/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/shadcn/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/app/components/shadcn/ui/hover-card';
import { Skeleton } from '@/app/components/shadcn/ui/skeleton';

type Board = {
  id: number;
  title: string;
  pinCount: number;
  imageUrl: string;
};

const boards: Board[] = [
  { id: 1, title: "DIYアイデア", pinCount: 128, imageUrl: "/api/placeholder/300/200" },
  { id: 2, title: "インテリア", pinCount: 85, imageUrl: "/api/placeholder/300/200" },
  { id: 3, title: "レシピ", pinCount: 246, imageUrl: "/api/placeholder/300/200" }
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
  <Card className="cursor-pointer hover:bg-accent transition-colors">
    <CardContent className="aspect-[4/3] flex items-center justify-center">
      <div className="text-center space-y-2">
        <Plus className="w-8 h-8 mx-auto text-muted-foreground" />
        <span className="font-semibold text-muted-foreground">ボードを作成</span>
      </div>
    </CardContent>
  </Card>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  return (
    <main className="container mx-auto pt-20 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        <Avatar className="w-32 h-32">
          <AvatarImage src={session?.user?.image || "/api/placeholder/128/128"} />
          <AvatarFallback>WY</AvatarFallback>
        </Avatar>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Work Yuuki</h1>
          <p className="text-muted-foreground">@workyuukiitoi</p>
          <p className="text-sm text-muted-foreground">
            0 フォロワー • 5 フォロー中
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            共有
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                設定
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {status === 'authenticated' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="created">作成済み</TabsTrigger>
          <TabsTrigger value="saved">保存済み</TabsTrigger>
        </TabsList>
        <TabsContent value="created" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CreateBoardCard />
            {boards.map(board => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved">
          <div className="text-center text-muted-foreground py-8">
            保存したピンはまだありません
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
