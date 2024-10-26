import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/app/libs/prisma'

export async function POST(req: Request) {
  try {
    const { email, password, birthdate } = await req.json()

    if (!email || !password || !birthdate) {
      return NextResponse.json(
        { error: 'メールアドレス、パスワード、生年月日は必須です' },
        { status: 400 }
      )
    }

    // 生年月日の妥当性チェック
    const birthdateObj = new Date(birthdate)
    const today = new Date()
    const age = today.getFullYear() - birthdateObj.getFullYear()
    
    // 13歳未満のユーザーは登録できない
    if (age < 13) {
      return NextResponse.json(
        { error: '13歳未満の方は登録できません' },
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
        birthdate: birthdateObj,
      }
    })

    return NextResponse.json({ 
      message: 'ユーザーを作成しました',
      user: {
        id: user.id,
        email: user.email,
        birthdate: user.birthdate
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
