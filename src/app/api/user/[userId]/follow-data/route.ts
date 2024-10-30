import { prisma } from '@/app/libs/prisma';
import { NextResponse } from 'next/server';


export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // 1回のクエリで全データを取得
    const [followers, following] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        select: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      })
    ]);

    // フォロー状態を含めてデータを整形
    const followersData = followers.map(f => ({
      ...f.follower,
      isFollowing: following.some(fw => fw.following.id === f.follower.id)
    }));

    const followingData = following.map(f => ({
      ...f.following,
      isFollowing: true
    }));

    return NextResponse.json({
      followers: followersData,
      following: followingData,
      stats: {
        followersCount: followersData.length,
        followingCount: followingData.length
      }
    });
  } catch (error) {
    console.error('フォローデータの取得に失敗:', error);
    return NextResponse.json(
      { error: 'フォローデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
