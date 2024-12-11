import { getServerSession } from "next-auth";
import { PinGrid } from "./components/PinGrid";
import { getPins } from "./libs/db";
import { getImageUrl } from "./libs/gcs";
import { authOptions } from "./libs/auth";

export const revalidate = 0;

export default async function Home() {
  await getServerSession(authOptions);
  const { pins, nextCursor } = await getPins({ limit: 50 });
  // pinsのデータとは？
  // {
  //   id: 'cm309mx9v009t79tc3ce93yp0',
  //   title: 'shake_1121_post_2024_4_24_18_59_133353201184753534866',
  //   description: 'Bulk uploaded: shake_1121_post_2024_4_24_18_59_133353201184753534866.jpg',
  //   imageUrl: 'cm2pw9n4n0000xyolfazhvmvy/106bdc06-70d5-4ab2-af77-5f79fb806486.jpg',
  //   createdAt: 2024-11-02T14:35:43.219Z,
  //   updatedAt: 2024-11-02T14:35:43.219Z,
  //   saved: false
  // }

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

  return (
    <div className="max-w-[2000px] mx-auto px-16 py-16">
      <PinGrid initialPins={pinsWithSignedUrls} initialCursor={nextCursor} />
    </div>
  );
}
