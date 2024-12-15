// この場所にAPIルートファイルを作成する必要があります：
// app/api/pins/recommended/route.ts

import { NextResponse } from 'next/server';
import { getRandomPins } from '@/app/libs/db';
import { getImageUrl } from '@/app/libs/gcs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const excludePinId = searchParams.get('excludePinId');

    const { pins } = await getRandomPins({ 
      limit: 8,
      excludePinId: excludePinId ?? undefined,
      userId: session?.user?.id
    });

    // 署名付きURLを取得
    const pinsWithSignedUrls = await Promise.all(
      pins.map(async (pin) => {
        try {
          return {
            ...pin,
            imageUrl: await getImageUrl(pin.imageUrl)
          };
        } catch (error) {
          console.error(`Error getting signed URL for pin ${pin.id}:`, error);
          return pin;
        }
      })
    );

    return NextResponse.json({ pins: pinsWithSignedUrls });
  } catch (error) {
    console.error('Error fetching recommended pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended pins' },
      { status: 500 }
    );
  }
}
