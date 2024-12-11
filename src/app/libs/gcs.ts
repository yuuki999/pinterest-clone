import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
const bucket = storage.bucket(bucketName);

export async function getImageUrl(filename: string) {
  try {
    // Split path and filter out empty segments
    const pathSegments = filename.split('/').filter(Boolean);

    // imagesが先頭にない場合は、先頭にimagesを追加
    if (pathSegments[0] !== 'images') {
      pathSegments.unshift('images');
    }
    
    const normalizedPath = pathSegments.join('/');

    console.log(normalizedPath)
    const file = bucket.file(normalizedPath);
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    
    return signedUrl;
  } catch (error) {
    console.error('GCS Error generating signed URL:', {
      error,
      filename,
      normalizedPath: filename.split('/').filter(Boolean).join('/')
    });
    throw error;
  }
}

export async function generateUploadUrl(userId: string, contentType: string) {
  try {
    const extension = contentType.split('/')[1];
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0];
    
    // New path structure: images/{userId}/{timestamp}_{uuid}.{extension}
    const filename = `images/${userId}/${timestamp}_${uuidv4()}.${extension}`;
    const file = bucket.file(filename);
    
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    const [publicUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return {
      uploadUrl,
      publicUrl,
      key: filename
    };
  } catch (error) {
    console.error('GCS Error generating upload URL:', {
      error,
      userId,
      contentType
    });
    throw error;
  }
}


// // Home page component
// export default async function Home() {
//   await getServerSession(authOptions);
//   const { pins, nextCursor } = await getPins({ limit: 50 });

//   const pinsWithSignedUrls = await Promise.all(
//     pins.map(async (pin) => {
//       try {
//         return {
//           ...pin,
//           imageUrl: await getImageUrl(pin.imageUrl)
//         };
//       } catch (error) {
//         console.error(`Error getting signed URL for pin ${pin.id}:`, error);
//         return pin;
//       }
//     })
//   );

//   return (
//     <div className="max-w-[2000px] mx-auto px-16 py-16">
//       <PinGrid initialPins={pinsWithSignedUrls} initialCursor={nextCursor} />
//     </div>
//   );
// }
