'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/shadcn/ui/avatar';
import { Button } from '@/app/components/shadcn/ui/button';
import { Pin } from '@/app/types/pin';
import { useSession } from 'next-auth/react';
import { FollowButton } from '@/app/components/follow/FollowButton';
import { PinDetailHeader } from './PinDetailHeader';
import useImageDimensions from '../hooks/useImageDimensions';
import usePinLayout from '../hooks/usePinLayout';

// TODO: 
// フォローを止めるボタン実装
// フォローボタンを表示。
// コメント機能実装
// ユーザーの画像を表示したい
// UIの調整
// 欲しいボタンは、
//・保存
//・共有
//・いいね
//・DL
//・ボード

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

  // 画像を取得する。
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pins/${pin.id}/signed-url`);
        if (!response.ok) throw new Error('Failed to fetch signed URL');
        const data = await response.json();
        setSignedUrl(data.url);
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
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

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl">
      <div
        style={{
          width: layout.containerWidth,
          height: layout.containerHeight
        }}
        className="relative bg-black rounded-tl-3xl rounded-bl-3xl overflow-hidden"
      >
        {isLoading || !signedUrl ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : (
          <Image
            src={signedUrl}
            alt={pin.title}
            fill
            className={layout.imageStyle}
            priority
          />
        )}
      </div>

      {/* 右側: 情報 */}
      <div className="flex flex-col w-full md:w-[500px] lg:w-[600px] p-8 overflow-y-auto">
        {/* アクションボタン */}
        <PinDetailHeader 
          pinId={pin.id}
          onShare={handleShare}
          onDownload={handleDownload}
          onSave={handleSave}
          isSaved={false}
        />

        {/* タイトルと説明 */}
        <h1 className="text-2xl font-bold mb-4">{pin.title}</h1>
        {pin.description && (
          <p className="text-gray-600 mb-6">{pin.description}</p>
        )}

        {/* ユーザー情報 */}
        <div className="flex items-center gap-3 mb-8">
          <Avatar>
            <AvatarImage src={pin.user.image} />
            <AvatarFallback>{pin.user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center flex-1">
            <div>
              <p className="font-semibold">{pin.user.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(pin.createdAt).toLocaleDateString()}
              </p>
            </div>
            <FollowButton
              targetUserId={pin.user.id}
              currentUserId={session?.user?.id}
              initialIsFollowing={initialIsFollowing}
            />
          </div>
        </div>

        {/* コメントセクション */}
        <div className="flex-1 min-h-0">
          <h2 className="font-semibold text-lg mb-4">コメント</h2>
          <div className="space-y-4 overflow-y-auto">
            {/* コメントリストのレンダリング */}
          </div>
        </div>

        {/* コメント入力 */}
        <form onSubmit={(e) => { e.preventDefault(); }} className="mt-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={!comment.trim()}>
              投稿
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
