'use client'
import { Share2 } from 'lucide-react'

export function ShareButton() {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'My Pinterest Profile',
        url: window.location.href,
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
    >
      共有
      <Share2 className="w-4 h-4 inline ml-2" />
    </button>
  )
}
