'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Share2, Pencil } from 'lucide-react';
import { Button } from '@/app/components/shadcn/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/shadcn/ui/tabs';
import ProfileAvatar from './ProfileAvatar';
import { useEffect, useState } from 'react';
import { CreatedContent } from './created/CreatedContent';
import { SavedContent } from './saved/SavedContent';
import { Skeleton } from '@/app/components/shadcn/ui/skeleton';
import { ProfileStats } from './ProfileStats';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    const fetchFollowStats = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}/stats`);
        const data = await response.json();
        setFollowStats(data);
      } catch (error) {
        console.error('Failed to fetch follow stats:', error);
      }
    };

    if (status === 'authenticated') {
      fetchFollowStats();
    }
  }, [session?.user?.id, status]);

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (status === 'unauthenticated') {
    redirect('/');
  }

  const displayName = session?.user?.name || 'Unknown User';
  const handle = session?.user?.email?.split('@')[0].replace(/\./g, '') || 'unknown';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  return (
    <main className="container mx-auto pt-20 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        <ProfileAvatar
          imageKey={session?.user?.image}
          fallback={initials}
          className="w-32 h-32 ring-4 ring-primary/20"
        />

        <ProfileStats
          userId={session?.user?.id}
          displayName={displayName}
          handle={handle}
          initialStats={followStats}
          onStatsUpdate={setFollowStats}
        />

        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleEditProfile}
            className="bg-primary hover:bg-primary/90"
          >
            <Pencil className="w-4 h-4 mr-2" />
            プロフィールを編集
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            共有
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger 
            value="created" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            作成済み
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            保存済み
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="mt-6">
          <CreatedContent userId={session?.user?.id} />
        </TabsContent>

        <TabsContent value="saved" className="mt-12">
          <SavedContent userId={session?.user?.id} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

const ProfileSkeleton = () => (
  <div className="flex flex-col items-center space-y-4 pt-20">
    <Skeleton className="w-32 h-32 rounded-full" />
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-32" />
  </div>
);
