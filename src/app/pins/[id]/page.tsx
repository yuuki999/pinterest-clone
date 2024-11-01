
import { notFound } from 'next/navigation';
import { PinDetail } from './components/PinDetail';
import { SimilarPins } from '../components/SimilarPins';
import { getPinById } from '@/app/libs/pins';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PinDetailPage({ params }: PageProps) {
  const pin = await getPinById(params.id);
  
  if (!pin) {
    notFound();
  }

  // const similarPins = await getSimilarPins(params.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* メインコンテンツ */}
        <PinDetail pin={pin} />
        
        {/* 類似ピン */}
        {/* <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">もっと見る</h2>
          <SimilarPins pins={similarPins} />
        </div> */}
      </div>
    </div>
  );
}
