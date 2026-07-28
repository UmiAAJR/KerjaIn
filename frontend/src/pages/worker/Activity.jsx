import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api'; // Sesuaikan path ini dengan project kamu
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
  Loader2
} from 'lucide-react';

export default function WorkerActivity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Semua Pekerjaan');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Menyimpan ID job yang sedang di-proses (terima/tolak)

  // Asumsi workerId didapat dari auth / localStorage / session
  const currentWorkerId = localStorage.getItem('workerId') || 'w1';

  // 1. FETCH DATA PEKERJAAN AKTIF
  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const data = await workerApi.getActiveJobs(currentWorkerId);
      setJobs(data || []);
    } catch (error) {
      console.error('Gagal mengambil data pekerjaan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  // 2. HANDLER TERIMA PEKERJAAN
  const handleAccept = async (jobId) => {
    try {
      setActionLoading(jobId);
      await workerApi.acceptBooking(jobId);
      await fetchActiveJobs(); // Refresh data
    } catch (error) {
      alert('Gagal menerima pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. HANDLER TOLAK PEKERJAAN
  const handleReject = async (jobId) => {
    if (!window.confirm('Apakah Anda yakin ingin menolak pekerjaan ini?')) return;
    try {
      setActionLoading(jobId);
      await workerApi.rejectBooking(jobId);
      await fetchActiveJobs(); // Refresh data
    } catch (error) {
      alert('Gagal menolak pekerjaan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper untuk menentukan status kategori UI ('Menunggu' / 'Berlangsung')
  const getUiStatus = (status) => {
    if (['WAITING_PAYMENT', 'ESCROW_PAID'].includes(status)) {
      return 'Menunggu';
    }
    return 'Berlangsung';
  };

  // Filter jobs berdasarkan tab aktif
  const filteredJobs = jobs.filter((job) => {
    const uiStatus = getUiStatus(job.status);
    if (activeTab === 'Semua Pekerjaan') return true;
    return uiStatus === activeTab;
  });

  const tabs = ['Semua Pekerjaan', 'Berlangsung', 'Menunggu'];

  const historyButton = (
    <button
      onClick={() => navigate('/worker/history')}
      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl"
    >
      <Clock size={20} />
    </button>
  );

  return (
    <MobileLayout
      topNavProps={{
        variant: 'title',
        title: 'Detail Pekerjaan',
        onBack: () => navigate(-1),
        rightElement: historyButton
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20">

        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#001d28]">Aktivitas Saya</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola pekerjaan yang sedang berjalan dan permintaan baru.
          </p>
        </div>

        {/* TAB NAVIGASI */}
        <div className="flex border-b border-gray-200 mb-4 text-sm font-medium overflow-x-auto no-scrollbar gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#007088] text-[#007088] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* DAFTAR KARTU PEKERJAAN */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs">Memuat pekerjaan...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10">
                Tidak ada pekerjaan di kategori ini.
              </p>
            ) : (
              filteredJobs.map((job) => {
                const uiStatus = getUiStatus(job.status);
                const isPending = uiStatus === 'Menunggu';
                const id = job.jobId || job.id;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
                  >
                    {/* BADGE STATUS */}
                    <div
                      className={`absolute top-0 right-0 text-white text-[11px] font-semibold px-3 py-1 rounded-bl-xl ${
                        isPending ? 'bg-[#fea619]' : 'bg-[#008953]'
                      }`}
                    >
                      {isPending ? 'Permintaan Baru' : 'Sedang Berjalan'}
                    </div>

                    {/* USER INFO */}
                    <div className="flex items-center gap-3 mb-3 pr-28">
                      <img
                        src={
                          job.clientAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            job.clientName || 'Client'
                          )}&background=random`
                        }
                        alt={job.clientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {job.clientName || 'Pelanggan'}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          {!isPending ? (
                            <Zap className="w-3 h-3 text-gray-400" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-gray-400" />
                          )}
                          {job.service}
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-100 my-2" />

                    {/* DETAILS */}
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 my-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          {!isPending ? (
                            <>
                              <MapPin className="w-3.5 h-3.5" /> Lokasi
                            </>
                          ) : (
                            <>
                              <Navigation className="w-3.5 h-3.5" /> Jarak
                            </>
                          )}
                        </span>
                        <span className="font-medium text-gray-700">
                          {job.address || job.distance || 'Lokasi tidak tersedia'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          {!isPending ? (
                            <>
                              <Clock className="w-3.5 h-3.5" /> Mulai
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5" /> Waktu
                            </>
                          )}
                        </span>
                        <span className="font-medium text-gray-700">
                          {job.schedule || job.date || '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5" /> Harga
                        </span>
                        <span className="font-bold text-[#007088] text-sm">
                          Rp {(job.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* KHUSUS PEKERJAAN BERLANGSUNG: PROGRESS BAR */}
                    {!isPending && (
                      <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mb-3">
                        <div
                          className="bg-[#008953] h-full rounded-full transition-all duration-300"
                          style={{
                            width:
                              job.status === 'WORKER_ACCEPTED'
                                ? '25%'
                                : job.status === 'ON_THE_WAY'
                                ? '50%'
                                : job.status === 'IN_PROGRESS'
                                ? '75%'
                                : '90%'
                          }}
                        />
                      </div>
                    )}

                    <hr className="border-gray-100 mb-3" />

                    {/* ACTION BUTTONS */}
                    {isPending ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          disabled={actionLoading === id}
                          onClick={() => handleAccept(id)}
                          className="w-full py-2 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {actionLoading === id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Terima'
                          )}
                        </button>
                        <button
                          disabled={actionLoading === id}
                          onClick={() => handleReject(id)}
                          className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/worker/tracking/${id}`)}
                        className="w-full py-2.5 bg-[#e0edff] hover:bg-[#d0e3ff] text-[#007088] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Detail & Hubungi Client</span>
                      </button>
                    )}
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