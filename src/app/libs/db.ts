import { prisma } from './prisma';
import { Pin } from '@prisma/client';

// サーバーサイドで値を取得する用

// 返り値の型定義を拡張
type PinWithSaveStatus = Omit<Pin, 'userId' | 'boardId'> & {
  saved: boolean;
};

type GetPinsResult = {
  pins: PinWithSaveStatus[];
  nextCursor: string | null;
};

// ピン一覧取得（保存状態付き）
export async function getPins(options: {
  cursor?: string;
  limit?: number;
  userId?: string; // ユーザーIDを追加
}): Promise<GetPinsResult> {
  const { cursor, limit = 50, userId } = options;

  const pins = await prisma.pin.findMany({
    take: limit + 1,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      // サブクエリで保存状態を取得
      saves: userId ? {
        where: {
          userId: userId
        },
        select: {
          id: true
        }
      } : false
    },
  });

  let nextCursor: string | null = null;
  if (pins.length > limit) {
    const nextItem = pins.pop();
    nextCursor = nextItem?.id ?? null;
  }

  // 保存状態を含むピンデータに変換
  const pinsWithSaveStatus = pins.map(pin => {
    const { saves, ...pinData } = pin;
    return {
      ...pinData,
      saved: Array.isArray(saves) ? saves.length > 0 : false
    };
  });

  return {
    pins: pinsWithSaveStatus,
    nextCursor,
  };
}

export async function getRandomPins(options: {
  limit?: number;
  excludePinId?: string;
  userId?: string;
}): Promise<GetPinsResult> {
  const { limit = 8, excludePinId, userId } = options;

  const pins = await prisma.pin.findMany({
    take: limit,
    where: {
      ...(excludePinId && {
        NOT: {
          id: excludePinId
        }
      })
    },
    // ランダムソートに修正
    orderBy: {
      createdAt: 'desc' // または他の基準でソート
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      saves: userId ? {
        where: {
          userId: userId
        },
        select: {
          id: true
        }
      } : false
    },
  });

  // ランダムにシャッフル
  const shuffledPins = [...pins].sort(() => Math.random() - 0.5);
  const limitedPins = shuffledPins.slice(0, limit);

  const pinsWithSaveStatus = limitedPins.map(pin => {
    const { saves, ...pinData } = pin;
    return {
      ...pinData,
      saved: Array.isArray(saves) ? saves.length > 0 : false
    };
  });

  return {
    pins: pinsWithSaveStatus,
    nextCursor: null,
  };
}

// ピン作成
export async function createPin(data: {
  title: string;
  description?: string;
  imageUrl: string;
}): Promise<Pin> {
  const { title, description, imageUrl } = data;

  return prisma.pin.create({
    data: {
      title,
      description,
      imageUrl,
    },
  });
}

// ピン取得（単一）
export async function getPin(id: string): Promise<Pin | null> {
  return prisma.pin.findUnique({
    where: { id },
  });
}

// ピン更新
export async function updatePin(
  id: string,
  data: {
    title?: string;
    description?: string;
  }
): Promise<Pin> {
  return prisma.pin.update({
    where: { id },
    data,
  });
}

// ピン削除
export async function deletePin(id: string): Promise<Pin> {
  return prisma.pin.delete({
    where: { id },
  });
}
