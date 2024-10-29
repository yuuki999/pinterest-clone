import { Pin } from '../types/pin';
import { prisma } from './prisma';

export async function getPinById(id: string): Promise<Pin | null> {
  try {
    const pin = await prisma.pin.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!pin) return null;

    // Pin型に変換
    return {
      id: pin.id,
      title: pin.title,
      description: pin.description,
      imageUrl: pin.imageUrl,
      user: {
        id: pin.user.id,
        name: pin.user.name || '',
        image: pin.user.image,
      },
      createdAt: pin.createdAt,
      comments: pin.comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        user: {
          id: comment.user.id,
          name: comment.user.name || '',
          image: comment.user.image,
        },
        createdAt: comment.createdAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching pin:', error);
    throw new Error('Failed to fetch pin');
  }
}

export async function getSimilarPins(pinId: string) {
  try {
    // 現在のピンの情報を取得
    const currentPin = await prisma.pin.findUnique({
      where: {
        id: pinId,
      },
      select: {
        title: true,
        // タグ機能を実装している場合
        // tags: {
        //   select: {
        //     id: true,
        //   },
        // },
      },
    });

    if (!currentPin) {
      return [];
    }

    // 類似のピンを取得
    // ここでは単純に最新のピンを取得していますが、
    // より洗練された類似性の判定ロジックを実装することができます
    const similarPins = await prisma.pin.findMany({
      where: {
        id: {
          not: pinId, // 現在のピンを除外
        },
        // タグベースの類似性判定を実装する場合
        // tags: {
        //   some: {
        //     id: {
        //       in: currentPin.tags.map(tag => tag.id),
        //     },
        //   },
        // },
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
      take: 10, // 表示する類似ピンの数
      orderBy: {
        createdAt: 'desc',
      },
    });

    return similarPins;
  } catch (error) {
    console.error('Error fetching similar pins:', error);
    throw new Error('Failed to fetch similar pins');
  }
}
