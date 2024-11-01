// 頻繁に使いそうなので共通化しておいた。
import { Button } from "@/app/components/shadcn/ui/button";

interface SaveButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  className?: string;
}

export function SaveButton({ onClick, isSaved = false, className = '' }: SaveButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className={`
        ${isSaved 
          ? 'bg-gray-700 hover:bg-gray-800' 
          : 'bg-red-500 hover:bg-red-600'
        } 
        text-white 
        rounded-full 
        px-4
        ${className}
      `}
    >
      {isSaved ? '保存済み' : '保存'}
    </Button>
  );
}
