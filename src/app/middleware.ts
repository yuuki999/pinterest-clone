import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  if (!isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/profile', '/profile/:path*']
}
