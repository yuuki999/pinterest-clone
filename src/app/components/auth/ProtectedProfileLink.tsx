'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthModal } from './AuthModal'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'

interface ProtectedProfileLinkProps {
  href: string
  children: React.ReactNode
}

export function ProtectedProfileLink({ href, children }: ProtectedProfileLinkProps) {
  const { status } = useSession()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()  // イベントの伝播を止める
    if (status === 'authenticated') {
      router.push(href)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      // TODO: ログイン処理 あとで実装する。
      // await onSubmit(data)
      
      // ログイン成功後
      setIsAuthModalOpen(false)  // モーダルを明示的に閉じる
      
      // 少し遅延させてからリダイレクト
      setTimeout(() => {
        router.push(href)
      }, 100)
    } catch (error) {
      console.error('Login error:', error)
      // エラーハンドリング
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
