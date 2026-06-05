/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Wajib untuk menghasilkan folder statis 'out/'
  trailingSlash: true, // Memastikan setiap halaman memiliki folder dan file index.html sendiri (mencegah 404 saat refresh)
  images: {
    unoptimized: true, // Menonaktifkan optimasi gambar dinamis karena server statis GitHub tidak mendukungnya
  },
  // Konfigurasi basePath tanpa tanda miring ganda untuk assetPrefix
  basePath: process.env.NODE_ENV === "production" ? "/tiktok-shop-dashboard" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/tiktok-shop-dashboard" : "",
};

export default nextConfig;
