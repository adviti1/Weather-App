/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Reduced strictness for migration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;