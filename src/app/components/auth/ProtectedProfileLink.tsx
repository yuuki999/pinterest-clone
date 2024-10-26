'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthModal } from './AuthModal'
import { DropdownMenuItem } from '../shadcn/ui/dropdown-menu'
import { ToastMessage } from '../ui/ToastMessage'

export function ProtectedProfileLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

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
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
  
      if (result?.error) {
        throw new Error(result.error)
      }
  
      ToastMessage.success({
        title: "ログイン成功! 🎉",
        description: "ようこそ戻ってきました！",
      });
  
      setIsAuthModalOpen(false)
      setTimeout(() => {
        router.push(href)
        router.refresh()
      }, 100)
  
    } catch (error) {
      console.error('Login error:', error)
  
      ToastMessage.error({
        title: "ログイン成功! 🎉",
        description: error instanceof Error ? error.message : "ログインに失敗しました",
      });
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

      ToastMessage.success({
        title: "登録成功! 🎉",
        description: "Pinterestへようこそ！",
      });

      setIsAuthModalOpen(false)
      setTimeout(() => {
        router.push(href)
      }, 100)

    } catch (error) {
      console.error('Signup error:', error)

      ToastMessage.error({
        title: "登録エラー",
        description: error instanceof Error ? error.message : "新規登録に失敗しました",
      });
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
