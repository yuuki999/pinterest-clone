import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

type UploadedImage = {
  url: string;
  key: string;
};

interface ImageUploadProps {
  onUpload: (image: UploadedImage) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 画像をアップロードする。
  const uploadToS3 = async (file: File): Promise<UploadedImage> => {
    // 1. Get presigned URL
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, publicUrl, key } = await response.json();

    // 2. Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
      mode: 'cors', // CORSモードを明示的に指定
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    return { url: publicUrl, key };
  };

  // ファイルを選択すると発火
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const file = 'dataTransfer' in e 
      ? e.dataTransfer?.files[0]
      : e.target.files?.[0];
    
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to S3
      const uploadedImage = await uploadToS3(file);
      onUpload(uploadedImage);
      
    } catch (err) {
      setError('アップロードに失敗しました。もう一度お試しください。');
      console.error(err)
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded"
            />
            <button
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
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

      {uploading && (
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
