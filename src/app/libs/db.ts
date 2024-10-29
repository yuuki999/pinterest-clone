import { prisma } from './prisma';
import { Pin } from '@prisma/client';


// TODO: いろんな定義が入っているのでリファクタしたい。


// 返り値の型定義
type GetPinsResult = {
  pins: Pin[];
  nextCursor: string | null;
};

// ピン一覧取得
export async function getPins(options: {
  cursor?: string;
  limit?: number;
}): Promise<GetPinsResult> {
  const { cursor, limit = 20 } = options;

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
    },
  });

  let nextCursor: string | null = null;
  if (pins.length > limit) {
    const nextItem = pins.pop();
    nextCursor = nextItem?.id ?? null;
  }

  return {
    pins,
    nextCursor,
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
