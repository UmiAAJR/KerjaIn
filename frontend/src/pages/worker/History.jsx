import { useState, useEffect } from 'react';
import MobileLayout from "../../components/layout/MobileLayout";
import { useAuth } from "../../context/AuthContext";
import { workerApi } from "../../services/api";
import { Calendar, Star, AlertCircle, Sparkles } from 'lucide-react';

export default function WorkerHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const data = await workerApi.getHistory(user.id);
        setHistory(data.reverse());
      } catch (err) {
        console.error("Gagal memuat riwayat worker:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Riwayat Selesai",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "activity",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-20 text-left">
        
        {/* Title */}
        <div className="mb-5">
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Daftar Riwayat Selesai</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Daftar seluruh pekerjaan yang telah diselesaikan dan dibayar penuh.</p>
        </div>

        {/* Card List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-100 p-6">
            <AlertCircle size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-400">Belum ada riwayat selesai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((job) => (
              <div key={job.jobId} className="bg-white rounded-2xl p-4 border border-slate-150 shadow-xs hover:border-slate-350 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <Sparkles size={11} className="stroke-[2.5]" />
                    <span>{job.service}</span>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-emerald-700">
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4 pr-16">
                  <div className="w-11 h-11 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#007088] font-bold text-sm">
                    {job.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{job.clientName}</h3>
                    <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-slate-400 stroke-[2.5]" />
                      <span>{job.finishedAt || job.schedule}</span>
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 mb-3" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rating Client</p>
                    <div className="flex text-amber-500 text-xs gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < (job.rating || 5) ? 'currentColor' : 'none'}
                          className={i < (job.rating || 5) ? 'text-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Upah Diterima</p>
                    <p className="font-black text-sm text-[#007088] mt-0.5">
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
