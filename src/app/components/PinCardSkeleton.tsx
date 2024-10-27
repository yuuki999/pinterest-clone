import { Card } from "@/app/components/shadcn/ui/card";
import { Skeleton } from "@/app/components/shadcn/ui/skeleton";

export const PinCardSkeleton = () => (
  <Card className="overflow-hidden border-none shadow-none">
    <div className="space-y-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2 px-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="px-4 py-2 flex justify-between">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  </Card>
);
