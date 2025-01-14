/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // ローカルでuseEffectが2回呼ばれる問題を回避するため
  images: {
    domains: ['localhost'], // 開発環境用
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-production-domain.com', // 本番環境用
      },
      {
        protocol: 'https',
        hostname: 'pin-images999.s3.us-east-1.amazonaws.com',
        pathname: '/**', // すべてのパスを許可
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development', // 開発環境でイメージ最適化をスキップ
  },
}

export default nextConfig;
