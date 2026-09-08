/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**', // Указываем путь к вашим фотографиям
      },
    ],
  },
};

export default nextConfig;