import React, { useState, useEffect } from 'react';
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
  DialogTrigger,
} from "@/app/components/shadcn/ui/dialog";
import { Input } from "@/app/components/shadcn/ui/input";
import { Textarea } from "@/app/components/shadcn/ui/textarea";
import { ChevronDown, Plus, FolderPlus } from "lucide-react";
import { boardsAtom, createBoardAtom } from '@/app/atoms/boardAtom';
import { useAtom } from 'jotai';

interface Board {
  id: string;
  title: string;
  description?: string;
}

interface BoardSelectorProps {
  pinId: string;
  onSaveToBoard: (boardId: string) => Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
}

// TODO: 新規ボードを作成を、ポップアップ外をクリックして閉じた時に、ボードに保存とか他のボタンが残り続ける。
export const BoardSelector = ({ pinId, onSaveToBoard, onOpenChange }: BoardSelectorProps) => {
  const [boards] = useAtom(boardsAtom);
  const [, createBoard] = useAtom(createBoardAtom);
  const [loading, setLoading] = useState(false);
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);


  console.log("boards")
  console.log(boards)

  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePopoverChange = (open: boolean) => {
    setIsPopoverOpen(open);
    onOpenChange?.(open);
  };

  const handleDialogChange = (open: boolean) => {
    setShowNewBoardDialog(open);
  };

  const handleCreateBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const createdBoard = await createBoard(newBoard);
      setNewBoard({ title: '', description: '' });
      setShowNewBoardDialog(false);
      await onSaveToBoard(createdBoard.id);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoard = async (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await onSaveToBoard(boardId);
    handlePopoverChange(false);
  };

  const handleNewBoardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNewBoardDialog(true);
  };

  const visibilityClass = isPopoverOpen || showNewBoardDialog || isVisible
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100';

  return (
    <div
      className={`absolute top-2 left-2 ${visibilityClass} transition-opacity duration-200 z-10`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => !isPopoverOpen && !showNewBoardDialog && setIsVisible(false)}
    >
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 flex items-center gap-2"
            onClick={handleMainButtonClick}
          >
            <FolderPlus className="w-4 h-4" />
            <span>ボードに保存</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-64 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-96">
            <div className="overflow-y-auto flex-1 p-2">
              {boards.map((board) => (
                <Button
                  key={board.id}
                  variant="ghost"
                  className="w-full justify-start text-left mb-1"
                  onClick={(e) => handleSelectBoard(e, board.id)}
                >
                  {board.title}
                </Button>
              ))}
            </div>
            
            <div className="border-t p-2 bg-white">
              <Dialog open={showNewBoardDialog} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full justify-start text-left flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleNewBoardClick}
                  >
                    <Plus className="w-4 h-4" />
                    <span>新規ボードを作成</span>
                  </Button>
                </DialogTrigger>
                
                <DialogContent onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>新規ボードを作成</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="ボードのタイトル"
                      value={newBoard.title}
                      onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Textarea
                      placeholder="説明（任意）"
                      value={newBoard.description}
                      onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      className="w-full"
                      onClick={handleCreateBoard}
                      disabled={!newBoard.title || loading}
                    >
                      {loading ? '作成中...' : '作成'}
                    </Button>
                  </div>
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
