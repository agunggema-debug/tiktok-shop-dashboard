/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Wajib untuk menghasilkan folder statis 'out/'
  trailingSlash: true, // Memastikan setiap halaman memiliki folder dan file index.html sendiri (mencegah 404 saat refresh)
  images: {
    unoptimized: true, // Menonaktifkan optimasi gambar dinamis karena server statis GitHub tidak mendukungnya
  },

  // SOLUSI UTAMA 404:
  // Saat menggunakan output: "export", hindari penggunaan basePath di next.config karena akan membuat struktur folder 'out/nama-repo/index.html'.
  // Kita biarkan kosong di sini, dan biarkan GitHub Actions yang menangani penyelarasan path publikasi.
  basePath: "",
  assetPrefix: "",
};

export default nextConfig;
