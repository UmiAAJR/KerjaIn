import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import { Star, Wallet, CheckSquare, Clock, MapPin, ChevronRight, TrendingUp } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      workerApi.getDashboard(user.id)
        .then(res => {
          setDashboard(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading || !dashboard) {
    return (
      <MobileLayout title="Worker KerjaIn">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Worker KerjaIn">
      {/* Worker Header Panel */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={dashboard.photo} 
            alt={dashboard.name} 
            className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
          />
          <div>
            <h3 className="text-sm font-black font-heading">{dashboard.name}</h3>
            <div className="flex items-center gap-0.5 text-warning-400 mt-0.5">
              <Star size={12} fill="currentColor" />
              <span className="text-[10px] font-bold text-slate-300">{dashboard.rating} Bintang</span>
            </div>
            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase
              ${dashboard.status === 'Available' ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'}`}>
              {dashboard.status === 'Available' ? 'Sedia Menerima Job' : 'Sibuk / Bekerja'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/worker/wallet')}
          className="p-3 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-700 flex flex-col items-center gap-1 shrink-0"
        >
          <Wallet size={18} className="text-primary-400" />
          <span className="text-[9px] text-slate-400 font-bold">Dompet</span>
          <span className="text-[10px] font-extrabold text-white">Rp{dashboard.income.walletBalance.toLocaleString('id-ID')}</span>
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Income Quick View Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border border-slate-100 flex flex-col justify-between h-24">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pendapatan Hari Ini</span>
            <span className="text-sm font-black text-slate-800 mt-2">Rp{dashboard.income.todayIncome.toLocaleString('id-ID')}</span>
            <span className="text-[9px] text-success-500 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp size={10} /> +12% vs Kemarin
            </span>
          </Card>
          <Card className="p-4 border border-slate-100 flex flex-col justify-between h-24">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pendapatan Bulanan</span>
            <span className="text-sm font-black text-slate-800 mt-2">Rp{dashboard.income.monthlyIncome.toLocaleString('id-ID')}</span>
            <span className="text-[9px] text-slate-400 font-bold mt-1">Prakiraan Bersih</span>
          </Card>
        </div>

        {/* Order Counters */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          <div>
            <p className="text-[10px] text-slate-400 font-bold">Job Aktif</p>
            <p className="text-base font-black text-primary-600 mt-0.5">{dashboard.order.activeOrder}</p>
          </div>
          <div className="border-x border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold">Job Pending</p>
            <p className="text-base font-black text-slate-800 mt-0.5">{dashboard.order.pendingOrder}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">Selesai</p>
            <p className="text-base font-black text-success-600 mt-0.5">{dashboard.order.completeOrder}</p>
          </div>
        </div>

        {/* Next Job Info */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-slate-700 font-heading">Pekerjaan Terdekat Aktif</h3>
            <button 
              onClick={() => navigate('/worker/activity')}
              className="text-xs font-bold text-primary-600 flex items-center gap-0.5"
            >
              Kelola <ChevronRight size={14} />
            </button>
          </div>

          {dashboard.nextJob ? (
            <Card 
              hoverable
              onClick={() => navigate('/worker/activity')}
              className="border border-primary-100 bg-white space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="bg-primary-50 text-primary-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {dashboard.nextJob.service}
                </span>
                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock size={10} /> {dashboard.nextJob.schedule}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Klien: {dashboard.nextJob.clientName}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-start gap-1">
                  <MapPin size={12} className="text-primary-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{dashboard.nextJob.location}</span>
                </p>
              </div>
            </Card>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 bg-white rounded-2xl">
              <p className="text-xs font-bold text-slate-400">Tidak ada order aktif terdekat</p>
              <p className="text-[10px] text-slate-400">Status Anda online, order baru akan muncul di notifikasi.</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default WorkerDashboard;
