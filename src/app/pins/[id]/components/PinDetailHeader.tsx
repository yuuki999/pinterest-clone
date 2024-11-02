import { useEffect, useState } from 'react';
import { Share2, Heart, Download } from 'lucide-react';

import { ActionButton } from './ActionButton';
import { SaveButton } from '@/app/components/ui/button/SaveButton';
import BoardSelector from '@/app/components/board/BoardSelector';
import { useLike } from '../hooks/useLike';
import { LikeButton } from '@/app/components/ui/button/LikeButton';
import { useDownload } from '../hooks/useDownload';

interface PinDetailHeaderProps {
  pinId: string;
  imageUrl: string;
  onShare?: () => void;
  isSaved?: boolean;
}

export function PinDetailHeader({ 
  pinId,
  imageUrl,
  onShare, 
  isSaved = false,
}: PinDetailHeaderProps) {
  const [, setIsPopoverOpen] = useState(false);
  const { isLiked, likeCount, toggleLike, fetchLikeStatus, isLoading } = useLike({ pinId, initialLiked: false}); // いいね機能
  const { downloadImage } = useDownload({ imageUrl, fileName: `pin_${pinId}`}); // DL機能
  
  useEffect(() => {
    if (pinId) {
      fetchLikeStatus();
    }
  }, [pinId]);


  function onSave(e: React.MouseEvent) {
    // 仮実装
  }

  return (
    <div className="flex justify-between items-center mb-6">
      {/* 左側のアクションボタン */}
      <div className="flex gap-2">
        <ActionButton 
          icon={Share2} 
          onClick={onShare}
        />
        <ActionButton 
          icon={Download} 
          onClick={downloadImage}
        />
        <LikeButton 
          isLiked={isLiked}
          count={likeCount}
          onClick={toggleLike}
          isLoading={isLoading}
        />
      </div>

      {/* 右側の保存セクション */}
      <div className="flex items-center gap-3">
        <BoardSelector
          pinId={pinId}
          onOpenChange={setIsPopoverOpen}
          variant="header"
        />
        <SaveButton 
          onClick={onSave}
          isSaved={isSaved}
        />
      </div>
    </div>
  );
}
