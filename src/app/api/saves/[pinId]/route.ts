// app/api/saves/[pinId]/route.ts

import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const pinId = params.pinId;

    // pinの存在確認
    const pin = await prisma.pin.findUnique({
      where: { id: pinId }
    });

    if (!pin) {
      return new NextResponse("ピンが見つかりません", { status: 404 });
    }

    // 保存状態の確認
    const save = await prisma.save.findUnique({
      where: {
        userId_pinId: {
          userId: session.user.id,
          pinId: pinId
        }
      }
    });

    return NextResponse.json({ saved: !!save });
  } catch (error) {
    console.error("[SAVE_STATUS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
