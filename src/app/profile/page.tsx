import { Metadata } from 'next'
import { Share2, MoreHorizontal, Plus } from 'lucide-react'

// これって全部に記述すると有効になるのかな？
export const metadata: Metadata = {
  title: 'Profile - Pinterest Clone',
  description: 'User profile page',
}

// この型は別ファイルに分けることもできます
type Board = {
  id: number
  title: string
  pinCount: number
  imageUrl: string
}

export default function ProfilePage() {
  // 実際のアプリケーションでは、この部分はデータベースから取得します
  const boards: Board[] = [
    { id: 1, title: "DIYアイデア", pinCount: 128, imageUrl: "/api/placeholder/300/200" },
    { id: 2, title: "インテリア", pinCount: 85, imageUrl: "/api/placeholder/300/200" },
    { id: 3, title: "レシピ", pinCount: 246, imageUrl: "/api/placeholder/300/200" }
  ]

  return (
    <main className="pt-20 px-4 max-w-6xl mx-auto">
      {/* Profile Header */}
      {/* TODO: これをUserテーブルから取得するようにしたい */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
          <img
            src="/api/placeholder/128/128"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2">Work Yuuki</h1>
        <p className="text-gray-600 mb-2">@workyuukiitoi</p>
        
        {/* TODO: これも */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm text-gray-600">0 フォロワー • 5 フォロー中</span>
        </div>
        
        {/* TODO: コンポーネントに切り出したい。 */}
        <div className="flex items-center space-x-2">
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
            共有
            <Share2 className="w-4 h-4 inline ml-2" />
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center mb-8 border-b">
        <button className="px-4 py-2 font-semibold border-b-2 border-black">作成済み</button>
        <button className="px-4 py-2 text-gray-600">保存済み</button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Create New Board Button */}
        <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200">
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <span className="font-semibold text-gray-600">ボードを作成</span>
          </div>
        </div>
        
        {/* Existing Boards */}
        {boards.map(board => (
          <div key={board.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src={board.imageUrl}
              alt={board.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold">{board.title}</h3>
              <p className="text-sm">{board.pinCount} ピン</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
