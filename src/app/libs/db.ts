import { prisma } from './prisma';
import { Pin, User, Tag } from '@prisma/client';

// 返り値の型を定義
type PinWithRelations = Pin & {
  user: Pick<User, 'id' | 'name' | 'image'>;
  tags: Tag[];
  _count: {
    likes: number;
    saves: number;
  };
};

type GetPinsResult = {
  pins: PinWithRelations[];
  nextCursor: string | null;
};

export async function getPins(options: {
  cursor?: string;
  limit?: number;
  userId?: string;
  tagId?: string;
}): Promise<GetPinsResult> {
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

  console.log("pins")
  console.log(pins)
  console.log("nextCursor")
  console.log(nextCursor)

  return {
    pins,
    nextCursor,
  };
}

// createPinの返り値の型も定義
export async function createPin(data: {
  title: string;
  description?: string;
  imageUrl: string;
  userId: string;
  tags?: string[];
}): Promise<PinWithRelations> {
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

type Like = {
  id: string;
  userId: string;
  pinId: string;
};

export async function toggleLike(userId: string, pinId: string): Promise<Like> {
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
