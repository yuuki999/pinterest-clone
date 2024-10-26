"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/shadcn/ui/card';
import { Alert, AlertDescription } from '@/app/components/shadcn/ui/alert';
import { Input } from '@/app/components/shadcn/ui/input';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '@/app/components/shadcn/ui/textarea';
import { Button } from '@/app/components/shadcn/ui/button';
import { ImagePreview } from '@/app/components/ImagePreview';
import { ToastMessage } from '@/app/components/ui/ToastMessage';

export default function CreatePinPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const uploadToS3 = async (file: File): Promise<{ url: string; key: string }> => {
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, publicUrl, key } = await response.json();

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
      mode: 'cors',
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    return { url: publicUrl, key };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      ToastMessage.error({
        title: "エラー",
        description: "画像を選択してください",
      });
    }

    setUploading(true);
    setError(null);

    try {
      // 1. S3にアップロード
      const uploadedImage = await uploadToS3(selectedFile!);

      // 2. ピン情報をDBに保存
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: uploadedImage.key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Pin creation failed');
      }

      ToastMessage.success({
        title: "投稿完了",
        description: "ピンが正常に作成されました",
      });

      router.push('/');
    } catch (error) {
      console.error('Error creating pin:', error);

      ToastMessage.error({
        title: "エラー",
        description: "投稿に失敗しました。もう一度お試しください。",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新しいピンを作成</CardTitle>
          <CardDescription>
            あなたのアイデアや発見を共有しましょう
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">画像</Label>
              <ImagePreview
                preview={preview}
                onFileSelect={handleFileSelect}
                onClear={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="魅力的なタイトルを付けましょう"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="ピンの詳細を説明してください"
                className="h-32"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  投稿中...
                </>
              ) : (
                '投稿する'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
