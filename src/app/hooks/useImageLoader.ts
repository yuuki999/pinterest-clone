import { useState, useEffect, useRef } from 'react';
import { Pin } from '../types/pin';

export interface LoadingState {
  [key: string]: boolean;
}

// 画像が完全に読み込まれるまでの状態を管理するカスタムフック
// 管理が難しいので使用していない。
export const useImageLoader = (pins: Pin[]) => {
  const [imageLoadingStates, setImageLoadingStates] = useState<LoadingState>({});
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 処理済みの画像IDを追跡
  const processedPinIds = useRef<Set<string>>(new Set());

  // 画像読み込みの完了チェック
  useEffect(() => {
    if (pins.length === 0) return;
    
    const allImagesLoaded = Object.values(imageLoadingStates).every(state => state);
    const hasAllStates = Object.keys(imageLoadingStates).length === pins.length;
    
    if (hasAllStates && allImagesLoaded) {
      setInitialLoading(false);
    }
  }, [imageLoadingStates, pins.length]);

  // 画像の読み込み処理
  useEffect(() => {
    console.log("これ何回実行される？")
    const loadNewImages = () => {
      // 新しいピンのみを処理
      const newPins = pins.filter(pin => !processedPinIds.current.has(pin.id));
      
      if (newPins.length === 0) return;

      const newLoadingStates: LoadingState = {};
      
      newPins.forEach(pin => {
        // すでに状態が存在する場合はスキップ
        if (imageLoadingStates[pin.id] !== undefined) return;

        processedPinIds.current.add(pin.id);
        const img = new Image();
        
        img.onload = () => {
          setImageLoadingStates(prev => ({
            ...prev,
            [pin.id]: true
          }));
        };

        img.onerror = () => {
          setImageLoadingStates(prev => ({
            ...prev,
            [pin.id]: false
          }));
        };

        newLoadingStates[pin.id] = false;
        img.src = pin.imageUrl; // src は最後に設定
      });

      if (Object.keys(newLoadingStates).length > 0) {
        setImageLoadingStates(prev => ({
          ...prev,
          ...newLoadingStates
        }));
      }
    };

    loadNewImages();
  }, [pins]);

  // クリーンアップ関数を追加
  useEffect(() => {
    return () => {
      processedPinIds.current.clear();
    };
  }, []);

  return { 
    imageLoadingStates, 
    initialLoading,
    // 追加の便利なメソッド
    isImageLoaded: (pinId: string) => imageLoadingStates[pinId] === true,
    areAllImagesLoaded: () => Object.values(imageLoadingStates).every(state => state)
  };
};
