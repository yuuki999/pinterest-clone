import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getImageUrl } from '@/app/libs/s3';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = 20;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 保存したピンを取得
    const savedPins = await prisma.save.findMany({
      take: limit + 1,
      where: {
        userId: user.id
      },
      include: {
        pin: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(cursor
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {}),
    });

    let nextCursor: string | undefined = undefined;

    if (savedPins.length > limit) {
      const nextItem = savedPins.pop();
      nextCursor = nextItem?.id;
    }

    // 署名付きURLの生成と整形したデータの作成
    const pinsWithSignedUrls = await Promise.all(
      savedPins.map(async (save) => ({
        ...save.pin,
        imageUrl: await getImageUrl(save.pin.imageUrl),
        savedAt: save.createdAt
      }))
    );

    return NextResponse.json({
      pins: pinsWithSignedUrls,
      nextCursor,
    });

  } catch (error) {
    console.error('Error fetching saved pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved pins' },
      { status: 500 }
    );
  }
}
