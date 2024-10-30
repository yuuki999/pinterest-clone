import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const { name, isPrivate } = await req.json();
    
    if (!name?.trim()) {
      return new NextResponse("ボード名は必須です", { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        title: name,
        isPrivate: isPrivate ?? false,
        userId: session.user.id,
      }
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("[BOARDS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const boards = await prisma.board.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        pins: {
          take: 1, // サムネイル用に最新の1件を取得、ここ4件にするかも。
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: { pins: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("[BOARDS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
