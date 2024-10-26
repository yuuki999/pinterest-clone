'use client'

import Link from 'next/link'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedProfileLink } from './auth/ProtectedProfileLink'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './shadcn/ui/dropdown-menu'
import { toast } from '../hooks/shadcn/use-toast'

export function Header() {
  const router = useRouter()
  const { status } = useSession() // 認証状態
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  console.log("status: ", status)

  // 検索処理
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // 検索クエリをURLパラメータとして追加
    const encodedQuery = encodeURIComponent(searchQuery.trim())
    router.push(`/search?q=${encodedQuery}`)
    
    // 検索入力をクリア
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  // Enter キーでの検索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  // 検索バーのクリア
  const clearSearch = () => {
    setSearchQuery('')
  }

  // ログアウト機能
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      
      // NextAuthのsignOut関数を呼び出し
      await signOut({ 
        redirect: false 
      })

      // 成功時のトースト表示
      toast({
        title: "ログアウト成功",
        description: "またのご利用をお待ちしております！",
        variant: "default",
        className: "bg-green-500 text-white",
      })

      // ログアウト後の処理
      router.push('/')
      router.refresh()

    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "ログアウトエラー",
        description: error instanceof Error ? error.message : "ログアウトに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

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

        {/* 検索フォーム */}
        <div className="flex-1 max-w-2xl px-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full bg-gray-100 rounded-full py-3 px-4 pl-10 pr-12 outline-none transition-shadow duration-200 ${
                isSearchFocused ? 'shadow-md ring-2 ring-blue-500' : 'focus:shadow-md'
              }`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={() => {
                if (searchQuery.trim()) {
                  const form = document.querySelector('form')
                  form?.requestSubmit()
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </form>
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
              </button>
            </DropdownMenuTrigger>
            {/* ユーザーアイコンをクリックした時のメニュー */}
            <DropdownMenuContent align="end" className="w-48">
              <ProtectedProfileLink href="/profile">
                プロフィール
              </ProtectedProfileLink>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
