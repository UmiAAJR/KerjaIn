import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Star, 
  ClipboardList, 
  MapPin, 
  Loader2, 
  ChevronLeft,
  Banknote
} from 'lucide-react';

export default function WorkerHistory() {
  const navigate = useNavigate();
  const [historyTab, setHistoryTab] = useState('Semua');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentWorkerId = localStorage.getItem('workerId') || 'me';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await workerApi.getHistory(currentWorkerId);
      setHistoryData(Array.isArray(data) ? [...data].reverse() : []);
    } catch (err) {
      console.error('Gagal memuat riwayat pekerjaan worker:', err);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const historyTabs = ['Semua', 'Dalam Proses', 'Selesai', 'Dibatalkan'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WAIT_CONFIRM':
      case 'WAITING_CONFIRMATION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Selesai & Lunas';
      case 'CANCELLED':
      case 'REJECTED': return 'Dibatalkan';
      case 'WAIT_CONFIRM':
      case 'WAITING_CONFIRMATION': return 'Menunggu Konfirmasi';
      case 'IN_PROGRESS': return 'Sedang Dikerjakan';
      case 'ON_THE_WAY': return 'OTW ke Lokasi';
      case 'ACCEPTED':
      case 'WORKER_ACCEPTED': return 'Diterima';
      case 'WAITING_PAYMENT':
      case 'ESCROW_PAID': return 'Pesanan Baru';
      default: return status;
    }
  };

  const filteredHistory = historyData.filter((h) => {
    if (historyTab === 'Semua') return true;
    if (historyTab === 'Selesai') return h.status === 'COMPLETED';
    if (historyTab === 'Dibatalkan') return ['CANCELLED', 'REJECTED'].includes(h.status);
    if (historyTab === 'Dalam Proses') return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(h.status);
    return true;
  });

  return (
    <MobileLayout
      topNavProps={{
        variant: 'brand',
        brandName: 'Riwayat Pekerjaan',
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen pb-24 text-left space-y-4">
        
        {/* BACK BUTTON & TITLE */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/worker/activity')}
            className="flex items-center gap-1 text-xs font-extrabold text-[#007088] hover:underline cursor-pointer"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span>Kembali ke Aktivitas</span>
          </button>
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Pekerjaan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh transaksi dan status pengerjaan Anda.
          </p>
        </div>

        {/* Filter Chips (Horizontal Scrollable) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {historyTabs.map((t) => (
            <button
              key={t}
              onClick={() => setHistoryTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                historyTab === t
                  ? 'bg-[#007088] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mb-2 text-[#007088]" />
            <p className="text-xs font-semibold">Memuat riwayat pekerjaan...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList size={28} />
            </div>
            <p className="text-sm font-bold text-slate-500">Belum ada riwayat pekerjaan</p>
            <p className="text-xs text-slate-400">Pekerjaan yang Anda selesaikan atau kerjakan akan tercatat di sini.</p>
          </div>
        ) : (
          /* Card List */
          <div className="space-y-3.5">
            {filteredHistory.map((h) => {
              const id = h.jobId || h.id || h.JobID;
              return (
                <div
                  key={id}
                  onClick={() => navigate(`/worker/detailpekerjaan?id=${id}`)}
                  className="bg-white rounded-2xl p-4 border border-slate-150 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 active:scale-[0.99]"
                >
                  {/* Upper Badge & Status */}
                  <div className="flex justify-between items-center">
                    <span className="bg-teal-50 text-[#007088] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-teal-100">
                      {h.service || 'Layanan KerjaIn'}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${getStatusStyle(h.status)}`}>
                      {getStatusLabel(h.status)}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={h.clientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.clientName || 'Client')}&background=random`}
                      alt={h.clientName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-grow">
                      <h3 className="font-extrabold text-slate-800 text-sm truncate">{h.clientName || 'Pelanggan'}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Calendar size={12} className="stroke-[2]" />
                        <span>{h.schedule || h.date || '-'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate max-w-[180px]">{h.address || 'Jakarta'}</span>
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Rating & Pricing */}
                  <div className="flex justify-between items-end">
                    <div>
                      {h.status === 'COMPLETED' && h.rating > 0 ? (
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ulasan Pelanggan</p>
                          <div className="flex text-amber-400 text-xs gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < h.rating ? 'currentColor' : 'none'}
                                className={i < h.rating ? 'text-amber-400' : 'text-slate-200'}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Metode Pembayaran</p>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">Escrow Platform</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Pendapatan</p>
                      <p className="font-black text-sm text-[#007088] mt-0.5 flex items-center justify-end gap-1">
                        <Banknote size={14} />
                        <span>Rp {(h.price || 0).toLocaleString('id-ID')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </MobileLayout>
  );
}
