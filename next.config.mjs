/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Wajib untuk GitHub Pages
  images: {
    unoptimized: true, // Wajib diletakkan di tingkat atas, bukan di dalam 'experimental'
  },
  basePath: process.env.NODE_ENV === "production" ? "/tiktok-shop-dashboard" : "",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
