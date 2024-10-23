import { prisma } from '@/app/libs/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 20;

  try {
    const pins = await prisma.pin.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            saves: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const nextCursor = pins[limit - 1]?.id;

    return NextResponse.json({
      pins,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ error: 'Error fetching pins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, imageUrl, userId, tags } = await request.json();

    const pin = await prisma.pin.create({
      data: {
        title,
        description,
        imageUrl,
        userId,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json(pin);
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json({ error: 'Error creating pin' }, { status: 500 });
  }
}
