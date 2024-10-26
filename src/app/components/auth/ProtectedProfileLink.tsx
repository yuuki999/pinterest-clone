'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthModal } from './AuthModal'
import { DropdownMenuItem } from '../shadcn/ui/dropdown-menu'
import { useToast } from '@/app/hooks/shadcn/use-toast'

export function ProtectedProfileLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { toast } = useToast()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (status === 'authenticated') {
      router.push(href)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleLogin = async (data: { email: string; password: string }) => {
    try {  
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
  
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'ログインに失敗しました')
      }
  
      toast({
        title: "ログイン成功! 🎉",
        description: "ようこそ戻ってきました！",
        variant: "default",
        className: "bg-green-500 text-white",
      })
  
      setIsAuthModalOpen(false)
      setTimeout(() => {
        router.push(href)
      }, 100)
  
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "ログインエラー",
        description: error instanceof Error ? error.message : "ログインに失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleSignup = async (data: { email: string; password: string; birthdate: string }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || '新規登録に失敗しました')
      }

      toast({
        title: "登録成功! 🎉",
        description: "Pinterestへようこそ！",
        variant: "default",
        className: "bg-green-500 text-white",
      })

      setIsAuthModalOpen(false)
      setTimeout(() => {
        router.push(href)
      }, 100)

    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "登録エラー",
        description: error instanceof Error ? error.message : "新規登録に失敗しました",
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
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </>
  )
}
