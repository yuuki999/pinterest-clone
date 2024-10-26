'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Pin } from '@/app/types/pin';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/shadcn/ui/card";
import { Button } from "@/app/components/shadcn/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/shadcn/ui/avatar";
import { Skeleton } from "@/app/components/shadcn/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/shadcn/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/app/components/shadcn/ui/hover-card";

type PinGridProps = {
  initialPins: Pin[];
  initialCursor: string | null;
};

export function PinGrid({ initialPins, initialCursor }: PinGridProps) {
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    const loadMore = async () => {
      if (inView && !loading && cursor && hasMore) {
        setLoading(true);
        try {
          const response = await fetch(`/api/pins?cursor=${cursor}`);
          const data = await response.json();
          
          if (data.pins.length > 0) {
            setPins(prev => [...prev, ...data.pins]);
            setCursor(data.nextCursor);
          } else {
            setHasMore(false);
          }
          
          if (!data.nextCursor) {
            setHasMore(false);
          }
        } catch (error) {
          console.error('Error loading more pins:', error);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMore();
  }, [inView, loading, cursor, hasMore]);

  const PinCard = ({ pin }: { pin: Pin }) => (
    <Card className="overflow-hidden border-none shadow-none hover:shadow-lg transition-all duration-300">
      <div className="relative group">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="w-full h-auto object-cover rounded-lg"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg" />
        
        {/* Floating Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                <Share2 className="w-4 h-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              シェアする
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                <Bookmark className="w-4 h-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              保存する
            </HoverCardContent>
          </HoverCard>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>ピンを報告</DropdownMenuItem>
              <DropdownMenuItem>非表示にする</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle className="text-lg font-medium line-clamp-2">{pin.title}</CardTitle>
        {pin.description && (
          <CardDescription className="line-clamp-2">
            {pin.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={pin.user?.image} />
              <AvatarFallback>
                {pin.user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pin.user?.name ?? '匿名ユーザー'}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-sm">0</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">0</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="px-4 py-6">
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {pins.map((pin) => (
          <div key={pin.id} className="break-inside-avoid mb-4">
            <PinCard pin={pin} />
          </div>
        ))}
      </div>
      
      {(hasMore || loading) && (
        <div 
          ref={ref}
          className="w-full py-8 flex justify-center items-center"
        >
          {loading && (
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <Skeleton className="h-[250px] w-[300px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
