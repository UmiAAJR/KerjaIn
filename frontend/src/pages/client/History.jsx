import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { Calendar, Star, Compass, ClipboardList } from 'lucide-react';

export default function ClientHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Active' | 'Finished'

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await clientApi.getHistory();
        setHistory(Array.isArray(data) ? [...data].reverse() : []);
      } catch (err) {
        console.error('Gagal mengambil riwayat pekerjaan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'WAITING_PAYMENT':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-100';
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'Finished') return item.status === 'COMPLETED';
    if (filter === 'Active') return !['COMPLETED', 'CANCELLED'].includes(item.status);
    return true;
  });

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Riwayat Pesanan",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "activity",
      }}
    >
      <div className="p-4 max-w-md mx-auto bg-slate-50 min-h-screen pb-20 text-left">
        
        {/* Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-5">
          {['All', 'Active', 'Finished'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === t
                  ? 'bg-[#046c7a] text-white shadow-md'
                  : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'All' ? 'Semua' : t === 'Active' ? 'Berjalan' : 'Selesai'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList size={30} />
            </div>
            <p className="text-sm font-bold text-slate-400">Belum ada riwayat pemesanan</p>
            <p className="text-xs text-slate-400">Pekerjaan yang Anda pesan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((job) => (
              <div
                key={job.jobId}
                onClick={() => navigate(`/client/history/${job.jobId}`)}
                className="bg-white rounded-2xl p-4 border border-slate-150 shadow-xs hover:shadow-md hover:border-slate-350 active:scale-[0.99] transition-all cursor-pointer relative"
              >
                {/* Upper Badge & Status */}
                <div className="flex justify-between items-center mb-3">
                  <div className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">
                    {job.service}
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${getStatusStyle(job.status)}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {/* Worker Avatar & Info */}
                <div className="flex items-center space-x-3 mb-3.5">
                  <img
                    src={job.workerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={job.workerName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{job.workerName}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="stroke-[2]" />
                      <span>{job.schedule}</span>
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 mb-3" />

                {/* Pricing & Rating */}
                <div className="flex justify-between items-end">
                  <div>
                    {job.status === 'COMPLETED' && job.rating > 0 ? (
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ulasan Anda</p>
                        <div className="flex text-amber-500 text-xs gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < job.rating ? 'currentColor' : 'none'}
                              className={i < job.rating ? 'text-amber-500' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                        <Compass size={13} className="text-slate-400" />
                        <span className="line-clamp-1 max-w-[150px]">{job.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Pembayaran</p>
                    <p className="font-black text-sm text-[#046c7a] mt-0.5">
                      Rp {job.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
