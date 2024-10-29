

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/shadcn/ui/avatar';
import { getProfileImageUrl } from '@/app/libs/s3';

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

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (imageKey) {
        try {
          // S3のキーを抽出
          const key = imageKey.split('.com/')[1];
          if (!key) return;
          
          // APIを呼び出して署名付きURLを取得
          const response = await fetch(`/api/user/profile/image?key=${encodeURIComponent(key)}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }

          const data = await response.json();
          setSignedUrl(data.url);
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };

    fetchSignedUrl();
  }, [imageKey]);

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={signedUrl || "/api/placeholder/128/128"} 
        alt="Profile"
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
