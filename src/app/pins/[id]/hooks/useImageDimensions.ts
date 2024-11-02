import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
}

// 画像のURL（署名付きURL）から、画像の実際のサイズを取得する.
const useImageDimensions = (imageUrl: string | null): [ImageDimensions, boolean] => {
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    const img = document.createElement('img') as HTMLImageElement;
    img.src = imageUrl;

    // 元画像のサイズを設定。
    const handleLoad = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      setIsLoading(false);
    };

    const handleError = () => {
      console.error('Failed to load image');
      setIsLoading(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageUrl]);

  return [dimensions, isLoading];
};

export default useImageDimensions;
