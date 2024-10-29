/** @type {import('next').NextConfig} */
const nextConfig = {
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
      }
    ],
  },
}

export default nextConfig;
