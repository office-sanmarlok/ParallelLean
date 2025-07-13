/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Supabase Auth callback URL設定
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/login',
        permanent: false,
      },
    ]
  },

  // 画像ドメインの許可
  images: {
    domains: ['localhost'],
  },

  // 環境変数の型チェック
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // TypeScript厳密モード
  typescript: {
    // ビルド時のエラーを無視しない
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    // ビルド時のエラーを無視しない
    ignoreDuringBuilds: false,
  },

  // Webpack設定
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドでcanvasモジュールを外部化
      config.externals = [...(config.externals || []), 'canvas', 'jsdom']
    }
    return config
  },
}

module.exports = nextConfig
