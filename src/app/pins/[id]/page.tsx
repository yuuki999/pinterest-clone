import { notFound } from 'next/navigation';
import { PinDetail } from './components/PinDetail';
import { getPinById } from '@/app/libs/pins';
import RecommendedPinsSection from './components/recommend/RecommendedPinsSection';

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

  return (
    <div className="min-h-screen">
      {/* メインコンテンツ - 幅を制限 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PinDetail pin={pin} />
      </div>
      
      {/* おすすめセクション - フル幅 */}
      <div className="w-10/12 mx-auto">
        <RecommendedPinsSection currentPinId={pin.id} />
      </div>
    </div>
  );
}
