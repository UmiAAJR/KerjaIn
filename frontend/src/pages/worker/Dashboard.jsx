import { useState, useEffect } from 'react';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { workerApi } from "../../services/api";
import {
  TrendingUp,
  History,
  Zap,

  Calendar,
  MapPin,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Marker, Popup, MapContainer, TileLayer } from 'react-leaflet';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const res = await workerApi.getDashboard(user.id);
        setDashboardData(res);
      } catch (err) {
        console.error("Gagal memuat dasbor worker:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return "Rp 0";
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatPriceK = (val) => {
    if (val === undefined || val === null) return "Rp 0";
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1)}jt`;
    }
    if (val >= 1000) {
      return `Rp ${(val / 1000).toFixed(0)}rb`;
    }
    return `Rp ${val}`;
  };

  if (loading) {
    return (
      <MobileLayout
        topNavProps={{ variant: "location", hasNotification: true }}
        bottomNavProps={{ activeTab: "home" }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  const coords = user?.latitude && user?.longitude ? [user.latitude, user.longitude] : [-6.2088, 106.8456];

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
      <div className="px-5 pt-5 pb-8 space-y-6 text-left">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-black text-[#005B66] font-heading tracking-tight leading-tight">
            Halo, {user?.name || 'Worker'}
          </h2>
          <h3 className="text-sm text-gray-500 font-semibold mt-1">
            Siap untuk menyelesaikan pekerjaan hari ini?
          </h3>
        </div>

        {/* Box Saldo */}
        <div className="relative w-full max-w-sm rounded-3xl bg-[#0e7490] p-6 text-white shadow-lg overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-cyan-600/30 rounded-full"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-cyan-100/90 uppercase tracking-wider">Saldo Pendapatan Anda</p>
            <h2 className="mt-2.5 mb-5 text-3xl font-black tracking-tight leading-tight text-white font-heading">
              {formatPrice(dashboardData?.income?.walletBalance)}
            </h2>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <Link to="/worker/wallet" className="flex-grow rounded-2xl bg-white py-3 text-center text-xs font-black text-[#0e7490] hover:bg-cyan-50 shadow-sm active:scale-[0.99] transition-all">
                Tarik Dana
              </Link>
              <button
                onClick={() => navigate('/worker/history')}
                className="flex items-center justify-center rounded-2xl border border-white/20 hover:bg-white/10 px-4 text-white transition active:scale-95 cursor-pointer"
                aria-label="Riwayat Transaksi"
              >
                <History className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RINGKASAN PENDAPATAN */}
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-[#F3F6FD] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              RINGKASAN ESTIMASI
            </span>
            <TrendingUp className="h-4 w-4 text-[#005B66]" />
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-200">
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-[10px] font-bold text-slate-500">Hari Ini</p>
              <p className="text-sm font-black text-slate-800 font-heading mt-1">
                {formatPriceK(dashboardData?.income?.todayIncome)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-[10px] font-bold text-slate-500">Minggu Ini</p>
              <p className="text-sm font-black text-slate-800 font-heading mt-1">
                {formatPriceK(dashboardData?.income?.weeklyIncome)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center px-1">
              <p className="text-[10px] font-bold text-slate-500">Bulan Ini</p>
              <p className="text-sm font-black text-slate-800 font-heading mt-1">
                {formatPriceK(dashboardData?.income?.monthlyIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIK ORDER */}
        <div className="no-scrollbar overflow-x-auto flex items-center gap-4 py-1">
          <div className="flex flex-row items-center shrink-0 w-44 rounded-2xl bg-cyan-50/70 border border-cyan-100 p-4 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-cyan-900 leading-tight block">{dashboardData?.order?.activeOrder || 0}</span>
              <p className="text-[10px] font-bold text-cyan-600/90 uppercase tracking-wide">Order Aktif</p>
            </div>
          </div>

          <div className="flex flex-row items-center shrink-0 w-44 rounded-2xl bg-amber-50/70 border border-amber-100 p-4 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-amber-900 leading-tight block">{dashboardData?.order?.pendingOrder || 0}</span>
              <p className="text-[10px] font-bold text-amber-600/90 uppercase tracking-wide">Pending</p>
            </div>
          </div>

          <div className="flex flex-row items-center shrink-0 w-44 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-emerald-900 leading-tight block">{dashboardData?.order?.completeOrder || 0}</span>
              <p className="text-[10px] font-bold text-emerald-600/90 uppercase tracking-wide">Selesai</p>
            </div>
          </div>
        </div>

        {/* PEKERJAAN SELANJUTNYA */}
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3.5">
            PEKERJAAN TERDEKAT
          </h4>

          {dashboardData?.nextJob ? (
            <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
              <div className="absolute top-0 right-0 rounded-bl-2xl bg-[#F9A825] px-3.5 py-1.5 shadow-xs">
                <span className="text-[10px] font-black text-[#5D3A00] tracking-wider uppercase">
                  {dashboardData.nextJob.schedule.split(' ')[1] || 'Mulai'}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-14 w-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#005B66] font-bold text-lg shrink-0">
                  {dashboardData.nextJob.clientName.charAt(0)}
                </div>

                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] font-black text-[#005B66] uppercase tracking-wider">
                    {dashboardData.nextJob.service}
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug truncate">
                    {dashboardData.nextJob.clientName}
                  </h3>
                </div>
              </div>

              <div className="border-b border-slate-100 my-1" />

              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold">{dashboardData.nextJob.schedule}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold truncate">{dashboardData.nextJob.location}</span>
              </div>

              <button
                onClick={() => navigate('/worker/activity')}
                className="mt-2 w-full rounded-2xl bg-[#005B66] py-3 text-center text-xs font-black text-white hover:bg-[#004852] active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-cyan-100"
              >
                Lihat Detail Aktivitas
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xs text-slate-400 space-y-2">
              <AlertCircle size={28} className="mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-bold">Tidak ada pekerjaan tertunda atau berjalan.</p>
              <p className="text-[10px] text-slate-400 font-medium">Buka menu Aktivitas untuk melihat booking baru.</p>
            </div>
          )}
        </div>

        {/* PETA LOKASI */}
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3.5">
            LOKASI ANDA
          </h4>
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
            <MapContainer attributionControl className='w-full h-52' center={coords} zoom={14} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coords}>
                <Popup>
                  <p className="text-xs font-bold">Lokasi Saya ({user?.name})</p>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}