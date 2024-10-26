import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
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

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 12)

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
      }
    })

    return NextResponse.json({ 
      message: 'ユーザーを作成しました',
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '新規登録に失敗しました' },
      { status: 500 }
    )
  }
}
