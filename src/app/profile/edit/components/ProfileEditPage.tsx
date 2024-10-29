"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/app/components/shadcn/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/shadcn/ui/card';
import { Input } from '@/app/components/shadcn/ui/input';
import { Label } from '@/app/components/shadcn/ui/label';
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/shadcn/ui/form";
import { ToastMessage } from '@/app/components/ui/ToastMessage';
import ProfileAvatar from '../../components/ProfileAvatar';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: '名前は2文字以上で入力してください' })
    .max(30, { message: '名前は30文字以内で入力してください' }),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || '',
      image: session?.user?.image || '',
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルバリデーション
    if (!file.type.startsWith('image/')) {
      ToastMessage.error({
        title: "エラー",
        description: "画像ファイルのみアップロード可能です",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      ToastMessage.error({
        title: "エラー",
        description: "ファイルサイズは5MB以下にしてください",
      });
      return;
    }

    // プレビュー表示用
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      
      // 選択されたファイルがある場合のみ追加
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      await response.json();
      await update(); // セッションの更新

      ToastMessage.success({
        title: "更新成功",
        description: "プロフィールを更新しました",
      });
      router.push('/profile');
      router.refresh();
    } catch (error) {
      ToastMessage.error({
        title: "更新失敗",
        description: "プロフィールの更新に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-2xl font-bold">プロフィールの編集</h1>
        <p className="text-muted-foreground">
          個人情報は公開しないでください。ここに追加した情報は、あなたのプロフィールを閲覧できるすべてのユーザーに表示されます。
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                {imagePreview ? (
                  // プレビュー用の通常のAvatarコンポーネント
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // S3から画像を取得するProfileAvatarコンポーネント
                  <ProfileAvatar
                    imageKey={session?.user?.image}
                    fallback={session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    className="w-20 h-20"
                  />
                )}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoading ? 'アップロード中...' : '画像を変更'}
                  </Button>
                  {imagePreview && (
                    <p className="text-sm text-muted-foreground mt-2">
                      プロフィールの保存時に画像もアップロードされます
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名前</FormLabel>
                    <FormControl>
                      <Input placeholder="あなたの名前" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '保存中...' : '保存する'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
