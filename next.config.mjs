/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Wajib: Menginstruksikan Next.js untuk melakukan static export (out/)
  images: {
    unoptimized: true, // Wajib: GitHub Pages tidak mendukung optimasi gambar dinamis server Next.js
  },
  // Ganti '/nama-repo-anda' dengan nama repositori GitHub Anda nanti (misal: '/tiktok-shop-dashboard')
  // Kosongkan atau hapus baris basePath di bawah jika Anda menggunakan domain kustom atau repository user utama (username.github.io)
  basePath: process.env.NODE_ENV === 'production' ? '/tiktok-shop-dashboard' : '',
};

module.exports = nextConfig;