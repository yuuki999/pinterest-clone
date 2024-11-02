import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// コメントのバリデーションスキーマ
const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

// GETリクエストハンドラ - コメント取得
export async function GET(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        pinId: params.pinId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // レスポンスの形式を修正
    const formattedComments = comments.map(comment => ({
      ...comment,
      content: comment.text,
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POSTリクエストハンドラ - 新規コメント作成
export async function POST(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    // セッションの確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // リクエストボディの取得と検証
    const body = await req.json();
    const validationResult = commentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid comment data' },
        { status: 400 }
      );
    }

    // コメントの作成
    const comment = await prisma.comment.create({
      data: {
        text: validationResult.data.content,
        pinId: params.pinId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const formattedComment = {
      ...comment,
      content: comment.text,
    };

    return NextResponse.json(formattedComment);
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// DELETEリクエストハンドラ - コメント削除
export async function DELETE(
  req: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.pinId }, // 注意: この場合はcommentIdとして使用
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.pinId },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
