'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/shadcn/ui/avatar';
import { Button } from '@/app/components/shadcn/ui/button';
import { Heart, Share2, Download } from 'lucide-react';
import { Pin } from '@/app/types/pin';
import { useSession } from 'next-auth/react';
import { FollowButton } from '@/app/components/follow/FollowButton';
import { PinDetailHeader } from './PinDetailHeader';

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
  const [imageRatio, setImageRatio] = useState(1);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

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

  useEffect(() => {
    if (!signedUrl) return;

    // 画像の実寸のサイズを取得するため、新しいImage要素を作成
    const img = new window.Image();
    img.src = signedUrl;

    // 画像のロードが完了した時の処理
    img.onload = () => {
      // 画像の縦横比を計算
      const ratio = img.height / img.width;
      setImageRatio(ratio);
      
      // コンテナの高さを設定
      // ビューポートの高さの85%か、画像の高さの小さい方に設定
      const maxHeight = Math.min(window.innerHeight * 0.85, img.height);
      setContainerHeight(`${maxHeight}px`);
    };
  }, [signedUrl]);

  const getImageContainerClass = () => {
    // 縦長の画像（縦:横 = 1.5:1より大きい）の場合
    if (imageRatio > 1.5) {
        return 'w-full md:w-auto md:max-h-[85vh]';
        // - w-full: モバイルでは幅いっぱい
        // - md:w-auto: タブレット以上では自然な幅
        // - md:max-h-[85vh]: タブレット以上では画面の85%の高さまで
    } 
    // 横長の画像（縦:横 = 0.7:1未満）の場合
    else if (imageRatio < 0.7) {
        return 'w-full md:w-[60vw]';
        // - w-full: モバイルでは幅いっぱい
        // - md:w-[60vw]: タブレット以上では画面幅の60%
    }
    // 標準的な比率の画像（0.7 ≤ ratio ≤ 1.5）の場合
    return 'w-full md:w-[50vw]';
    // - w-full: モバイルでは幅いっぱい
    // - md:w-[50vw]: タブレット以上では画面幅の50%
  };

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
    <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-lg mx-auto max-h-[85vh]">
      {/* 左側: 画像 */}
      <div className={`${getImageContainerClass()} relative flex-shrink-0`}>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : signedUrl ? (
          <div className="relative w-full h-full min-h-[300px] md:min-h-[500px]">
            <Image
              src={signedUrl}
              alt={pin.title || 'Pin image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <p>No image available</p>
          </div>
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
