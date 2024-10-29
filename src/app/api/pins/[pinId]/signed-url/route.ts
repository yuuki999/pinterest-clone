import { NextResponse } from 'next/server';
import { getImageUrl } from '@/app/libs/s3';
import { prisma } from '@/app/libs/prisma';

export async function GET(
  request: Request,
  { params }: { params: { pinId: string } }
) {
  try {
    console.log('Requested Pin ID:', params.pinId);

    const pin = await prisma.pin.findUnique({
      where: { id: params.pinId },
    });

    if (!pin) {
      return NextResponse.json(
        { error: 'Pin not found' },
        { status: 404 }
      );
    }

    const signedUrl = await getImageUrl(pin.imageUrl);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
