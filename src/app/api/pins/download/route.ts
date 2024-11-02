import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    // 画像データを取得
    const imageData = await response.arrayBuffer();
    
    // Content-Typeを取得（もしくはデフォルト値を使用）
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // バイナリデータとして返す
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment',
      },
    });
  } catch (error) {
    console.error('[DOWNLOAD_ERROR]', error);
    return new NextResponse('Download failed', { status: 500 });
  }
}
