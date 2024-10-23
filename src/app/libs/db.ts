import { prisma } from './prisma';

export async function getPins(options: {
  cursor?: string;
  limit?: number;
  userId?: string;
  tagId?: string;
}) {
  const { cursor, limit = 20, userId, tagId } = options;

  const where = {
    ...(userId && { userId }),
    ...(tagId && {
      tags: {
        some: {
          id: tagId
        }
      }
    })
  };

  const pins = await prisma.pin.findMany({
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      tags: true,
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

  return {
    pins,
    nextCursor,
  };
}

export async function createPin(data: {
  title: string;
  description?: string;
  imageUrl: string;
  userId: string;
  tags?: string[];
}) {
  const { title, description, imageUrl, userId, tags = [] } = data;

  return prisma.pin.create({
    data: {
      title,
      description,
      imageUrl,
      userId,
      tags: {
        connectOrCreate: tags.map((tag) => ({
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
      _count: {
        select: {
          likes: true,
          saves: true,
        },
      },
    },
  });
}

export async function toggleLike(userId: string, pinId: string) {
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_pinId: {
        userId,
        pinId,
      },
    },
  });

  if (existingLike) {
    return prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
  }

  return prisma.like.create({
    data: {
      userId,
      pinId,
    },
  });
}
