import { s3Client } from '@/app/libs/s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { fileType } = await request.json();
    
    const key = `uploads/${uuidv4()}-${Date.now()}.${fileType.split('/')[1]}`;
    
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10MB
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Expires: 600, // URL expires in 10 minutes
    });

    return NextResponse.json({ url, fields, key });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Error generating upload URL' }, { status: 500 });
  }
}
