import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadToS3 = async (file: File) => {
    try {
      // Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: file.type }),
      });
      
      const { url, fields, key } = await response.json();
      
      // Upload to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Return the S3 URL of the uploaded image
      return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

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
      const imageUrl = await uploadToS3(file);
      console.log('Uploaded image URL:', imageUrl);
      
      // Here you would typically save the imageUrl to your database
      
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload failed. Please try again.: ', err);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, []);

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
              onClick={() => setPreview(null)}
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
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded">
            <div className="h-full bg-blue-500 rounded animate-pulse" />
          </div>
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
