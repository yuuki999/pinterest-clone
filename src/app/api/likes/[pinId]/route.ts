import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// いいねの切り替え（作成/削除）
export async function POST(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const pinId = params.pinId;

    // ピンの存在確認
    const pin = await prisma.pin.findUnique({
      where: { id: pinId }
    });

    if (!pin) {
      return new NextResponse("ピンが見つかりません", { status: 404 });
    }

    // 既存のいいねを検索
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_pinId: {
          userId: session.user.id,
          pinId
        }
      }
    });

    if (existingLike) {
      // いいねが存在する場合は削除
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      // いいねが存在しない場合は作成
      await prisma.like.create({
        data: {
          userId: session.user.id,
          pinId
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("[LIKES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// いいねの状態を取得
export async function GET(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const pinId = params.pinId;

    // いいねの存在確認とカウント取得
    const [like, likesCount] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_pinId: {
            userId: session.user.id,
            pinId
          }
        }
      }),
      prisma.like.count({
        where: { pinId }
      })
    ]);

    return NextResponse.json({
      liked: !!like,
      count: likesCount
    });
  } catch (error) {
    console.error("[LIKES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
