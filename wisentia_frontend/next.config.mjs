/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'localhost', 
      'gateway.pinata.cloud', 
      'ipfs.io', 
      'cloudflare-ipfs.com', 
      'ipfs.infura.io',
      'nftstorage.link'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 3600,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Transpile MUI packages
  transpilePackages: ['@mui/material', '@emotion/react', '@emotion/styled'],
  // Optimize build speed with persistent caching
  experimental: {
    optimizeCss: true
  },
  // Disable source maps in production for smaller outputs
  productionBrowserSourceMaps: false,
  // Static file asset prefix
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // API route configuration
  async rewrites() {
    return [
      // Use our API route for media files
      {
        source: '/media/:path*',
        destination: '/api/media/:path*' // Use our API route instead of direct proxy
      },
      // Use our API route for IPFS content
      {
        source: '/ipfs/:cid*',
        destination: '/api/ipfs/resolve?uri=ipfs://:cid*' // Use our gateway resolver
      },
      // Legacy direct backend proxy for backwards compatibility
      {
        source: '/backend-media/:path*',
        destination: 'http://localhost:8000/media/:path*'
      }
    ];
  },
  webpack: (config, { isServer }) => {
    // Only run this optimization in production
    if (!isServer && process.env.NODE_ENV === 'production') {
      // Optimize bundle size
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Optimize MUI bundle
        mui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'mui',
          priority: 10,
          chunks: 'all',
        },
      };
    }
    return config;
  },
  // Page generation timeout
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
