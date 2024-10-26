'use client'

import { useState } from 'react'

export function BoardTabs() {
  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created')

  return (
    <div className="flex justify-center mb-8 border-b">
      <button
        onClick={() => setActiveTab('created')}
        className={`px-4 py-2 ${
          activeTab === 'created'
            ? 'font-semibold border-b-2 border-black'
            : 'text-gray-600'
        }`}
      >
        作成済み
      </button>
      <button
        onClick={() => setActiveTab('saved')}
        className={`px-4 py-2 ${
          activeTab === 'saved'
            ? 'font-semibold border-b-2 border-black'
            : 'text-gray-600'
        }`}
      >
        保存済み
      </button>
    </div>
  )
}
