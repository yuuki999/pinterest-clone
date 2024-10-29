"use client"

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/shadcn/ui/avatar';
import { Skeleton } from '@/app/components/shadcn/ui/skeleton';

const ProfileAvatar = ({ 
  imageKey, 
  fallback, 
  className 
}: { 
  imageKey: string | null | undefined;
  fallback: string;
  className?: string;
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          resolve();
        };
        img.onerror = () => {
          reject();
        };
      });
    };

    const fetchAndPreloadImage = async () => {
      setIsLoading(true);
      
      if (imageKey) {
        try {
          // S3のキーを抽出
          const key = imageKey.split('.com/')[1];
          if (!key) {
            setIsLoading(false);
            return;
          }
          
          // APIを呼び出して署名付きURLを取得
          const response = await fetch(`/api/user/profile/image?key=${encodeURIComponent(key)}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }

          const data = await response.json();
          
          // 画像をプリロード
          await preloadImage(data.url);
          
          // プリロード完了後にURLをセット
          setSignedUrl(data.url);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading image:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchAndPreloadImage();
  }, [imageKey]);

  if (isLoading) {
    return <Skeleton className={`${className} rounded-full`} />;
  }

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={signedUrl || ""} 
        alt="Profile"
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
