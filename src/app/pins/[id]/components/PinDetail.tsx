'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pin } from '@/app/types/pin';
import { useSession } from 'next-auth/react';
import { PinDetailHeader } from './PinDetailHeader';
import useImageDimensions from '../hooks/useImageDimensions';
import usePinLayout from '../hooks/usePinLayout';
import { PinComments } from './PinComments';
import { PinAuthorSection } from './PinAuthorSection';
import { PinDetailSkeleton } from './PinDetailSkeleton';

// TODO: 
// フォローを止めるボタン実装
// フォローボタンを表示。
// コメント機能実装
// ローディングがガタガタしていていけていないので調整する。

interface PinDetailProps {
  pin: Pin;
  initialIsFollowing?: boolean; // すでにフォローしているかどうか、これでフォローしていたらフォローを止めるボタンとしたい。
}

export function PinDetail({ pin, initialIsFollowing }: PinDetailProps) {
  const [comment, setComment] = useState('');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const [dimensions, isLoading] = useImageDimensions(signedUrl);
  const layout = usePinLayout(dimensions.width, dimensions.height);

  // 画像のプリロード
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject();
    });
  };

  useEffect(() => {
    const fetchAndPreloadImage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pins/${pin.id}/signed-url`);
        if (!response.ok) throw new Error('Failed to fetch signed URL');
        const data = await response.json();
        
        // 画像をプリロード
        await preloadImage(data.url);
        
        setSignedUrl(data.url);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setIsLoading(false);
      }
    };

    fetchAndPreloadImage();
  }, [pin.id]);


  const handleShare = () => {
    // シェア機能の実装
  };

  const handleDownload = () => {
    // ダウンロード機能の実装
  };

  const handleSave = (e: React.MouseEvent) => {
    // 保存機能の実装
  };

  // コメント送信機能
  const handleCommentSubmit = async (comment: string) => {
    try {
      const response = await fetch(`/api/pins/${pin.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error('Failed to submit comment');
      
      // コメント投稿後の処理（例：コメントリストの更新）
      // コメントの状態管理はここで行う
    } catch (error) {
      console.error('Error submitting comment:', error);
      throw error;
    }
  };

  if (isLoading || !signedUrl) {
    return <PinDetailSkeleton 
      containerWidth={layout.containerWidth} 
      containerHeight={layout.containerHeight} 
    />;
  }


  console.log(session?.user?.image)

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl">
      {/* 左側：画像 */}
      <div
        style={{
          width: layout.containerWidth,
          height: layout.containerHeight
        }}
        className="relative rounded-tl-3xl rounded-bl-3xl overflow-hidden"
      >
        <Image
          src={signedUrl}
          alt={pin.title}
          fill
          className={`${layout.imageStyle} transition-opacity duration-300`}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* 右側：情報 */}
      <div 
        className="flex flex-col w-full md:w-[500px] lg:w-[600px]"
        style={{ height: layout.containerHeight }}
      >
        <div className="flex flex-col h-full pt-8 pr-8 pb-4 pl-8">
            {/* ヘッダー部分 - 固定高さ */}
            <PinDetailHeader 
              pinId={pin.id}
              onShare={handleShare}
              onDownload={handleDownload}
              onSave={handleSave}
              isSaved={false}
            />

            <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{pin.title}</h1>
            {pin.description && (
              <p className="text-gray-600 mb-6">{pin.description}</p>
            )}

            <PinAuthorSection
              author={pin.user}
              createdAt={pin.createdAt}
              currentUserId={session?.user?.id}
              initialIsFollowing={initialIsFollowing}
              className="mb-8"
            />

          {/* コメント部分 - 残りの高さを埋める */}
          <div className="flex-1 overflow-hidden">
            <PinComments
              pinId={pin.id}
              onCommentSubmit={handleCommentSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
