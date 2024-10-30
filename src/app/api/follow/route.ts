import { authOptions } from '@/app/libs/auth';
import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { followingId } = await request.json(); // フォローするユーザーのID
  const follow = await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId,
    },
  });

  return NextResponse.json(follow);
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { followingId } = await request.json();

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId,
      },
    },
  });

  return new NextResponse(null, { status: 204 });
}
