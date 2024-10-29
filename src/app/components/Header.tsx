'use client'

import Link from 'next/link'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedProfileLink } from './auth/ProtectedProfileLink'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './shadcn/ui/dropdown-menu'
import { ToastMessage } from './ui/ToastMessage'
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function Header() {
  const router = useRouter()
  const { status } = useSession() // 認証状態
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { theme, setTheme } = useTheme()

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
        redirect: true,
        callbackUrl: '/' // リダイレクト先を指定
      })

      // 成功時のトースト表示
      ToastMessage.success({
        title: "ログアウト成功",
        description: "またのご利用をお待ちしております！",
      });

    } catch (error) {
      console.error('Logout error:', error)
      ToastMessage.error({
        title: "ログアウトエラー",
        description: error instanceof Error ? error.message : "ログアウトに失敗しました",
      });

      setIsLoggingOut(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-primary font-bold text-2xl">
            Pinterest
          </Link>
          {status === 'authenticated' && (
            <>
              <Link 
                href="/" 
                className="font-semibold hover:bg-accent/10 px-4 py-2 rounded-full transition text-foreground"
              >
                ホーム
              </Link>
              <Link 
                href="/images/upload" 
                className="font-semibold hover:bg-accent/10 px-4 py-2 rounded-full transition text-foreground"
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
              className={`w-full bg-muted/50 text-foreground rounded-full py-3 px-4 pl-10 pr-12 outline-none transition-all duration-200
                placeholder:text-muted-foreground
                ${isSearchFocused ? 'ring-2 ring-primary shadow-md' : 'focus:shadow-sm'}`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 cursor-pointer"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-4">
          {/* 通知ボタン */}
          <button className="p-2 hover:bg-accent/10 rounded-full transition">
            <Bell className="w-6 h-6 text-foreground" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-accent/10 rounded-full transition flex items-center">
                <User className="w-6 h-6 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <ProtectedProfileLink href="/profile">
                プロフィール
              </ProtectedProfileLink>
              
              {/* テーマ切り替え */}
              <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    ライトモード
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    ダークモード
                  </>
                )}
              </DropdownMenuItem>

              {status === 'authenticated' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
