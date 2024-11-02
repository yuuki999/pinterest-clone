import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/shadcn/ui/popover";
import { Button } from "@/app/components/shadcn/ui/button";
import { Share2, Copy, Check, Twitter, Facebook, Instagram } from "lucide-react";
import { ToastMessage } from '@/app/components/ui/ToastMessage';

interface ShareButtonProps {
  url: string;
  title?: string;
}

export const ShareButton = ({ url, title = '' }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      id: 'copy',
      name: 'リンクをコピー',
      icon: copied ? Check : Copy,
      color: 'text-gray-300',
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          ToastMessage.success({
            title: "コピー完了",
            description: "リンクをクリップボードにコピーしました",
          });
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          ToastMessage.error({
            title: "エラー",
            description: "リンクのコピーに失敗しました",
          });
        }
      }
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'text-[#1DA1F2]', // Twitter Blue
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank'
        );
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-[#1877F2]', // Facebook Blue
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
      }
    },
    // TODO: instagramの共有が難しいので何か他の方法を考える。
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      onClick: () => {
        ToastMessage.info({
          title: "Instagram",
          description: "Instagram APIの制限により、ストーリーへの直接共有はできません",
        });
      }
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="
            relative 
            group 
            bg-gray-900 
            hover:bg-gray-800 
            dark:bg-gray-900 
            dark:hover:bg-gray-800
            rounded-full 
            transition-all 
            duration-200
            w-10 
            h-10
            flex 
            items-center 
            justify-center
          "
        >
          <Share2 
            className="
              h-5 
              w-5 
              transition-all 
              duration-200 
              ease-in-out
              text-gray-300 
              group-hover:text-primary 
              group-hover:scale-110
            "
          />
          <span className="
            absolute 
            -bottom-8 
            left-1/2 
            transform 
            -translate-x-1/2 
            bg-gray-800 
            dark:bg-gray-700 
            text-white 
            px-2 
            py-1 
            rounded 
            text-xs
            opacity-0 
            group-hover:opacity-100 
            transition-opacity 
            duration-200
            whitespace-nowrap 
            shadow-lg 
            pointer-events-none
            z-10
          ">
            シェア
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-4 shadow-2xl rounded-xl border border-gray-700 bg-gray-900 dark:bg-gray-800"
        side="top"
        align="end"
      >
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-white">シェアする</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              className="
                w-full justify-start h-auto py-4 px-3 rounded-lg 
                bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 
                transition-all duration-200
              "
              onClick={() => {
                option.onClick();
                if (option.id !== 'copy') setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                <option.icon className={`w-6 h-6 mr-3 ${option.color}`} />
                <span className="text-sm font-medium text-white">{option.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
