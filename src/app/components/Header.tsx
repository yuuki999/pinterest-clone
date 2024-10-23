import React from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-red-600 font-bold text-2xl">
            Pinterest
          </Link>
          <Link href="/" className="font-semibold">
            ホーム
          </Link>
          <Link href="/create" className="font-semibold">
            作成
          </Link>
        </div>

        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <input
              type="search"
              placeholder="検索"
              className="w-full bg-gray-100 rounded-full py-3 px-4 pl-10 outline-none focus:shadow-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6" />
          </button>
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
