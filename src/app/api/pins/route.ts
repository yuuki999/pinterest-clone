import { prisma } from '@/app/libs/prisma';
import { getImageUrl } from '@/app/libs/s3';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 20;

  try {
    const pins = await prisma.pin.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            saves: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // S3の署名付きURLを生成
    const pinsWithSignedUrls = await Promise.all(
      pins.map(async (pin) => {
        try {
          const key = pin.imageUrl.split('.com/').pop()!;
          const signedUrl = await getImageUrl(key);
          return {
            ...pin,
            imageUrl: signedUrl
          };
        } catch (error) {
          console.error(`Error getting signed URL for pin ${pin.id}:`, error);
          return pin;
        }
      })
    );

    const nextCursor = pins[limit - 1]?.id;

    return NextResponse.json({
      pins: pinsWithSignedUrls,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ error: 'Error fetching pins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, imageUrl, userId } = await request.json();

    const pin = await prisma.pin.create({
      data: {
        title,
        description,
        imageUrl, // S3のキーを保存
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        _count: {
          select: {
            likes: true,
            saves: true,
          },
        },
      },
    });

    // 作成したPinの画像URLを署名付きURLに変換
    const signedImageUrl = await getImageUrl(pin.imageUrl);
    
    return NextResponse.json({
      ...pin,
      imageUrl: signedImageUrl
    });
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}
