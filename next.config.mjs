/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'document.syncfusion.com',
      },
    ],
  },
  allowedDevOrigins: ['192.168.0.209'],
};

export default nextConfig;