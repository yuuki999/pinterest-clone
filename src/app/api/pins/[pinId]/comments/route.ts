
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/app/libs/prisma';
import { authOptions } from '@/app/libs/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { pinId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return new NextResponse('Invalid comment text', { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
