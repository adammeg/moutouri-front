/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        // Backend server on Render
        {
          protocol: 'https',
          hostname: 'moutouri-back.onrender.com',
          pathname: '/uploads/**',
        },
        // Local backend server
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/**',
        },
        // Cloudinary images
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/dzamzt9og/**',
        },
      ],
      domains: ['localhost', 'moutouri-back.onrender.com', 'res.cloudinary.com'],
      unoptimized: true,
    },
    reactStrictMode: true,
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:3000', 'moutouri.tn']
      },
    },
    // Add CORS headers for API requests
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig