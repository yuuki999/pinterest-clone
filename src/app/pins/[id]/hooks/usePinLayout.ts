import { useState, useEffect } from 'react';

// レイアウトの型定義
interface Layout {
  containerWidth: string;
  containerHeight: string;
  imageStyle: string;
}

// フックの戻り値の型を明示的に定義
// imageWidth: 画像の実際の幅
// imageHeight: 画像の実際の高さ
const usePinLayout = (imageWidth: number, imageHeight: number): Layout => {
  const [layout, setLayout] = useState<Layout>({
    containerWidth: '0px',
    containerHeight: '0px',
    imageStyle: 'object-contain'
  });

  useEffect(() => {
    const calculateLayout = () => {
      const viewportHeight = window.innerHeight * 0.55; // // ビューポートのn%の高さで画像を表示する。
      // const maxContentWidth = 1000; // 最大コンテンツ幅
      const sidebarWidth = 360; // サイドバー幅

      let containerWidth = '50%';
      let containerHeight = viewportHeight;

      // アスペクト比の計算
      // アスペクト比（Aspect Ratio）は、画像の横幅と縦幅の比率を表す値
      // 例えば下記のような画像がある場合、1.5のアスペクト比となり、値が大きいほど縦長になる。
      // Width: 1500px
      // Height: 1000px
      // aspectRatio = 1500 ÷ 1000 = 1.5
      const aspectRatio = imageWidth / imageHeight;

      if (aspectRatio > 1.5) {
        // 横長画像
        // 例：横幅1500px、縦幅800pxの画像（アスペクト比1.875）の場合、
        // calc(100% - 360px)：画面の全幅からサイドバーの幅（360px）を引いた幅を設定
        containerWidth = `calc(100% - ${sidebarWidth}px)`;
      } else if (aspectRatio < 0.7) {
        // 縦長画像
        // 例：横幅600px、縦幅1000pxの画像（アスペクト比0.6）
        // containerWidth = 'auto'：画像の自然な幅を維持
        // containerHeight = viewportHeight：ビューポートの高さ（85vh）に合わせる
        containerWidth = 'auto';
        containerHeight = viewportHeight;
      }

      // TODO: この辺をいろんな写真を適用してテストしてみたい。
      // 外部サービスの導入を考えてもいいかもしれない。
      // ・import sharp from 'sharp';
      // Cloudinary ← これはどう？　無料プランがあるので検証してみもいいかも。
      setLayout({
        containerWidth,
        containerHeight: `${containerHeight}px`,
        // imageStyle: aspectRatio > 1.2 ? 'object-contain' : 'object-cover'
        imageStyle: 'object-cover',
      });
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [imageWidth, imageHeight]);

  return layout;
};

export default usePinLayout;
