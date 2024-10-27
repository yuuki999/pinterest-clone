import { Card } from "@/app/components/shadcn/ui/card";
import { Pin } from "../types/pin";
import { PinCardSkeleton } from "./PinCardSkeleton";

interface PinCardProps {
  pin: Pin;
  isLoaded: boolean;
}

export const PinCard = ({ pin, isLoaded }: PinCardProps) => {
  if (!isLoaded) {
    return <PinCardSkeleton />;
  }

  return (
    <Card className="overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300">
      <div className="relative group">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="w-full h-auto object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    </Card>
  );
};
