import React, { useEffect, useState, useRef, ReactNode } from 'react';

interface MasonryGridProps {
  children: ReactNode;
  columnWidth?: number;
  gap?: number;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  children, 
  columnWidth = 300, 
  gap = 16 
}) => {
  const [columns, setColumns] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newColumnCount = Math.max(1, Math.floor(containerWidth / columnWidth));
        setColumns(newColumnCount);
      }
    };

    // 初期化時とリサイズ時にカラム数を更新
    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [columnWidth]);

  // 子要素を各カラムに分配
  const distributeChildren = () => {
    const columnHeights: number[] = Array(columns).fill(0);
    const columnElements: ReactNode[][] = Array(columns).fill(null).map(() => []);
    
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      
      // 最も高さが低いカラムを見つける
      const minHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minHeight);
      
      columnElements[columnIndex].push(child);
      columnHeights[columnIndex] += 1; // 簡易的な高さ計算
    });

    return columnElements;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full"
    >
      <div 
        className="flex"
        style={{ gap: `${gap}px` }}
      >
        {distributeChildren().map((column, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col"
            style={{ gap: `${gap}px` }}
          >
            {column.map((item, index) => (
              <div key={index} className="w-full">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGrid;
