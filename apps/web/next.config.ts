import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@devlens/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
