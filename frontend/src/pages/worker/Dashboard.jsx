import React, { useEffect, useState } from 'react';
import { workerApi } from '../../services/api'; // atau '../../services/workerService'
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, History, Zap, ClipboardCheck, Clock, Timer, Star, Calendar, MapPin, ShieldAlert, ChevronRight
} from 'lucide-react';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [verification, setVerification] = useState(null);

  // Helper format rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number || 0);
  };

  useEffect(() => {
    const currentWorkerId = localStorage.getItem('workerId') || 'me';

    setLoading(true);
    Promise.all([
      workerApi.getDashboard(currentWorkerId),
      workerApi.getVerification(currentWorkerId)
    ])
      .then(([dashRes, verifRes]) => {
        setData(dashRes);
        setVerification(verifRes);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data dashboard:", err);
        setLoading(false);
      });
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

  const { name, income, order, nextJob, status: workerStatus } = data;

  const isVerified = workerStatus === 'verified' || verification?.status === 'accepted' || verification?.status === 'approved';
  const isPendingVerif = workerStatus === 'pending_verification' || verification?.status === 'pending';

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
      <div className="px-5 pt-5 pb-8 space-y-5 relative text-left">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-black text-primary-600 font-heading tracking-tight leading-tight">
            Halo, {data.name} !
          </h2>
          <h3 className="text-sm text-gray-500 mt-0.5">
            Siap untuk menyelesaikan pekerjaan hari ini?
          </h3>
        </div>

        {/* UNVERIFIED / PENDING VERIFICATION ALERT BANNER */}
        {!isVerified && (
          <div className="w-full max-w-sm rounded-2xl bg-amber-50 border border-amber-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  {isPendingVerif ? 'Verifikasi Sedang Diproses' : 'Akun Anda Belum Diverifikasi'}
                </h4>
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                  {isPendingVerif 
                    ? 'Dokumen identitas KTP & Selfie Anda sedang ditinjau. Anda belum dapat menerima pesanan baru sampai akun disetujui.'
                    : 'Anda belum melengkapi verifikasi identitas KTP & Selfie. Akun Anda tidak dapat menerima pekerjaan atau melakukan penarikan saldo.'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/worker/verification')}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <span>{isPendingVerif ? 'Cek Status Verifikasi' : 'Verifikasi Akun Sekarang'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

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
                <p className="text-sm font-extrabold leading-tight text-gray-900">
                  {formatRupiah(income?.monthlyIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PROSES PESANAN (3 KOTAK RINGKASAN ORDER) */}
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">
            PROSES PESANAN HARI INI
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Aktif */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-cyan-50/60 p-3 border border-cyan-100">
              <Zap className="h-5 w-5 text-cyan-600 mb-1" />
              <span className="text-lg font-black text-slate-800">{order?.activeOrder || 0}</span>
              <span className="text-[10px] font-bold text-slate-500">Aktif</span>
            </div>

            {/* Menunggu */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50/60 p-3 border border-amber-100">
              <Clock className="h-5 w-5 text-amber-600 mb-1" />
              <span className="text-lg font-black text-slate-800">{order?.pendingOrder || 0}</span>
              <span className="text-[10px] font-bold text-slate-500">Menunggu</span>
            </div>

            {/* Selesai */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
              <ClipboardCheck className="h-5 w-5 text-emerald-600 mb-1" />
              <span className="text-lg font-black text-slate-800">{order?.completeOrder || 0}</span>
              <span className="text-[10px] font-bold text-slate-500">Selesai</span>
            </div>
          </div>
        </div>

        {/* PEKERJAAN NEXT */}
        {nextJob && (
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-[#007088] uppercase tracking-wider">Pekerjaan Berikutnya</span>
              <span className="text-[10px] font-bold bg-cyan-50 text-[#007088] px-2 py-0.5 rounded-md">
                {nextJob.service}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800">{nextJob.clientName}</p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Calendar size={13} /> {nextJob.schedule}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <MapPin size={13} /> {nextJob.location}
              </p>
            </div>
          </div>
        )}

      </div>
    </MobileLayout>
  );
}