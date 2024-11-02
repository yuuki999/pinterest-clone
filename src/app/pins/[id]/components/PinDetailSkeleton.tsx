import { Skeleton } from "@/app/components/shadcn/ui/skeleton";

export const PinDetailSkeleton = ({ containerWidth, containerHeight }: { containerWidth: string; containerHeight: string }) => {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl">
      {/* 左側：画像スケルトン */}
      <div
        style={{
          width: containerWidth,
          height: containerHeight
        }}
        className="relative rounded-tl-3xl rounded-bl-3xl overflow-hidden"
      >
        <Skeleton className="w-full h-full" />
      </div>

      {/* 右側：情報スケルトン */}
      <div className="flex flex-col w-full md:w-[500px] lg:w-[600px] p-8 space-y-6">
        {/* ヘッダーアクションボタン */}
        <div className="flex justify-end space-x-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        {/* タイトルと説明 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* ユーザー情報 */}
        <div className="flex items-center space-x-4 py-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="ml-auto h-10 w-24" />
        </div>

        {/* コメントセクション */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コメント入力欄 */}
        <div className="flex items-center space-x-3 mt-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="flex-1 h-10 rounded-full" />
          <Skeleton className="w-16 h-10" />
        </div>
      </div>
    </div>
  );
};
