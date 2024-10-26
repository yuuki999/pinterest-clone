import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../shadcn/ui/dialog'
import { Button } from '../shadcn/ui/button'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (data: { email: string; password: string }) => Promise<void>
  onSignup: (data: { email: string; password: string; birthdate: string }) => Promise<void>
}

export function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = React.useState(true)
  
  const switchMode = () => {
    setIsLoginMode(prev => !prev)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {/* Pinterest Logo */}
        <div className="flex flex-col items-center">
          <svg
            className="w-8 h-8 text-red-600 mb-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.937-.2-2.38.042-3.4.218-.937 1.407-5.965 1.407-5.965s-.36-.72-.36-1.78c0-1.665.967-2.91 2.17-2.91 1.024 0 1.518.77 1.518 1.688 0 1.03-.653 2.567-.992 3.992-.285 1.193.593 2.17 1.768 2.17 2.123 0 3.755-2.24 3.755-5.475 0-2.86-2.06-4.86-5.008-4.86-3.41 0-5.41 2.562-5.41 5.207 0 1.03.395 2.14.89 2.74.1.12.114.224.085.345-.093.38-.3 1.194-.34 1.36-.054.224-.18.27-.414.162-1.534-.722-2.49-2.99-2.49-4.82 0-3.934 2.866-7.57 8.258-7.57 4.342 0 7.726 3.09 7.726 7.225 0 4.323-2.726 7.778-6.513 7.778-1.273 0-2.47-.662-2.878-1.44l-.783 2.98c-.283 1.084-1.044 2.442-1.553 3.27A12 12 0 1 0 12 0z" />
          </svg>
        </div>
        <DialogTitle className="text-xl font-bold text-center">
          {isLoginMode ? 'Pinterestへようこそ！' : 'アカウントを作成'}
        </DialogTitle>
        <DialogDescription className="text-center text-sm text-gray-600">
          {isLoginMode 
            ? 'アカウントにログインして、あなたの興味のあるコンテンツを見つけましょう'
            : 'アイデア探しツール！ | Pinterest'}
        </DialogDescription>
        
        <div className="relative">
          {isLoginMode ? (
            <LoginForm onSubmit={onLogin} onSwitchMode={switchMode} />
          ) : (
            <SignupForm onSubmit={onSignup} onSwitchMode={switchMode} />
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Googleで続行</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.86 4.49c1.98 2.08 3.14 5.23 3.14 8.1 0 1.55-.04 2.94-.67 4.36-.69 1.54-1.87 2.77-3.4 3.52-.42.21-.85.39-1.29.54-.85.29-1.73.44-2.64.49H8c-2.02-.05-3.95-.53-5.48-1.63C1.03 18.79 0 17.14 0 15.35c0-1.84.91-3.42 2.34-4.36.48-.32 1.01-.56 1.57-.74.62-.2 1.27-.31 1.94-.35h.01c.04 0 .08 0 .12.01.34.02.46.17.51.23.09.1.14.27.14.43 0 .17-.05.33-.14.43-.07.08-.25.22-.53.22h-.13c-.51.03-1 .11-1.47.26-.43.13-.83.32-1.19.56-1.06.7-1.73 1.89-1.73 3.31 0 1.36.75 2.64 2.07 3.43 1.32.79 3.07 1.22 4.95 1.26h6c.81-.04 1.59-.17 2.34-.42.37-.12.73-.28 1.08-.45 1.29-.63 2.24-1.62 2.82-2.9.53-1.19.57-2.39.57-3.82 0-2.37-.94-5.11-2.63-6.93-.83-.89-1.77-1.54-2.78-1.92-1-.37-2.06-.49-3.14-.33h-.04c-.35.03-.49.18-.54.25-.1.1-.16.27-.16.44 0 .17.06.34.16.44.06.07.24.23.58.23h.01c.88-.13 1.76-.03 2.58.28.81.3 1.57.83 2.25 1.57z"/>
            </svg>
            <span>LINEで続行</span>
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            続行することで、Pinterestの
            <a href="#" className="text-gray-900 hover:underline">利用規約</a>
            に同意し、
            <a href="#" className="text-gray-900 hover:underline">プライバシーポリシー</a>
            を読んだことになります。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
