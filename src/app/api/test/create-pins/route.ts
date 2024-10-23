
import { prisma } from '@/app/libs/prisma';
import { NextResponse } from 'next/server';

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

export async function POST() {
  try {
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        name: "Test User",
        email: "test@example.com",
        image: "https://api.dicebear.com/7.x/avatars/svg?seed=1"
      }
    });

    // S3の画像URLを使用してピンを作成
    const pins = await Promise.all(
      Array.from({ length: 50 }).map(async (_, i) => {
        const imageKey = `sample/image${i + 1}.jpg`;
        const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${imageKey}`;
        
        return prisma.pin.create({
          data: {
            title: `Test Pin ${i + 1}`,
            description: `This is a test pin ${i + 1}`,
            imageUrl: imageUrl,
            userId: user.id,
            tags: {
              create: [
                { name: `tag${i + 1}` }
              ]
            }
          }
        });
      })
    );

    return NextResponse.json({ message: "Test data created", count: pins.length });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Error creating test data' }, { status: 500 });
  }
}
