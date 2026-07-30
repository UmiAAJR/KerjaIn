import React, { useEffect, useState } from 'react';
import { workerApi } from '../../services/api'; // atau '../../services/workerService'
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  History,
  Zap,
  ClipboardCheck,
  Clock,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Helper format rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number || 0);
  };


 useEffect(() => {
  const fetchDashboard = async () => {
    // 1. Ambil workerId dari state/context/storage terlebih dahulu
    
    // 2. Oper workerId ke service
    const d = await workerApi.getDashboard();
    setData(d)
    setLoading(false)
  };

  fetchDashboard();
}, []);


  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!data) {
    return (
      <MobileLayout>
        <div className="p-5 text-center text-red-500">
          Gagal memuat data pekerja. Silakan periksa koneksi atau akun Anda.
        </div>
      </MobileLayout>
    );
  }

  // Destructuring aman dari data workerService
  const { name, income, order, nextJob, photo, rating } = data;

  return (
    <MobileLayout
      topNavProps={{
        variant: "location",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="px-5 pt-5 pb-8 space-y-6 relative">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-black text-primary-600 font-heading tracking-tight leading-tight">
            Halo, {data.name} !
          </h2>
          <h3 className="text-sm text-gray-500">
            Siap untuk menyelesaikan pekerjaan hari ini?
          </h3>
        </div>

        {/* Box Saldo dan Riwayat */}
        <div className="relative w-full max-w-sm rounded-2xl bg-[#0e7490] p-5 text-white shadow-md">
          <div className="relative z-10">
            <p className="text-md font-medium text-cyan-100/80">Saldo Anda</p>
            <h2 className="mt-2 mb-4 text-3xl font-bold tracking-tight leading-tight text-white">
              {formatRupiah(data?.walletBalance)}
            </h2>

            {/* Tombol Tarik Dana & Riwayat */}
            <div className="flex gap-3">
              <Link 
                to="/worker/wallet" 
                className="flex-1 rounded-xl bg-[#dbeefd] py-3 text-center font-semibold text-[#0e7490] transition hover:bg-white active:scale-[0.98]"
              >
                Tarik Dana
              </Link>

              <button
                onClick={() => navigate('/worker/wallet')}
                className="flex items-center justify-center rounded-xl border border-white/40 p-3 text-white transition hover:bg-white/10 active:scale-95"
                aria-label="Riwayat Transaksi"
              >
                <History className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* RINGKASAN PENDAPATAN */}
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-[#F3F6FD] p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              RINGKASAN PENDAPATAN
            </span>
            <TrendingUp className="h-5 w-5 text-[#005B66]" />
          </div>

          {/* Grid 3 Kolom */}
          <div className="grid grid-cols-3 divide-x divide-slate-300">
            {/* Hari Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Hari Ini</p>
              <div className="mt-1 text-center">
                <p className="text-sm font-extrabold leading-tight text-gray-900">
                  {formatRupiah(data?.todayIncome)}
                </p>
              </div>
            </div>

            {/* Minggu Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Minggu Ini</p>
              <div className="mt-1 text-center">
                <p className="text-sm font-extrabold leading-tight text-gray-900">
                  {formatRupiah(data?.weeklyIncome)}
                </p>
              </div>
            </div>

            {/* Bulan Ini */}
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-xs font-medium text-slate-600">Bulan Ini</p>
              <div className="mt-1 text-center">
                <p className="text-sm font-extrabold leading-tight text-[#005B66]">
                  {formatRupiah(data?.monthlyIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Container Scroll Horizontal Stats */}
        <div className="no-scrollbar overflow-x-auto flex items-center gap-3.5">
          {/* Order Aktif */}
          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#f9e8d1] border border-[#fbcd87] p-4 items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fea619] text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="pl-3">
              <span className="text-xl font-bold leading-tight">{data?.activeOrder || 0}</span>
              <p className="text-xs font-medium text-gray-700">Order Aktif</p>
            </div>
          </div>

          {/* Pending Order */}
          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#e0f2fe] border border-[#bae6fd] p-4 items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div className="pl-3">
              <span className="text-xl font-bold leading-tight">{data?.pendingOrder || 0}</span>
              <p className="text-xs font-medium text-gray-700">Menunggu</p>
            </div>
          </div>

          {/* Order Selesai */}
          <div className="flex flex-row shrink-0 w-48 rounded-2xl bg-[#dcfce7] border border-[#86efac] p-4 items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="pl-3">
              <span className="text-xl font-bold leading-tight">{data?.completeOrder || 0}</span>
              <p className="text-xs font-medium text-gray-700">Selesai</p>
            </div>
          </div>
        </div>

        {/* PEKERJAAN SELANJUTNYA */}
        {nextJob ? (
          <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="absolute top-0 right-0 rounded-bl-xl bg-[#F9A825] px-3 py-1">
              <span className="text-xs font-bold text-[#5D3A00]">
                Mulai {data.schedule || 'Segera'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <img
                src={photo || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60"}
                alt={data.clientName || "Client"}
                className="h-16 w-16 rounded-xl object-cover"
              />

              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-[#005B66]">
                  {data.service || 'Layanan Pekerjaan'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {data.clientName || 'Nama Client'}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
                  <span>{rating || 5.0} (Top Client)</span>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200/80 my-1" />

            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="h-5 w-5 text-slate-500 shrink-0" />
              <span className="text-sm font-semibold">{nextJob.schedule || '-'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <MapPin className="h-5 w-5 text-slate-500 shrink-0" />
              <span className="text-sm font-semibold">{nextJob.location || '-'}</span>
            </div>

            <button
              onClick={() => navigate('/worker/jobs')}
              className="mt-2 w-full rounded-xl bg-[#005B66] py-3 text-center text-sm font-bold text-white transition hover:bg-[#004852] active:scale-[0.98]"
            >
              Lihat Detail Pekerjaan
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center text-gray-500 text-sm">
            Tidak ada pekerjaan mendatang saat ini.
          </div>
        )}

      </div>
    </MobileLayout>
  );
}