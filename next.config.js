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
    experimental: {
      serverActions: true,
    },
    // Add CORS headers for API requests
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig