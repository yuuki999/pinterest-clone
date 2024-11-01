import { Button } from "@/app/components/shadcn/ui/button";
import { Heart, Share2, Download } from "lucide-react";

type ActionButtonIcon = typeof Heart | typeof Share2 | typeof Download;

interface ActionButtonProps {
  icon: ActionButtonIcon;
  onClick?: () => void;
  isActive?: boolean;
}

export const ActionButton = ({ 
  icon: Icon, 
  onClick, 
  isActive = false 
}: ActionButtonProps) => (
  <Button 
    variant="ghost" 
    size="icon" 
    className="
      relative 
      group 
      bg-gray-100 
      hover:bg-gray-200 
      dark:bg-gray-800 
      dark:hover:bg-gray-700
      rounded-full 
      transition-all 
      duration-200
      w-10 
      h-10
      flex 
      items-center 
      justify-center
    " 
    onClick={onClick}
  >
    <Icon 
      className={`
        h-5 
        w-5 
        transition-all 
        duration-200 
        ease-in-out
        ${isActive 
          ? 'text-primary fill-primary' 
          : 'text-gray-600 dark:text-gray-300 group-hover:text-primary group-hover:scale-110'
        }
      `}
    />
    <span className="
      absolute 
      -bottom-8 
      left-1/2 
      transform 
      -translate-x-1/2 
      bg-gray-800 
      dark:bg-gray-700 
      text-white 
      px-2 
      py-1 
      rounded 
      text-xs
      opacity-0 
      group-hover:opacity-100 
      transition-opacity 
      duration-200
      whitespace-nowrap 
      shadow-lg 
      pointer-events-none
      z-10
    ">
      {Icon === Heart ? 'いいね' : Icon === Share2 ? 'シェア' : 'ダウンロード'}
    </span>
  </Button>
);
