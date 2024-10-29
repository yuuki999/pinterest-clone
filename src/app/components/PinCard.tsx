import { Card } from "@/app/components/shadcn/ui/card";
import { Pin } from "../types/pin";
import { PinCardSkeleton } from "./PinCardSkeleton";
import { usePinSave } from "../hooks/usePinSave/usePinSave";
import { PinActionButtons } from "./PinActionButtons";

interface PinCardProps {
  pin: Pin;
  isLoaded: boolean;
}

export const PinCard = ({ pin, isLoaded }: PinCardProps) => {
  const { handleSave } = usePinSave(pin.id);

  if (!isLoaded) {
    return <PinCardSkeleton />;
  }

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

        <PinActionButtons
          onSave={handleSave}
          onShare={handleShare}
          onMore={handleMore}
        />
      </div>
    </Card>
  );
};
