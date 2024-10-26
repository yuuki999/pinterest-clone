'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthModal } from './AuthModal'
import { DropdownMenuItem } from '../shadcn/ui/dropdown-menu'
import { useToast } from '@/app/hooks/shadcn/use-toast'

interface ProtectedProfileLinkProps {
  href: string
  children: React.ReactNode
}

export function ProtectedProfileLink({ href, children }: ProtectedProfileLinkProps) {
  const { status } = useSession()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { toast } = useToast()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()  // イベントの伝播を止める
    if (status === 'authenticated') {
      router.push(href)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  // TODO: 新規登録処理と、ログイン処理のAPIを分ける。
  const handleSubmit = async (data: { email: string; password: string }) => {
    console.log("first")
    try {  
      // ログイン処理
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })
  
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'ログインに失敗しました')
      }
  
      toast({
        title: "ログイン成功! 🎉",
        description: "ようこそ戻ってきました！",
        variant: "default", // "default" | "destructive"
        className: "bg-green-500 text-white", // カスタムスタイル
      })
  
      // モーダルを閉じる
      setIsAuthModalOpen(false)

      // 数秒後にページ遷移
      setTimeout(() => {
        router.push(href)
      }, 100)
  
    } catch (error) {
      console.error('Login error:', error)

      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "登録に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DropdownMenuItem onClick={handleClick}>
        {children}
      </DropdownMenuItem>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
