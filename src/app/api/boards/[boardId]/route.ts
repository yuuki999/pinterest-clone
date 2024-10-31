import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const board = await prisma.board.findUnique({
      where: {
        id: params.boardId,
      },
      include: {
        pins: {
          include: {
            user: true,
          }
        },
      }
    });

    if (!board) {
      return new NextResponse("ボードが見つかりません", { status: 404 });
    }

    if (board.isPrivate && board.userId !== session.user.id) {
      return new NextResponse("アクセス権限がありません", { status: 403 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("[BOARD_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const { title, isPrivate } = await req.json();
    
    const board = await prisma.board.findUnique({
      where: { id: params.boardId }
    });

    if (!board) {
      return new NextResponse("ボードが見つかりません", { status: 404 });
    }

    if (board.userId !== session.user.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: params.boardId },
      data: {
        title: title ?? board.title,
        isPrivate: isPrivate ?? board.isPrivate,
      }
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("[BOARD_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const board = await prisma.board.findUnique({
      where: { id: params.boardId }
    });

    if (!board) {
      return new NextResponse("ボードが見つかりません", { status: 404 });
    }

    if (board.userId !== session.user.id) {
      return new NextResponse("権限がありません", { status: 403 });
    }

    await prisma.board.delete({
      where: { id: params.boardId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOARD_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}