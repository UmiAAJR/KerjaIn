import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/swal';
import MobileLayout from "../../components/layout/MobileLayout";
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Calendar,
  Banknote,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  Phone
} from 'lucide-react';

export default function WorkerActivity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Semua Pekerjaan');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // State untuk Status Keaktifan Pekerja
  const [isOnline, setIsOnline] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 1. FETCH DATA PEKERJAAN AKTIF
  const fetchActiveJobs = async () => {
    try {
      const data = await workerApi.getActiveJobs();
      setJobs(data || []);
    } catch (error) {
      console.error('Gagal mengambil data pekerjaan:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. RUN FETCH SAAT KOMPONEN PERTAMA KALI DIMUAT
  useEffect(() => {
    setLoading(true);
    fetchActiveJobs();

    // Poll status update every 5 seconds
    const timer = setInterval(() => {
      fetchActiveJobs();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // HANDLER TOGGLE STATUS KERJA
  const handleToggleStatus = async () => {
    try {
      setIsToggling(true);
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      showAlert("Status Diubah", "info", `Anda sekarang ${newStatus ? 'Online' : 'Offline'}`);
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal mengubah status: ' + error.message);
    } finally {
      setIsToggling(false);
    }
  };

  // HANDLERS TRANSISI STATUS PEKERJAAN
  const handleAccept = async (jobId) => {
    try {
      setActionLoading(jobId);
      await workerApi.acceptBooking(jobId);
      showAlert("Pekerjaan Diterima!", "success", "Anda telah menerima tawaran pekerjaan ini.");
      await fetchActiveJobs();
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal menerima pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (jobId) => {
    const isConfirmed = await showConfirm("Konfirmasi Penolakan", "Apakah Anda yakin ingin menolak pekerjaan ini?", "Ya, Tolak", "warning");
    if (!isConfirmed) return;
    try {
      setActionLoading(jobId);
      await workerApi.rejectBooking(jobId);
      showAlert("Pekerjaan Ditolak", "info", "Tawaran pekerjaan telah ditolak.");
      await fetchActiveJobs();
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal menolak pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOnTheWay = async (jobId) => {
    try {
      setActionLoading(jobId);
      await workerApi.updateOnTheWay(jobId);
      showAlert("Menuju Lokasi", "info", "Status diperbarui: Anda dalam perjalanan ke lokasi klien.");
      await fetchActiveJobs();
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal memperbarui status: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartJob = async (jobId) => {
    try {
      setActionLoading(jobId);
      await workerApi.startJob(jobId);
      showAlert("Pekerjaan Dimulai!", "success", "Selamat bekerja! Pekerjaan telah resmi dimulai.");
      await fetchActiveJobs();
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal memulai pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinishJob = async (jobId) => {
    try {
      setActionLoading(jobId);
      await workerApi.finishJob(jobId);
      showAlert("Pekerjaan Selesai!", "success", "Pekerjaan berhasil diselesaikan! Menunggu konfirmasi dari klien.");
      await fetchActiveJobs();
    } catch (error) {
      showAlert("Gagal", "error", 'Gagal menyelesaikan pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper untuk menentukan status kategori UI ('Menunggu' / 'Berlangsung' / 'Menunggu Konfirmasi')
  const getUiStatus = (status) => {
    if (!status) return 'Menunggu';
    const s = String(status).toUpperCase();
    if (['WAITING_PAYMENT', 'ESCROW_PAID', 'PENDING', 'HOLDING'].includes(s)) {
      return 'Menunggu';
    }
    if (['WAIT_CONFIRM', 'WAITING_CONFIRMATION', 'WAIT_CONF'].includes(s)) {
      return 'Menunggu Konfirmasi';
    }
    return 'Berlangsung';
  };

  // Filter jobs berdasarkan tab aktif
  const filteredJobs = jobs.filter((job) => {
    const uiStatus = getUiStatus(job.status);
    if (activeTab === 'Semua Pekerjaan') return true;
    return uiStatus === activeTab;
  });

  const tabs = ['Semua Pekerjaan', 'Menunggu', 'Berlangsung', 'Menunggu Konfirmasi'];

  const historyButton = (
    <button
      onClick={() => navigate('/worker/history')}
      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
    >
      <Clock size={20} />
    </button>
  );

  return (
    <MobileLayout
      topNavProps={{
        variant: 'title',
        title: 'Detail Pekerjaan',
        onBack: () => navigate(`/worker/dashboard`),
        rightElement: historyButton
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20 text-left">

        {/* HEADER & TOGGLE STATUS */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#001d28]">Aktivitas Saya</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola pekerjaan dan pembaruan status pengerjaan.
            </p>
          </div>

          {/* TOGGLE WORKER STATUS */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOnline ? 'bg-[#008953]' : 'bg-gray-300'
              }`}
              aria-label="Toggle Status Kerja"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isOnline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] font-semibold text-gray-500">
              {isOnline ? 'Aktif Menerima' : 'Tidak Aktif'}
            </span>
          </div>
        </div>

        {/* TAB FILTER STATUS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#007088] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DAFTAR KARTU PEKERJAAN */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#007088]" />
            <p className="text-xs font-medium">Memuat pekerjaan...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 space-y-2 bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400">
                  Tidak ada pekerjaan di kategori ini.
                </p>
                <p className="text-[11px] text-gray-400">
                  Pesanan baru dari client akan muncul di sini secara otomatis.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const uiStatus = getUiStatus(job.status);
                const isPending = uiStatus === 'Menunggu';
                const isWaitConfirm = uiStatus === 'Menunggu Konfirmasi';
                const id = job.jobId || job.id;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 relative overflow-hidden space-y-3"
                  >
                    {/* BADGE STATUS */}
                    <div
                      className={`absolute top-0 right-0 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl tracking-wide uppercase ${
                        isPending
                          ? 'bg-[#fea619]'
                          : isWaitConfirm
                          ? 'bg-amber-600'
                          : 'bg-[#008953]'
                      }`}
                    >
                      {isPending
                        ? 'Permintaan Baru'
                        : isWaitConfirm
                        ? 'Menunggu Konfirmasi'
                        : job.status === 'ON_THE_WAY'
                        ? 'OTW ke Lokasi'
                        : job.status === 'IN_PROGRESS'
                        ? 'Sedang Dikerjakan'
                        : 'Pekerjaan Diterima'}
                    </div>

                    {/* USER INFO */}
                    <div className="flex items-center gap-3 pt-1 pr-32">
                      <img
                        src={
                          job.clientAvatar ||
                          job.Client?.User?.photo ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            job.clientName || job.Client?.User?.name || 'Client'
                          )}&background=random`
                        }
                        alt={job.clientName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-grow">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {job.clientName || 'Pelanggan'}
                        </h3>
                        <p className="text-xs text-[#007088] font-bold flex items-center gap-1 mt-0.5 truncate">
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span>{job.service}</span>
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* DETAILS */}
                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> Lokasi
                        </span>
                        <span className="font-bold text-gray-700 truncate max-w-[200px]">
                          {job.address || job.distance || 'Lokasi tidak tersedia'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Waktu
                        </span>
                        <span className="font-bold text-gray-700">
                          {job.schedule || job.date || '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Banknote className="w-3.5 h-3.5 shrink-0" /> Harga
                        </span>
                        <span className="font-extrabold text-[#007088] text-sm">
                          Rp {(job.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* KHUSUS PEKERJAAN BERLANGSUNG: PROGRESS BAR */}
                    {!isPending && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                          <span>Progres Pengerjaan</span>
                          <span>
                            {job.status === 'ACCEPTED' || job.status === 'WORKER_ACCEPTED'
                              ? '25%'
                              : job.status === 'ON_THE_WAY'
                              ? '50%'
                              : job.status === 'IN_PROGRESS'
                              ? '75%'
                              : '90%'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#008953] h-full rounded-full transition-all duration-300"
                            style={{
                              width:
                                job.status === 'ACCEPTED' || job.status === 'WORKER_ACCEPTED'
                                  ? '25%'
                                  : job.status === 'ON_THE_WAY'
                                  ? '50%'
                                  : job.status === 'IN_PROGRESS'
                                  ? '75%'
                                  : '90%'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <hr className="border-gray-100" />

                    {/* ACTION BUTTONS WORKER */}
                    <div className="space-y-2 pt-1">
                      {isPending ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            disabled={actionLoading === id}
                            onClick={() => handleAccept(id)}
                            className="w-full py-2.5 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            {actionLoading === id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Terima Pekerjaan'
                            )}
                          </button>
                          <button
                            disabled={actionLoading === id}
                            onClick={() => handleReject(id)}
                            className="w-full py-2.5 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : job.status === 'ACCEPTED' || job.status === 'WORKER_ACCEPTED' ? (
                        <button
                          disabled={actionLoading === id}
                          onClick={() => handleOnTheWay(id)}
                          className="w-full py-2.5 bg-[#008953] hover:bg-[#007345] text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          {actionLoading === id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Navigation className="w-4 h-4" />
                              <span>OTW ke Lokasi Client</span>
                            </>
                          )}
                        </button>
                      ) : job.status === 'ON_THE_WAY' ? (
                        <button
                          disabled={actionLoading === id}
                          onClick={() => handleStartJob(id)}
                          className="w-full py-2.5 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          {actionLoading === id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>Mulai Mengerjakan Jasa</span>
                            </>
                          )}
                        </button>
                      ) : job.status === 'IN_PROGRESS' ? (
                        <button
                          disabled={actionLoading === id}
                          onClick={() => handleFinishJob(id)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          {actionLoading === id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Selesaikan Pekerjaan</span>
                            </>
                          )}
                        </button>
                      ) : isWaitConfirm ? (
                        <div className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>Menunggu Konfirmasi Selesai dari Client</span>
                        </div>
                      ) : null}

                      {/* TOMBOL DETAIL PEKERJAAN - SELALU TAMPIL DIBAGIAN BAWAH KARTU */}
                      <button
                        onClick={() => navigate(`/worker/detailpekerjaan?id=${id}`)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Detail Pekerjaan</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </MobileLayout>
  );
}