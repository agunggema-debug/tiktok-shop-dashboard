## 📱 TikTok Shop Analytics Dashboard

Dasbor analitik berbasis data tiruan (mock data) TikTok Shop yang dirancang untuk mempercepat proses pengembangan aplikasi frontend tanpa hambatan verifikasi akun developer TikTok Shop API.

Situs ini telah dioptimalkan untuk ekspor statis dan dideploy secara otomatis menggunakan GitHub Actions ke GitHub Pages.

🔗 Demo Live: https://agunggema-debug.github.io/tiktok-shop-dashboard/

## 🏗️ Arsitektur Sistem Produksi (Target)

Dasbor ini disiapkan sebagai visualisasi awal dari sistem produksi skala penuh dengan cetak biru arsitektur berikut:

1. Frontend: Next.js (React), Tailwind CSS, Shadcn UI, Tremor (Komponen Chart), dan React Query untuk sinkronisasi state.

2. Backend: Node.js (NestJS/Express) atau Python (FastAPI untuk agregasi data intensif).

3. Database & Cache:

    * PostgreSQL: Untuk menyimpan data transaksional terstruktur (pesanan, pengguna, detail log).

    * ClickHouse / BigQuery: Untuk kueri analitik dan agregasi data dalam skala besar (jutaan log per detik).

    * Redis: Sebagai lapisan penyimpanan cache cepat (query caching) untuk memastikan dasbor memuat data kurang dari 50 milidetik.

4. Task Scheduler: BullMQ / Celery berbasis Redis untuk mengelola cron jobs penarikan berkala dari endpoint TikTok Shop API.

## 📂 Struktur Proyek Terstandarisasi

Proyek ini dirancang agar mudah dikembangkan ke dalam struktur monorepo siap produksi:
```
tiktok-shop-analytics/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD otomatisasi build & deploy ke GitHub Pages
├── apps/
│   ├── frontend/                 # Kode sumber dasbor Next.js (Repisitori ini)
│   │   ├── src/
│   │   │   ├── app/              # Halaman, tata letak, dan gaya global (App Router)
│   │   │   ├── components/       # Komponen UI (Shadcn UI, panel custom)
│   │   │   └── hooks/            # Hooks logika & React Query
│   │   └── next.config.mjs       # Konfigurasi ekspor statis & optimasi rute
│   └── backend/                  # Kerangka NestJS & BullMQ Workers (Target pengembangan)
└── docker/
    └── docker-compose.yml        # Infrastruktur lokal PostgreSQL, Redis, & ClickHouse
```

## 🚀 Panduan Pengembangan Lokal

Untuk menjalankan dasbor analitik ini di komputer lokal Anda:

1. Prasyarat

Pastikan komputer Anda telah terinstal Node.js (v18 atau v20+) dan npm.

2. Kloning & Instalasi
```
# Kloning repositori ini
git clone [https://github.com/agunggema-debug/tiktok-shop-dashboard.git](https://github.com/agunggema-debug/tiktok-shop-dashboard.git)

# Masuk ke direktori proyek
cd tiktok-shop-dashboard

# Instal semua dependensi
npm install --legacy-peer-deps
```

3. Jalankan Server Pengembangan
```
npm run dev
```

Buka browser Anda dan akses halaman di http://localhost:3000.

## 🤖 Siklus Deployment Otomatis (CI/CD)

Setiap kali Anda mengirimkan pembaruan kode ke cabang utama (main), GitHub Actions akan secara otomatis menjalankan alur kerja di .github/workflows/deploy.yml:

1. Memeriksa integritas kode.

2. Memasang dependensi menggunakan Node.js versi 24.

3. Melakukan ekspor build statis via npm run build yang menghasilkan direktori ./out.

4. Mengunggah artefak dan mempublikasikannya langsung ke GitHub Pages Anda.

## Konfigurasi Penting Ekspor Statis

Agar rute statis dapat dimuat secara mulus tanpa error 404, berkas next.config.mjs dikonfigurasi dengan:

* output: "export" untuk menghasilkan file HTML statis.

* trailingSlash: true untuk memastikan folder rute terindeks secara fisik oleh GitHub Pages server.

* .nojekyll di folder public/ untuk menonaktifkan Jekyll parser agar berkas build internal di folder _next tidak diblokir.

## 🛠️ Kontrol & Simulasi Arsitektur

Dasbor ini dilengkapi dengan Developer Control Room yang mensimulasikan fungsionalitas backend nyata secara interaktif:

* Trigger Manual Sync: Mensimulasikan alur kerja BullMQ mengambil data dari TikTok API dan memasukkannya ke PostgreSQL & ClickHouse.

* Monitor Antrean & DB: Melihat indikator baris tabel Clickhouse dan PostgreSQL bertambah secara real-time.

* Manajemen Cache: Menguji pembersihan (invalidation) data cache pada Redis secara interaktif.
