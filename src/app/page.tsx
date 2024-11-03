import { getServerSession } from "next-auth";
import { PinGrid } from "./components/PinGrid";
import { getPins } from "./libs/db";
import { getImageUrl } from "./libs/s3";
import { authOptions } from "./libs/auth";

export const revalidate = 0;

export default async function Home() {
  // セッションからユーザー情報を取得
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { pins, nextCursor } = await getPins({ limit: 50, userId: userId});

  // S3の署名付きURLを生成、初回pin取得
  const pinsWithSignedUrls = await Promise.all(
    pins.map(async (pin) => {
      try {
        // imageUrlからキーを抽出 (例: https://bucket.s3.region.amazonaws.com/key.jpg -> key.jpg)
        const key = pin.imageUrl.split('.com/').pop()!;
        const signedUrl = await getImageUrl(key);
        
        return {
          ...pin,
          imageUrl: signedUrl
        };
      } catch (error) {
        console.error(`Error getting signed URL for pin ${pin.id}:`, error);
        return pin; // エラーの場合は元のURLを使用
      }
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PinGrid initialPins={pinsWithSignedUrls} initialCursor={nextCursor} />
    </div>
  );
}
