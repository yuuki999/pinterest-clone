import { prisma } from '@/app/libs/prisma';
import { getImageUrl } from '@/app/libs/s3';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 20;

    // クエリパラメータに基づいてページネーションを設定
    const pins = await prisma.pin.findMany({
      take: limit + 1, // 次のページがあるかチェックするために1つ多く取得
      orderBy: {
        createdAt: 'desc'
      },
      ...(cursor
        ? {
            skip: 1, // カーソルの位置のアイテムをスキップ
            cursor: {
              id: cursor,
            },
          }
        : {}),
    });

    let nextCursor: string | undefined = undefined;

    // 次のページが存在するかチェック
    if (pins.length > limit) {
      const nextItem = pins.pop(); // 余分に取得した1件を削除
      nextCursor = nextItem?.id;    // 次のページのカーソルとして使用
    }

    // 署名付きURLの生成
    const pinsWithSignedUrls = await Promise.all(
      pins.map(async (pin) => ({
        ...pin,
        imageUrl: await getImageUrl(pin.imageUrl)
      }))
    );

    return NextResponse.json({
      pins: pinsWithSignedUrls,
      nextCursor,
    });

  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}

// これがエラーになる。
export async function POST(request: Request) {
  try {
    // 1. リクエストボディの検証
    const { title, description, imageUrl } = await request.json();

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    // 2. Pinの作成
    const pin = await prisma.pin.create({
      data: {
        title,
        description: description || '',
        imageUrl,
      },
    });

    // 3. 画像URLの署名付きURLへの変換
    const signedImageUrl = await getImageUrl(pin.imageUrl);
    
    // 4. レスポンスの返却
    return NextResponse.json({
      ...pin,
      imageUrl: signedImageUrl
    });
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}
