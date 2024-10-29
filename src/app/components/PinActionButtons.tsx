import { Button } from "@/app/components/shadcn/ui/button";
import { Share2, MoreHorizontal } from "lucide-react";

interface PinActionButtonsProps {
  onSave: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onMore: (e: React.MouseEvent) => void;
}

export const PinActionButtons = ({ onSave, onShare, onMore }: PinActionButtonsProps) => (
  <>
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button 
        onClick={onSave}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
      >
        保存
      </Button>
    </div>

    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
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
