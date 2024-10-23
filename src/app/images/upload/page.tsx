'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/app/components/ImageUpload';

export default function CreatePinPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageKey: '',
  });

  const handleImageUpload = async (image: { url: string; key: string }) => {
    setFormData(prev => ({
      ...prev,
      imageKey: image.key
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageKey) {
      alert('画像をアップロードしてください');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageKey, // S3のキーを保存
          // 本来はユーザー認証を実装してユーザーIDを取得します
          userId: "test-user-id"
        }),
      });

      if (!response.ok) {
        throw new Error('Pin creation failed');
      }

      router.push('/');
    } catch (error) {
      console.error('Error creating pin:', error);
      alert('投稿に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新しいピンを作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            画像をアップロード
          </label>
          <ImageUpload onUpload={handleImageUpload} />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            説明
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded-lg h-32"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !formData.imageKey}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {uploading ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </div>
  );
}
