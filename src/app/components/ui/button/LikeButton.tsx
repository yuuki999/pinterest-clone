import { Button } from "@/app/components/shadcn/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  onClick?: () => void;
  isLiked?: boolean;
  count?: number;
  isLoading?: boolean;
}

export const LikeButton = ({ 
  onClick, 
  isLiked = false,
  count ,
  isLoading = false
}: LikeButtonProps) => (
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
    disabled={isLoading}
  >
    {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <>
          <Heart 
            className={`
              h-5 
              w-5 
              transition-all 
              duration-200 
              ease-in-out
              ${isLiked 
                ? 'text-primary fill-primary' 
                : 'text-gray-600 dark:text-gray-300 group-hover:text-primary group-hover:scale-110'
              }
            `}
          />
          {count != null && count > 0 && (
            <span className="
              absolute 
              -top-1 
              -right-1
              bg-primary 
              text-white 
              text-xs 
              font-bold 
              rounded-full 
              min-w-[18px] 
              h-[18px] 
              flex 
              items-center 
              justify-center 
              px-1
            ">
              {count > 99 ? '99+' : count}
            </span>
          )}
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
            いいね
          </span>
        </>
      )}
  </Button>
);
