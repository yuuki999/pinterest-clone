import { useState } from 'react';

interface UseDownloadProps {
  imageUrl: string;
  fileName?: string;
}

export const useDownload = ({ imageUrl, fileName }: UseDownloadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadImage = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/pins/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // ファイル名の設定: 指定されたファイル名またはURLから拡張子を抽出
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = fileName ? `${fileName}.${extension}` : `image.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error; // エラーを上位で処理できるように再スロー
    } finally {
      setIsLoading(false);
    }
  };

  return {
    downloadImage,
    isLoading
  };
};
