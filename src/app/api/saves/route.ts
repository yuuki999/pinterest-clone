import { prisma } from '@/app/libs/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

export async function POST(req: Request) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);
    console.log(session)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // リクエストボディからpinIdを取得
    const { pinId } = await req.json();
    if (!pinId) {
      return new NextResponse("Pin ID is required", { status: 400 });
    }

    // すでに保存済みかチェック
    const existingSave = await prisma.save.findFirst({
      where: {
        userId: session.user.id,
        pinId: pinId
      }
    });

    if (existingSave) {
      // すでに保存済みの場合は保存を削除（トグル機能）
      await prisma.save.delete({
        where: {
          id: existingSave.id
        }
      });
      
      return NextResponse.json({ 
        message: "Save removed",
        saved: false 
      });
    }

    // 新規保存
    const save = await prisma.save.create({
      data: {
        userId: session.user.id,
        pinId: pinId
      }
    });

    return NextResponse.json({ 
      message: "Saved successfully",
      saved: true,
      save 
    });

  } catch (error) {
    console.error('[SAVE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// 保存状態を確認するためのGETエンドポイント
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // URLからpinIdを取得
    const { searchParams } = new URL(req.url);
    const pinId = searchParams.get('pinId');

    if (!pinId) {
      return new NextResponse("Pin ID is required", { status: 400 });
    }

    const save = await prisma.save.findFirst({
      where: {
        userId: session.user.id,
        pinId: pinId
      }
    });

    return NextResponse.json({ 
      saved: !!save 
    });

  } catch (error) {
    console.error('[SAVE_CHECK_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
