"use client"

import { ToastMessage } from '@/app/components/ui/ToastMessage';
import { useState, useEffect } from 'react';

interface UsePinSaveProps {
  pinId: string;
  initialIsSaved?: boolean;
}

export const usePinSave = ({ pinId, initialIsSaved = false }: UsePinSaveProps) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved); // 保存されていたらtrue
  const [isLoading, setIsLoading] = useState(false);

  // 保存状態の、初期状態を取得
  useEffect(() => {
    const fetchSaveStatus = async () => {
      try {
        const response = await fetch(`/api/saves/${pinId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch save status');
        }
        const data = await response.json();
        setIsSaved(data.saved);
      } catch (error) {
        console.error('Failed to fetch save status:', error);
      }
    };

    fetchSaveStatus();
  }, [pinId]);

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/saves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pinId })
      });

      if (!response.ok) {
        throw new Error('Failed to save pin');
      }

      const data = await response.json();
      setIsSaved(data.saved);

      ToastMessage.success({
        title: "保存成功",
        description: data.saved ? "ピンを保存しました" : "ピンの保存を解除しました",
      });

    } catch (error) {
      console.error('Save error:', error);
      ToastMessage.error({
        title: "エラーが発生しました",
        description: "ピンの保存に失敗しました",
      });

    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSaved,
    isLoading,
    handleSave
  };
};
