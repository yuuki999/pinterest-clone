import { NextResponse } from 'next/server';
import { getRandomPins } from '@/app/libs/db';
import { getImageUrl } from '@/app/libs/gcs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

// TODO: 類似画像検索のシステムを作成する。

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { searchParams } = new URL(request.url);
//     const excludePinId = searchParams.get('excludePinId');

//     const { pins } = await getRandomPins({ 
//       limit: 8,
//       excludePinId: excludePinId ?? undefined,
//       userId: session?.user?.id
//     });

//     // 署名付きURLを取得
//     const pinsWithSignedUrls = await Promise.all(
//       pins.map(async (pin) => {
//         try {
//           return {
//             ...pin,
//             imageUrl: await getImageUrl(pin.imageUrl)
//           };
//         } catch (error) {
//           console.error(`Error getting signed URL for pin ${pin.id}:`, error);
//           return pin;
//         }
//       })
//     );

//     return NextResponse.json({ pins: pinsWithSignedUrls });
//   } catch (error) {
//     console.error('Error fetching recommended pins:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch recommended pins' },
//       { status: 500 }
//     );
//   }
// }


// Cloud StorageのパスからimageUrlを抽出する関数
function extractImagePath(gcsUrl: string): string {
  // "gs://sisterly/images/admin/xxx.jpg" から "/images/admin/xxx.jpg" を抽出
  const match = gcsUrl.match(/gs:\/\/sisterly(\/images\/.+)/);
  return match ? match[1] : '';
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const excludePinId = searchParams.get('excludePinId');

    // ベクトル検索の結果を取得（実際のAPIコール）
    const response = await fetch(
      'https://763640471.asia-northeast1-79125955655.vdb.vertexai.goog/v1/projects/79125955655/locations/asia-northeast1/indexEndpoints/5566554692546199552:findNeighbors',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GOOGLE_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // ... ベクトル検索のクエリ
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch similar images');
    }

    const vectorSearchResult = await response.json();

    // 類似画像のパスを抽出
    const imagePaths = vectorSearchResult.nearestNeighbors[0].neighbors
      .map(neighbor => extractImagePath(neighbor.datapoint.datapointId))
      .filter(path => path); // 空のパスを除外

    // データベースから該当するPinを取得
    const similarPins = await prisma.pin.findMany({
      where: {
        imageUrl: {
          in: imagePaths
        },
        id: {
          not: excludePinId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        saves: true,
      },
      take: 8
    });

    // 署名付きURLを取得
    const pinsWithSignedUrls = await Promise.all(
      similarPins.map(async (pin) => {
        const signedUrl = await getImageUrl(pin.imageUrl);
        return {
          ...pin,
          imageUrl: signedUrl,
          saved: pin.saves.length > 0
        };
      })
    );

    return NextResponse.json({ pins: pinsWithSignedUrls });

  } catch (error) {
    console.error('Error fetching similar pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar pins' },
      { status: 500 }
    );
  }
}
