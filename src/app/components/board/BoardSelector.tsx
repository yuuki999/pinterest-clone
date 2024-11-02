import React, { useState } from 'react';
import { Button } from "@/app/components/shadcn/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/shadcn/ui/popover";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/shadcn/ui/dialog";
import { Input } from "@/app/components/shadcn/ui/input";
import { Textarea } from "@/app/components/shadcn/ui/textarea";
import { ChevronDown, Plus, FolderPlus, Search, Loader2 } from "lucide-react";
import { boardsAtom, createBoardAtom, usePinBoardOperations } from '@/app/atoms/boardAtom';
import { useAtom } from 'jotai';
import { ToastMessage } from '../ui/ToastMessage';
import { DialogTrigger } from '../shadcn/ui/dialog';

interface BoardSelectorProps {
  pinId: string;
  onOpenChange: (isOpen: boolean) => void;
  variant?: 'card' | 'header';
  className?: string;
}

export const BoardSelector = ({ 
  pinId, 
  onOpenChange,
  variant = 'card',
  className = '' 
}: BoardSelectorProps) => {
  const [boards] = useAtom(boardsAtom);
  const [, createBoard] = useAtom(createBoardAtom);
  const { savePinToBoard } = usePinBoardOperations(pinId);
  
  const [loading, setLoading] = useState(false);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingToBoard, setSavingToBoard] = useState<string | null>(null);

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // TODO: ボードの検索機能が必要。

  const handleCreateBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newBoard.title.trim()) return;

    try {
      setLoading(true);
      await createBoard(newBoard);
      setNewBoard({ title: '', description: '' });
      setShowNewBoardDialog(false);
      ToastMessage.success({
        title: "ボード作成完了",
        description: "新しいボードを作成しました",
      });
    } catch (error) {
      ToastMessage.error({
        title: "エラー",
        description: "ボードの作成に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoard = async (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setSavingToBoard(boardId);
      await savePinToBoard(boardId);
      ToastMessage.success({
        title: "保存完了",
        description: "ピンをボードに保存しました",
      });
      setIsPopoverOpen(false);
    } catch (status) {
      switch (status) {
        case 409:
          ToastMessage.info({
            title: "保存済み",
            description: "このピンは既にボードに保存されています",
          });
          break;
        default:
          ToastMessage.error({
            title: "エラー",
            description: "ピンの保存に失敗しました",
          });
      }
    } finally {
      setSavingToBoard(null);
    }
  };

  const containerStyles = {
    card: `absolute top-2 right-2 transition-all duration-200 z-10 
      ${isPopoverOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hover:opacity-100 hover:scale-100'}`,
    header: 'relative transition-all duration-200 z-10'
  };

  const buttonStyles = {
    card: 'bg-white/90 hover:bg-white shadow-lg hover:shadow-xl text-gray-700 rounded-full px-4 py-2 backdrop-blur-sm',
    header: 'bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-6 py-2'
  };

  return (
    <div className={`${containerStyles[variant]} ${className}`}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`${buttonStyles[variant]} flex items-center gap-2 group`}
          >
            <FolderPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>保存</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 
              ${isPopoverOpen ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0 shadow-xl rounded-xl border-gray-200"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col max-h-[28rem]">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ボードを検索"
                  className="pl-9 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 py-2">
              {filteredBoards.length > 0 ? (
                filteredBoards.map((board) => (
                  <Button
                    key={board.id}
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto text-left hover:bg-gray-50"
                    onClick={(e) => handleSelectBoard(e, board.id)}
                    disabled={savingToBoard === board.id}
                  >
                    <span className="truncate flex-1">{board.title}</span>
                    {savingToBoard === board.id && (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    )}
                  </Button>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {searchQuery ? "ボードが見つかりません" : "ボードがありません"}
                </div>
              )}
            </div>
            
            <div className="p-2 border-t bg-gray-50">
              <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full justify-start text-left flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>新規ボードを作成</span>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>新規ボードを作成</DialogTitle>
                    <DialogDescription>
                      コレクションを整理するための新しいボードを作成します
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="ボードのタイトル"
                        value={newBoard.title}
                        onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="ボードの説明（任意）"
                        value={newBoard.description}
                        onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewBoardDialog(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleCreateBoard}
                      disabled={!newBoard.title.trim() || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          作成中...
                        </>
                      ) : '作成'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BoardSelector;
