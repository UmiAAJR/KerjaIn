import { useState, useEffect, useCallback } from 'react';
import MobileLayout from "../../components/layout/MobileLayout";
import { useAuth } from "../../context/AuthContext";
import { workerApi } from "../../services/api";
import { 
  Calendar, 
  Banknote, 
  MapPin, 
  Clock, 
  Sparkles,
  AlertCircle,
  Phone
} from 'lucide-react';

export default function WorkerActivity() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Running' | 'Pending'

  const fetchJobs = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const data = await workerApi.getActiveJobs(user.id);
      setJobs(data.reverse());
    } catch (err) {
      console.error("Gagal memuat aktivitas worker:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  const handleAccept = async (jobId) => {
    try {
      await workerApi.acceptBooking(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Gagal menerima booking: " + err.message);
    }
  };

  const handleReject = async (jobId) => {
    try {
      await workerApi.rejectBooking(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Gagal menolak booking: " + err.message);
    }
  };

  const handleOnTheWay = async (jobId) => {
    try {
      await workerApi.updateOnTheWay(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Gagal memperbarui status: " + err.message);
    }
  };

  const handleStart = async (jobId) => {
    try {
      await workerApi.startJob(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Gagal memulai pekerjaan: " + err.message);
    }
  };

  const handleFinish = async (jobId) => {
    try {
      await workerApi.finishJob(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Gagal menyelesaikan pekerjaan: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return { text: 'Menunggu Pembayaran', style: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'ESCROW_PAID':
        return { text: 'Booking Baru', style: 'bg-[#fea619] text-white' };
      case 'WORKER_ACCEPTED':
        return { text: 'Diterima', style: 'bg-teal-50 text-[#007088] border-teal-100' };
      case 'ON_THE_WAY':
        return { text: 'Perjalanan', style: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'IN_PROGRESS':
        return { text: 'Pengerjaan', style: 'bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse' };
      case 'WAITING_CONFIRMATION':
        return { text: 'Menunggu Review', style: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
      default:
        return { text: status, style: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'Running') {
      return ['WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION'].includes(job.status);
    }
    if (activeTab === 'Pending') {
      return ['WAITING_PAYMENT', 'ESCROW_PAID'].includes(job.status);
    }
    return true;
  });

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Aktivitas Pekerjaan",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "activity",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20 text-left">
        
        {/* Header Deskripsi */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold">
            Kelola tawaran masuk dan pantau status pengerjaan aktif Anda.
          </p>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200 mb-5 text-xs font-bold tracking-wide">
          <button
            onClick={() => setActiveTab('All')}
            className={`pb-3.5 px-3 mr-4 transition-all ${
              activeTab === 'All'
                ? 'text-[#007088] border-b-2 border-[#007088]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('Running')}
            className={`pb-3.5 px-3 mr-4 transition-all ${
              activeTab === 'Running'
                ? 'text-[#007088] border-b-2 border-[#007088]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Berlangsung
          </button>
          <button
            onClick={() => setActiveTab('Pending')}
            className={`pb-3.5 px-3 transition-all ${
              activeTab === 'Pending'
                ? 'text-[#007088] border-b-2 border-[#007088]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Menunggu
          </button>
        </div>

        {/* List Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007088]"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-100 p-6">
            <AlertCircle size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-400">Tidak ada aktivitas pekerjaan</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => {
              const badge = getStatusBadge(job.status);
              return (
                <div
                  key={job.jobId}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-150 hover:border-slate-300 transition-all relative overflow-hidden"
                >
                  {/* Badge Status */}
                  <div className={`absolute top-0 right-0 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl border-l border-b border-white/10 ${badge.style}`}>
                    {badge.text}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-3 mb-4 pr-32">
                    <div className="w-11 h-11 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#007088] font-bold text-sm">
                      {job.clientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{job.clientName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Sparkles size={11} className="stroke-[2.5]" /> {job.service}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100 my-2" />

                  {/* Job Details */}
                  <div className="flex flex-col gap-2 text-[11px] text-slate-500 my-3.5 font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={13} /> Alamat Client
                      </span>
                      <span className="font-bold text-slate-700 line-clamp-1 max-w-[200px]">{job.address}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={13} /> Jadwal Mulai
                      </span>
                      <span className="font-bold text-slate-700">{job.schedule}</span>
                    </div>
                    {job.description && (
                      <div className="flex justify-between items-start">
                        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <Clock size={13} /> Keterangan
                        </span>
                        <span className="font-medium text-slate-600 pl-4 text-right line-clamp-1 max-w-[220px]">{job.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span className="flex items-center gap-1.5 text-[#007088]">
                        <Banknote size={14} className="stroke-[2.5]" /> Total Upah
                      </span>
                      <span className="font-black text-sm text-[#007088]">
                        Rp {job.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-100 mb-4" />

                  {/* Action Buttons based on status */}
                  {job.status === 'WAITING_PAYMENT' && (
                    <div className="text-center py-2 bg-amber-50 rounded-xl border border-amber-100/60">
                      <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Menunggu Pembayaran Escrow Client</p>
                    </div>
                  )}

                  {job.status === 'ESCROW_PAID' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAccept(job.jobId)}
                        className="py-2.5 bg-[#007088] hover:bg-[#005a70] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleReject(job.jobId)}
                        className="py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50/70 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.99]"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {job.status === 'WORKER_ACCEPTED' && (
                    <button
                      onClick={() => handleOnTheWay(job.jobId)}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-cyan-100 active:scale-[0.99]"
                    >
                      Berangkat Menuju Lokasi
                    </button>
                  )}

                  {job.status === 'ON_THE_WAY' && (
                    <button
                      onClick={() => handleStart(job.jobId)}
                      className="w-full py-2.5 bg-[#007088] hover:bg-[#005c70] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      Mulai Kerjakan Jasa
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleFinish(job.jobId)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-100 active:scale-[0.99]"
                    >
                      Laporkan Pekerjaan Selesai
                    </button>
                  )}

                  {job.status === 'WAITING_CONFIRMATION' && (
                    <div className="flex gap-2">
                      <div className="flex-grow text-center py-2.5 bg-indigo-50/70 border border-indigo-100/60 rounded-xl">
                        <p className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">Menunggu Konfirmasi Client</p>
                      </div>
                      <a
                        href={`tel:${job.clientPhone}`}
                        className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center shrink-0"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
