import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/app/libs/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      )
    }

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // パスワードの照合
    const isPasswordValid = await compare(password, user.hashedPassword)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // セキュリティのため、パスワードハッシュは返さない
    return NextResponse.json({
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        email: user.email,
        birthdate: user.birthdate
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
