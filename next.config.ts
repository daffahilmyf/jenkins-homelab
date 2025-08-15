import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties:
      process.env.NODE_ENV === 'production'
        ? {
            properties: ['^data-testid'],
          }
        : false,
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
};

export default nextConfig;
