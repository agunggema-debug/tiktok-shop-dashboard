/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Wajib untuk menghasilkan folder statis 'out/'
  trailingSlash: true, // Memastikan setiap halaman memiliki folder dan file index.html sendiri (mencegah 404 saat refresh)
  images: {
    unoptimized: true, // Menonaktifkan optimasi gambar dinamis karena server statis GitHub tidak mendukungnya
  },

  // SOLUSI ABSOLUT 404 DI GITHUB PAGES:
  // Kita harus menggunakan basePath agar semua rute file JavaScript dan CSS statis mengarah ke '/tiktok-shop-dashboard/_next/...'
  // Namun, kita tidak boleh menggunakan assetPrefix secara bersamaan untuk menghindari duplikasi jalur ganda.
  basePath: "/tiktok-shop-dashboard",
};

export default nextConfig;
