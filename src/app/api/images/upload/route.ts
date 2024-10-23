import { generatePresignedUrl } from '@/app/libs/s3';
import { NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { contentType } = await request.json();
    
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const extension = contentType.split('/')[1];
    const key = `uploads/${uuidv4()}.${extension}`;
    
    const { uploadUrl, publicUrl } = await generatePresignedUrl(key, contentType);

    return NextResponse.json(
      { uploadUrl, publicUrl, key },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
