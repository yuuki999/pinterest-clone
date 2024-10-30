import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/app/components/shadcn/ui/dialog';
import { Input } from '@/app/components/shadcn/ui/input';
import { Label } from '@/app/components/shadcn/ui/label';
import { Button } from '@/app/components/shadcn/ui/button';
import { Search } from 'lucide-react';
import { Switch } from '../shadcn/ui/switch';
import { ToastMessage } from '../ui/ToastMessage';
import { useRouter } from 'next/navigation';

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [collaborator, setCollaborator] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isPrivate, collaborator }),
      });

      const data = await response.json();
      
      if (response.ok) {
        ToastMessage.success({
          title: "ボード作成成功",
          description: "",
        });

        onClose();
        setName('');
        setIsPrivate(false);
        setCollaborator('');

        // 作成したボードの詳細画面に遷移
        router.push(`/boards/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      ToastMessage.error({
        title: "ボード作成失敗",
        description: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black border border-neutral-800">
        <DialogHeader className="relative border-b border-neutral-800 pb-4">
          <DialogTitle className="text-center text-lg font-semibold text-white">
            新規ボードを作成する
          </DialogTitle>
          <DialogClose className="absolute right-0 top-0">
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-neutral-200">
              名前
            </Label>
            <Input
              id="name"
              placeholder="例：「行きたい場所」「作ってみたいレシピ」"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="private" className="text-sm font-medium text-neutral-200">
              このボードを非公開にする
            </Label>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-200">
              ボード参加者を追加
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="名前またはメールで検索する"
                className="bg-neutral-900 border-neutral-700 text-white pl-10 placeholder:text-neutral-500 focus:ring-primary"
                value={collaborator}
                onChange={(e) => setCollaborator(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          作成する
        </Button>
      </DialogContent>
    </Dialog>
  );
}
