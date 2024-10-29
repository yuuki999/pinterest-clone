import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

// TODO: これのキャッチアップを使用。
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        const isValid = await compare(credentials.password, user.hashedPassword)

        if (!isValid) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        return user
      }
    })
  ],
  pages: {
    signIn: '/',
    signOut: '/',  // ログアウトページも追加
    error: '/auth/error', // エラーページを追加
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        // 最新のユーザー情報を取得
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        });

        if (user) {
          session.user = {
            ...session.user,
            ...user,
            id: token.sub
          }
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // セッション更新時の処理
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            name: true,
            email: true,
            image: true,
          }
        });
        
        if (updatedUser) {
          token = {
            ...token,
            name: updatedUser.name,
            email: updatedUser.email,
            picture: updatedUser.image,
          }
        }
      }
      
      if (user) {
        token.sub = user.id
      }
      if (session) {
        token.provider = session.provider
      }
      return token
    }
  },
  events: {
    async signOut({ session, token }) {
      // ログアウト時の処理をここに追加できます
      try {
        await prisma.session.deleteMany({
          where: {
            userId: token.sub
          }
        })
      } catch (error) {
        console.error('Logout cleanup error:', error)
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
