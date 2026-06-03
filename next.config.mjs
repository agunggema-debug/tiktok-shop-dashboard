/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Wajib untuk GitHub
  trailingSlash: true, // Wajib untuk GitHub Pages
  images: {
    unoptimized: true, // Wajib diletakkan di tingkat atas
  },

  basePath: process.env.NODE_ENV === "production" ? "/tiktok-shop-dashboard" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/tiktok-shop-dashboard/" : "",
};

export default nextConfig;
