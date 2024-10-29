"use client"

import { ToastMessage } from '@/app/components/ui/ToastMessage';
import { useState, useEffect } from 'react';

export const usePinSave = (pinId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   checkSaveStatus();
  // }, [pinId]);

  // 保存チェックをする。これめっちゃ重いかも。
  // 一覧に表示するときに省けばここの処理は不要になるのでコメントアウトする。
  // const checkSaveStatus = async () => {
  //   try {
  //     const response = await fetch(`/api/saves?pinId=${pinId}`);
  //     const data = await response.json();
  //     setIsSaved(data.saved);
  //   } catch (error) {
  //     console.error('Failed to check save status:', error);
  //   }
  // };

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
