import { prisma } from '@/app/libs/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // フォロワー数を取得
    const followersCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    // フォロー中の数を取得
    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    return NextResponse.json({
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error('ユーザー統計の取得に失敗:', error);
    return NextResponse.json(
      { error: 'ユーザー統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
