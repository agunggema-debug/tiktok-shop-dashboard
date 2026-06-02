"use client";
import React, { useState, useEffect, useMemo } from "react";

// ==========================================
// MOCK DATA & SIMULATOR CONFIGURATION
// ==========================================

const INITIAL_PRODUCTS = [
  { id: "prod-1", name: "Premium Matte Lipstick TikTok Viral", category: "Beauty", price: 89000, sales: 1240, views: 45000, conv: "2.7%", stock: 450, status: "In Stock" },
  { id: "prod-2", name: "Oversized Unisex Streetwear Hoodie", category: "Fashion", price: 185000, sales: 850, views: 32000, conv: "2.6%", stock: 120, status: "Low Stock" },
  { id: "prod-3", name: "Wireless Ergonomic Neck Massager 3.0", category: "Electronics", price: 299000, sales: 512, views: 28000, conv: "1.8%", stock: 85, status: "Low Stock" },
  { id: "prod-4", name: "Stainless Steel Tumbler Aesthetic 1L", category: "Home Living", price: 125000, sales: 1950, views: 58000, conv: "3.3%", stock: 1200, status: "In Stock" },
  { id: "prod-5", name: "Super Food Acne Patch (isi 36)", category: "Beauty", price: 35000, sales: 3400, views: 98000, conv: "3.4%", stock: 15, status: "Critical Stock" },
];

const INITIAL_CREATORS = [
  { id: "cre-1", username: "clara_beauty_tips", followers: "1.2M", gmv: 158000000, orders: 1780, videoCount: 14, commission: "10%" },
  { id: "cre-2", username: "budi.streetwear", followers: "450K", gmv: 89000000, orders: 480, videoCount: 8, commission: "12%" },
  { id: "cre-3", username: "dinda_reviews", followers: "890K", gmv: 124000000, orders: 990, videoCount: 11, commission: "10%" },
  { id: "cre-4", username: "ahmad.techguide", followers: "320K", gmv: 153000000, orders: 512, videoCount: 5, commission: "15%" },
];

const INITIAL_LOGS = [
  { timestamp: "09:30:15", type: "info", service: "BullMQ", message: "Cron job [tiktok-sync-orders] dipicu secara berkala." },
  { timestamp: "09:30:16", type: "info", service: "TikTok-API", message: "Memulai jabat tangan OAuth & memvalidasi token akses." },
  { timestamp: "09:30:18", type: "success", service: "TikTok-API", message: "Berhasil menarik 250 transaksi baru dari endpoint /api/v1/shop/orders." },
  { timestamp: "09:30:19", type: "info", service: "PostgreSQL", message: "Menyisipkan 250 baris transaksi dengan kueri UPSERT (on conflict do update)." },
  { timestamp: "09:30:20", type: "info", service: "ClickHouse", message: "Data agregasi dialirkan ke tabel buffer analitik." },
  { timestamp: "09:30:21", type: "success", service: "Redis", message: "Invalidasi cache kunci [dashboard:analytics:7d] berhasil dilakukan." },
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dateRange, setDateRange] = useState("7d");

  // Architecture Simulation States (State sinkronisasi backend)
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [redisStatus, setRedisStatus] = useState({ hitRate: 84.5, keysCount: 1248, hitCount: 15200, missCount: 2800 });
  const [bullMqJobs, setBullMqJobs] = useState([
    { id: "job-1", name: "sync-daily-sales", status: "completed", duration: "4.2s", nextRun: "15 menit lagi" },
    { id: "job-2", name: "sync-creator-affiliates", status: "waiting", duration: "-", nextRun: "2 jam lagi" },
    { id: "job-3", name: "update-clickhouse-mv", status: "completed", duration: "1.8s", nextRun: "5 menit lagi" },
  ]);
  const [dbStats, setDbStats] = useState({ postgresRows: 85240, clickhouseRows: 2451080, redisCacheMemory: "14.2 MB" });

  // Dashboard Data State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [creators, setCreators] = useState(INITIAL_CREATORS);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Real-time toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Jalankan simulasi background task (BullMQ) secara berkala
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulasi BullMQ memicu cron job baru
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog = {
        timestamp: timeStr,
        type: "info",
        service: "BullMQ",
        message: "Cron job otomatis [update-clickhouse-mv] berjalan dengan lancar.",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      // Update data Redis secara fluktuatif
      setRedisStatus((prev) => ({
        ...prev,
        hitCount: prev.hitCount + Math.floor(Math.random() * 5) + 1,
        missCount: prev.missCount + (Math.random() > 0.85 ? 1 : 0),
        hitRate: parseFloat(((prev.hitCount / (prev.hitCount + prev.missCount)) * 100).toFixed(1)),
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Simulasi Trigger Sinkronisasi API TikTok Manual
  const handleManualSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    triggerToast("Memulai sinkronisasi data dari API TikTok via BullMQ...");

    const runSyncProcess = async () => {
      const steps = [
        { delay: 800, log: { type: "info", service: "BullMQ", message: "Manual trigger: Menambahkan job [manual-tiktok-sync] ke antrean." } },
        { delay: 1800, log: { type: "info", service: "TikTok-API", message: "Mengunduh data transaksi (Orders & Commissions) periode 7 hari terakhir." } },
        { delay: 2800, log: { type: "success", service: "PostgreSQL", message: 'Berhasil memperbarui data transaksional. 42 baris baru dimasukkan ke skema "tiktok_orders".' } },
        { delay: 3800, log: { type: "info", service: "ClickHouse", message: "Menghitung ulang materialized views untuk kueri analitik agregasi." } },
        { delay: 4500, log: { type: "success", service: "Redis", message: "Membersihkan cache kueri yang usang. Kecepatan memuat halaman dijamin tetap < 50ms." } },
      ];

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];
        setLogs((prev) => [{ timestamp: timeStr, ...step.log }, ...prev]);
      }

      // Update Database stats & Trigger data update simulasi
      setDbStats((prev) => ({
        postgresRows: prev.postgresRows + 42,
        clickhouseRows: prev.clickhouseRows + 512,
        redisCacheMemory: `${(parseFloat(prev.redisCacheMemory) + 0.1).toFixed(1)} MB`,
      }));

      // Simulasi penambahan GMV kreatif secara acak
      setCreators((prev) =>
        prev.map((c) => ({
          ...c,
          gmv: c.gmv + Math.floor(Math.random() * 5000000),
        })),
      );

      setIsSyncing(false);
      triggerToast("Sinkronisasi data TikTok Shop berhasil diselesaikan!");
    };

    runSyncProcess();
  };

  const handleClearCache = () => {
    setRedisStatus((prev) => ({
      ...prev,
      hitCount: 0,
      missCount: 0,
      hitRate: 100,
    }));
    triggerToast("Redis Cache berhasil dibersihkan! Request berikutnya akan langsung memukul database PostgreSQL / ClickHouse.");
  };

  // Filter Produk berdasarkan pencarian
  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-400 animate-bounce">
          <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-slate-950 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">T</div>
              <div>
                <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">TIKTOK SHOP</h1>
                <p className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">ANALYTICS ENGINE</p>
              </div>
            </div>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                activeTab === "dashboard" ? "bg-gradient-to-r from-slate-800 to-slate-800/50 text-white border-l-4 border-cyan-500" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
                />
              </svg>
              <span>Dashboard Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                activeTab === "products" ? "bg-gradient-to-r from-slate-800 to-slate-800/50 text-white border-l-4 border-cyan-500" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Performa Produk</span>
            </button>

            <button
              onClick={() => setActiveTab("creators")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                activeTab === "creators" ? "bg-gradient-to-r from-slate-800 to-slate-800/50 text-white border-l-4 border-cyan-500" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Afiliasi & Kreator</span>
            </button>

            <button
              onClick={() => setActiveTab("architecture")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                activeTab === "architecture" ? "bg-gradient-to-r from-slate-800 to-slate-800/50 text-white border-l-4 border-cyan-500" : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Developer Control Room</span>
            </button>
          </nav>
        </div>

        {/* Sync Trigger Sidebar Panel */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Auto-Sync Cron</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">AKTIF</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Sinkronisasi terjadwal berjalan setiap 15 menit menggunakan BullMQ.</p>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isSyncing ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-90 text-white shadow-md shadow-cyan-900/20"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              <span>{isSyncing ? "Menghubungkan..." : "Sinkronkan Sekarang"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* TOPBAR */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize text-slate-100 flex items-center gap-2">
              <span>{activeTab === "architecture" ? "Developer Control Room" : activeTab}</span>
              <span className="text-xs text-slate-500 font-normal">| Simulasi Data Produksi</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Picker Button */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {["today", "7d", "30d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all uppercase ${dateRange === range ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Quick Status Bar */}
            <div className="hidden lg:flex items-center gap-4 text-xs border-l border-slate-800 pl-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400">PostgreSQL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400">ClickHouse</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-slate-400">Redis (99% Hit)</span>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW CONTENTS */}
        <div className="p-6 space-y-6 flex-1 bg-slate-950/30">
          {/* TAB 1: DASHBOARD RINGKASAN */}
          {activeTab === "dashboard" && (
            <>
              {/* Metrik Utama Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* GMV Metric Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Gross Merchandise Value (GMV)</span>
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Rp 524.3M</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+18.4%</span>
                    <span className="text-slate-500 font-normal">vs minggu lalu</span>
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Jumlah Pesanan</span>
                    <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">3,724</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+12.1%</span>
                    <span className="text-slate-500 font-normal">vs minggu lalu</span>
                  </div>
                </div>

                {/* Conversion Rate Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Rasio Konversi</span>
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">2.82%</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+0.4%</span>
                    <span className="text-slate-500 font-normal">vs minggu lalu</span>
                  </div>
                </div>

                {/* Affiliate Revenue share Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Kontribusi Afiliasi</span>
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Rp 194.2M</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-500 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>-2.1%</span>
                    <span className="text-slate-500 font-normal">vs minggu lalu</span>
                  </div>
                </div>
              </div>

              {/* Grafik Tren Penjualan & Distribusi Trafik */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart Tren (SVG Custom Premium) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-base text-slate-200">Tren GMV & Order Harian</h4>
                      <p className="text-xs text-slate-500">Agregasi analitik berskala besar dari tabel Clickhouse.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-cyan-400"></span>
                        <span className="text-slate-400">GMV (Jutaan Rp)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-rose-500"></span>
                        <span className="text-slate-400">Target Tren</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="h-64 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeDasharray="3,3" />

                      {/* Trend Line (Cyan - GMV) */}
                      <path d="M 10 160 Q 90 120 170 140 T 250 80 T 330 110 T 410 40 T 490 30" fill="none" stroke="url(#cyan-glow)" strokeWidth="4" />

                      {/* Trend Line (Rose - Target) */}
                      <path d="M 10 170 Q 90 140 170 130 T 250 110 T 330 90 T 410 70 T 490 60" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />

                      {/* Area Under Curve for premium aesthetic */}
                      <path d="M 10 160 Q 90 120 170 140 T 250 80 T 330 110 T 410 40 T 490 30 L 490 200 L 10 200 Z" fill="url(#cyan-gradient)" opacity="0.1" />

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="cyan-glow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="cyan-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* X-Axis labels */}
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                      <span>Sen</span>
                      <span>Sel</span>
                      <span>Rab</span>
                      <span>Kam</span>
                      <span>Jum</span>
                      <span>Sab</span>
                      <span>Min</span>
                    </div>
                  </div>
                </div>

                {/* Traffic Source Distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="font-bold text-base text-slate-200 mb-2">Sumber Penjualan</h4>
                  <p className="text-xs text-slate-500 mb-6">Distribusi pemesanan berdasarkan tipe penempatan TikTok.</p>

                  <div className="space-y-4">
                    {/* Item 1: TikTok Live */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          TikTok Live Streaming
                        </span>
                        <span className="text-slate-400 font-bold">Rp 235M (45%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>

                    {/* Item 2: TikTok Video/Shorts */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                          Video Belanja (Shoppable)
                        </span>
                        <span className="text-slate-400 font-bold">Rp 157M (30%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>

                    {/* Item 3: Creator Affiliate */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                          Showcase Toko / Afiliasi
                        </span>
                        <span className="text-slate-400 font-bold">Rp 104M (20%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>

                    {/* Item 4: Direct Search */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          Pencarian Langsung
                        </span>
                        <span className="text-slate-400 font-bold">Rp 26M (5%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "5%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
                    <svg className="w-5 h-5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      <strong>Tip Dev:</strong> Data visualisasi ini didukung oleh cache Redis di atas cluster PostgreSQL & Clickhouse yang mengagregasikan log secara instan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Log Terbaru dari Antrean BullMQ & TikTok API */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="font-bold text-base text-slate-200">Arus Data Sinkronisasi Real-time</h4>
                    <p className="text-xs text-slate-500">Log sinkronisasi terpadu dari TikTok Shop API ke PostgreSQL.</p>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-xs font-semibold rounded-xl text-slate-300 flex items-center gap-1.5 border border-slate-700"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span>Trigger Simulasi Job</span>
                  </button>
                </div>

                <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950">
                  <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-4">
                    <span className="w-16">WAKTU</span>
                    <span className="w-24">LAYANAN</span>
                    <span>PESAN SINKRONISASI / SISTEM</span>
                  </div>
                  <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto font-mono text-xs">
                    {logs.map((log, index) => (
                      <div key={index} className="p-3 hover:bg-slate-900/30 transition-all flex items-start gap-4">
                        <span className="text-slate-500 w-16 text-[11px] shrink-0">{log.timestamp}</span>
                        <span
                          className={`w-24 font-bold shrink-0 text-[11px] uppercase tracking-wider ${
                            log.service === "BullMQ" ? "text-amber-400" : log.service === "TikTok-API" ? "text-rose-400" : log.service === "Redis" ? "text-cyan-400" : "text-purple-400"
                          }`}
                        >
                          {log.service}
                        </span>
                        <div className="flex-1 text-slate-300">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`}></span>
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PERFORMA PRODUK */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari SKU atau nama produk TikTok..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-slate-400 font-semibold mr-2 shrink-0">Filter Kategori:</span>
                  <select className="w-full md:w-48 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500">
                    <option value="all">Semua Kategori</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="fashion">Streetwear & Apparel</option>
                    <option value="electronics">Electronics</option>
                    <option value="homeliving">Home Aesthetic</option>
                  </select>
                </div>
              </div>

              {/* Table List SKU */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h4 className="font-bold text-base text-slate-200">SKU TikTok Shop Leaderboard</h4>
                  <p className="text-xs text-slate-500">Diurutkan berdasarkan total penjualan tertinggi dari sinkronisasi database.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-4">Detail Produk</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4 text-right">Harga Unit</th>
                        <th className="p-4 text-right">Penjualan (Pcs)</th>
                        <th className="p-4 text-right">Impressions (Views)</th>
                        <th className="p-4 text-center">Conv. Rate</th>
                        <th className="p-4 text-center">Status Stok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-medium text-white max-w-xs truncate">{p.name}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-400 font-medium">{p.category}</span>
                          </td>
                          <td className="p-4 text-right font-semibold text-slate-200">Rp {p.price.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-cyan-400">{p.sales.toLocaleString()}</td>
                          <td className="p-4 text-right text-slate-400">{p.views.toLocaleString()}</td>
                          <td className="p-4 text-center text-rose-400 font-bold">{p.conv}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === "In Stock" ? "bg-emerald-500/10 text-emerald-400" : p.status === "Low Stock" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {p.status} ({p.stock} pcs)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AFILIASI & KREATOR */}
          {activeTab === "creators" && (
            <div className="space-y-6">
              {/* Creator Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">Total Kreator Aktif</h5>
                  <h3 className="text-3xl font-extrabold text-cyan-400">346 Kreator</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Mengunggah video tautan belanja dalam 30 hari terakhir.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">Rasio Komisi Rata-Rata</h5>
                  <h3 className="text-3xl font-extrabold text-indigo-400">11.4 %</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Mendorong ROI yang sehat dari kampanye berbayar.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">Total Video Terunggah</h5>
                  <h3 className="text-3xl font-extrabold text-rose-400">2,410 Video</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Video organik dengan keranjang kuning aktif.</p>
                </div>
              </div>

              {/* Creators Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h4 className="font-bold text-base text-slate-200">Pembuat Konten Berkinerja Terbaik</h4>
                  <p className="text-xs text-slate-500">Menganalisis hasil GMV dari setiap kolaborasi kreator afiliasi TikTok.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-4">Username Kreator</th>
                        <th className="p-4">Pengikut (Followers)</th>
                        <th className="p-4 text-right">GMV Terdistribusi</th>
                        <th className="p-4 text-right">Total Pesanan</th>
                        <th className="p-4 text-center">Video Terpublikasi</th>
                        <th className="p-4 text-center">Biaya Komisi</th>
                        <th className="p-4 text-center">Aksi Kolaborasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {creators.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 border border-slate-700">@</span>
                            <span>{c.username}</span>
                          </td>
                          <td className="p-4 text-slate-400 font-medium">{c.followers}</td>
                          <td className="p-4 text-right font-extrabold text-emerald-400">Rp {c.gmv.toLocaleString()}</td>
                          <td className="p-4 text-right text-slate-300 font-medium">{c.orders.toLocaleString()}</td>
                          <td className="p-4 text-center text-cyan-400 font-bold">{c.videoCount}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">{c.commission}</span>
                          </td>
                          <td className="p-4 text-center">
                            <button className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 rounded-lg border border-slate-700">Kirim Brief</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER CONTROL ROOM & SYSTEM ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div className="space-y-6">
              {/* Architecture Alert / Banner */}
              <div className="bg-slate-900 border-l-4 border-amber-500 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-200">Skema Pengujian Arsitektur Lokal (Mock Engine)</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Halaman ini mensimulasikan lingkungan produksi backend Anda. Tim Frontend dapat langsung menguji endpoint data statis ini seakan-akan terhubung ke PostgreSQL, Redis, dan scheduler BullMQ yang berjalan di server nyata.
                  </p>
                </div>
              </div>

              {/* Server & DB Stats Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Postgres Simulation */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h5 className="text-sm font-bold text-slate-200">PostgreSQL (Data Inti)</h5>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono">DB-1</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Baris Transaksi:</span>
                      <span className="font-mono text-slate-300 font-bold">{dbStats.postgresRows.toLocaleString()} baris</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Ukuran Penyimpanan:</span>
                      <span className="font-mono text-slate-300 font-bold">428 MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Status Replikasi:</span>
                      <span className="text-emerald-400 font-bold text-[10px] uppercase">Sinkron (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Clickhouse / BigQuery Simulation */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h5 className="text-sm font-bold text-slate-200">ClickHouse (OLAP Engine)</h5>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono">OLAP-1</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Log Agregasi:</span>
                      <span className="font-mono text-slate-300 font-bold">{dbStats.clickhouseRows.toLocaleString()} baris</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Rasio Kompresi Data:</span>
                      <span className="font-mono text-slate-300 font-bold">4.2x (Sangat Optimal)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Waktu Kueri Rata-rata:</span>
                      <span className="text-cyan-400 font-mono font-bold">12ms</span>
                    </div>
                  </div>
                </div>

                {/* Redis Cache Simulation */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <h5 className="text-sm font-bold text-slate-200">Redis (Caching Layer)</h5>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono">CACHE-1</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Rasio Cache Hit:</span>
                      <span className="font-mono text-cyan-400 font-bold">{redisStatus.hitRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Memori Terpakai:</span>
                      <span className="font-mono text-slate-300 font-bold">{dbStats.redisCacheMemory}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Kunci (Keys):</span>
                      <span className="font-mono text-slate-300 font-bold">{redisStatus.keysCount} Kunci</span>
                    </div>
                  </div>
                  <button onClick={handleClearCache} className="w-full mt-4 py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-all text-center">
                    Bersihkan Redis Cache
                  </button>
                </div>
              </div>

              {/* Task Scheduler (BullMQ Simulation Panel) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="font-bold text-base text-slate-200">Daftar Task Queue - BullMQ Simulator</h4>
                    <p className="text-xs text-slate-500">Memantau status cron jobs terjadwal yang bertugas menarik data dari API TikTok.</p>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Jalankan Manual Task</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bullMqJobs.map((job) => (
                    <div key={job.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">ID: {job.id}</span>
                        <h6 className="text-xs font-bold text-slate-200 font-mono mt-0.5">{job.name}</h6>
                        <span className="text-[10px] text-slate-400 mt-2 block">
                          Eksekusi selanjutnya: <strong>{job.nextRun}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${job.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{job.status}</span>
                        <span className="block text-[10px] text-slate-500 mt-1">Durasi: {job.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="h-12 border-t border-slate-800 bg-slate-900/40 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>&copy; {new Date().getFullYear()} TikTok Shop Analytics Framework.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Dokumentasi API</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Dukungan Teknis</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
