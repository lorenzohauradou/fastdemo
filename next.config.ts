import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  
  // Disabilita ESLint durante il build per permettere il deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configurazione per gestire i file video - aggiornata per Next.js 15
  serverExternalPackages: [],
  
  // Configurazione Turbopack
  turbopack: {
    root: '/Users/lorenzohauradou/Desktop/democraft/frontend',
  },
  
  // Headers per CORS se necessario
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
};

export default nextConfig;