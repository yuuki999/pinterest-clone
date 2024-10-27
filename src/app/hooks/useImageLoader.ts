import { useState, useEffect } from 'react';
import { Pin } from '../types/pin';

export interface LoadingState {
  [key: string]: boolean;
}

// TODO: これのキャッチアップが必要。
export const useImageLoader = (pins: Pin[]) => {
  // 各画像の読み込み状態を管理するステート
  // 例: { "pin1": true, "pin2": false } → pin1は読み込み完了、pin2は未完了
  const [imageLoadingStates, setImageLoadingStates] = useState<LoadingState>({});
  // 全体の初期ローディング状態を管理するステート
  // true: まだ読み込み中、false: 全ての画像の読み込みが完了
  const [initialLoading, setInitialLoading] = useState(true);

  // 画像の読み込み状態を監視し、全ての画像が読み込まれたかチェック
  useEffect(() => {
    // すべての画像が読み込み完了（true）になっているかチェック
    const allImagesLoaded = Object.values(imageLoadingStates).every(state => state);
    // 全ての画像の状態が管理されているかチェック
    const hasStates = Object.keys(imageLoadingStates).length === pins.length;
    
    // すべての画像が登録され、かつ読み込みが完了していれば
    if (hasStates && allImagesLoaded) {
      setInitialLoading(false);
    }
  }, [imageLoadingStates, pins.length]);

  // 新しい画像の読み込みを開始
  useEffect(() => {
    const loadImages = () => {
      const newLoadingStates: LoadingState = {};
      
      pins.forEach(pin => {
        const img = new Image();
        img.src = pin.imageUrl;
        newLoadingStates[pin.id] = false;

        // 画像が読み込まれたときに、読み込み完了（true）に更新
        img.onload = () => {
          setImageLoadingStates(prev => ({
            ...prev,
            [pin.id]: true
          }));
        };
      });

      setImageLoadingStates(prev => ({
        ...prev,
        ...newLoadingStates
      }));
    };

    loadImages();
  }, [pins]);

  return { imageLoadingStates, initialLoading };
};
