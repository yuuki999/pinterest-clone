'use client';

import { Card, CardContent } from '@/app/components/shadcn/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/shadcn/ui/hover-card';
import { Plus } from 'lucide-react';

interface Board {
  id: number;
  title: string;
  pinCount: number;
  imageUrl: string;
}

interface CreatedContentProps {
  userId: string;
}

export function CreatedContent({ userId }: CreatedContentProps) {
  // TODO: ボードデータをAPIから取得
  const boards: Board[] = [
    { id: 1, title: "DIYアイデア", pinCount: 128, imageUrl: "" },
    { id: 2, title: "インテリア", pinCount: 85, imageUrl: "" },
    { id: 3, title: "レシピ", pinCount: 246, imageUrl: "" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <CreateBoardCard />
      {boards.map(board => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}

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
