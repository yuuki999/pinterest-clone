'use client'

import React from 'react'
import Link from 'next/link'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

import { ProtectedProfileLink } from './auth/ProtectedProfileLink'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './shadcn/ui/dropdown-menu'

export function Header() {
  const { status } = useSession() // 認証状態
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-red-600 font-bold text-2xl">
            Pinterest
          </Link>
          {status === 'authenticated' && (
            <>
              <Link 
                href="/" 
                className="font-semibold hover:bg-gray-100 px-4 py-2 rounded-full transition"
              >
                ホーム
              </Link>
              <Link 
                href="/images/upload" 
                className="font-semibold hover:bg-gray-100 px-4 py-2 rounded-full transition"
              >
                作成
              </Link>
            </>
          )}
        </div>

        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <input
              type="search"
              placeholder="検索"
              className={`w-full bg-gray-100 rounded-full py-3 px-4 pl-10 outline-none transition-shadow duration-200 ${
                isSearchFocused ? 'shadow-md ring-2 ring-blue-500' : 'focus:shadow-md'
              }`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" 
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* 通知ボタン */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Bell className="w-6 h-6" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition flex items-center">
                <User className="w-6 h-6" />
                {/* TODO: ログインしていてかつユーザーの画像があればそれを表示したい。 */}
                {/* {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )} */}
              </button>
            </DropdownMenuTrigger>
            {/* ユーザーアイコンをクリックした時のメニュー */}
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-sm">
                {/* {session.user?.email} */}
              </DropdownMenuItem>
              <ProtectedProfileLink href="/profile">
                プロフィール
              </ProtectedProfileLink>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
