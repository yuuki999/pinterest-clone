import { Upload, X } from 'lucide-react';
import { Card, CardContent } from "@/app/components/shadcn/ui/card";
import { Button } from "@/app/components/shadcn/ui/button";

interface ImagePreviewProps {
  preview: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function ImagePreview({ preview, onFileSelect, onClear }: ImagePreviewProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const file = 'dataTransfer' in e 
      ? e.dataTransfer?.files[0]
      : e.target.files?.[0];
    
    if (!file) return;
    onFileSelect(file);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors"
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-md"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onClear}
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                ドラッグ&ドロップ、またはクリックしてファイルを選択
              </p>
              <input
                type="file"
                onChange={handleDrop}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
