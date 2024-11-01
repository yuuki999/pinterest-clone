import { Button } from "@/app/components/shadcn/ui/button";
import { Share2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveButton } from "./ui/button/SaveButton";

interface PinActionButtonsProps {
  onSave: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onMore: (e: React.MouseEvent) => void;
  isSaved?: boolean;  // オプショナル
  isPopoverOpen?: boolean; // 新規ボードを作成: Popoverが開いているかどうか
}

export const PinActionButtons = ({ 
  onSave, 
  onShare, 
  onMore, 
  isSaved = false,
  isPopoverOpen = false
}: PinActionButtonsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Popoverの状態が変更されたときにボタンの表示状態を更新
  useEffect(() => {
    if (isPopoverOpen) {
      setIsVisible(true);
    }
  }, [isPopoverOpen]);

  const visibilityClass = isPopoverOpen || isVisible 
    ? 'opacity-100' 
    : 'opacity-0 group-hover:opacity-100';

  return (
    <>
      <div 
        className={`absolute bottom-2 left-2 ${visibilityClass} transition-opacity duration-200`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => !isPopoverOpen && setIsVisible(false)}
      >
        <SaveButton onClick={onSave} isSaved={isSaved}/>
      </div>

      <div 
        className={`absolute bottom-2 right-2 ${visibilityClass} transition-opacity duration-200 flex gap-2`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => !isPopoverOpen && setIsVisible(false)}
      >
        <Button 
          onClick={onShare}
          variant="ghost" 
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-300 w-8 h-8"
        >
          <Share2 className="h-4 w-4 text-gray-700" />
        </Button>
        
        <Button 
          onClick={onMore}
          variant="ghost" 
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-300 w-8 h-8"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
    </>
  );
};
