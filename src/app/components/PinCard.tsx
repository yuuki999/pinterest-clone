import { Card } from "@/app/components/shadcn/ui/card";
import { Pin } from "../types/pin";
import { PinCardSkeleton } from "./PinCardSkeleton";
import { usePinSave } from "../hooks/usePinSave/usePinSave";
import { PinActionButtons } from "./PinActionButtons";
import { BoardSelector } from "./board/BoardSelector";
import { useState } from "react";

interface PinCardProps {
  pin: Pin;
  isLoaded: boolean;
  showTitle?: boolean; // 保存済みピン一覧で使用する場合にタイトルを表示するためのオプション
  isSaved?: boolean;   // ピンが保存済みかどうかを示すフラグ
  onSaveToggle?: () => void; // 保存/保存解除時のカスタムハンドラ（オプション）
}

export const PinCard = ({ 
  pin, 
  isLoaded, 
  showTitle = false,
  isSaved = false,
  onSaveToggle 
}: PinCardProps) => {
  const { handleSave } = usePinSave(pin.id);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (!isLoaded) {
    return <PinCardSkeleton />;
  }

  // ピン保存
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleSave();
    onSaveToggle?.();
  };

  // ピンをボードに保存する
  const handleSaveToBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId: pin.id }),
      });
      
      if (response.ok) {
        onSaveToggle?.();
      }
    } catch (error) {
      console.error('Error saving to board:', error);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // シェア機能をここに実装
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    // その他のオプション機能をここに実装
  };

  return (
    <Card className="overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300">
      <div className="relative group">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-200 rounded-lg" />
        
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="w-full h-auto object-cover rounded-lg"
          loading="lazy"
        />

        <BoardSelector
          pinId={pin.id}
          onSaveToBoard={handleSaveToBoard}
          onOpenChange={setIsPopoverOpen}
        />

        <PinActionButtons
          onSave={handleSaveClick}
          onShare={handleShare}
          onMore={handleMore}
          isSaved={isSaved}
          isPopoverOpen={isPopoverOpen}
        />

        {showTitle && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <h3 className="font-semibold text-lg">{pin.title}</h3>
            {pin.description && (
              <p className="text-sm opacity-90">{pin.description}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
