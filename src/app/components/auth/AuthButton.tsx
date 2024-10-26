'use client'

import React from 'react'
import { Button } from '@/app/components/ui/button'
import { AuthModal } from './AuthModal'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async (data: { 
    email: string; 
    password: string; 
    birthDate?: string 
  }) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // 成功時の処理
      router.refresh()
      setIsModalOpen(false)
    } catch (error) {
      throw error
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        ログイン
      </Button>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
      />
    </>
  )
}
