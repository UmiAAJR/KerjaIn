import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  CheckCircle, 
  Wallet, 
  AlertOctagon, 
  TrendingUp 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <AdminLayout title="Ringkasan Statistik">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: 'Total Worker', value: stats.totalWorker, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { title: 'Worker Terverifikasi', value: stats.verifiedWorker, icon: ShieldCheck, color: 'text-success-600 bg-success-50' },
    { title: 'Verifikasi Pending', value: stats.pendingWorker, icon: Users, color: 'text-warning-600 bg-warning-50' },
    { title: 'Total Klien', value: stats.totalClient, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Pekerjaan Aktif', value: stats.activeJob, icon: Activity, color: 'text-primary-600 bg-primary-50' },
    { title: 'Pekerjaan Selesai', value: stats.completedJob, icon: CheckCircle, color: 'text-success-600 bg-success-50' },
    { title: 'Dana Escrow Ditahan', value: `Rp${stats.escrowHolding.toLocaleString('id-ID')}`, icon: Wallet, color: 'text-warning-600 bg-warning-50' },
    { title: 'Dana Escrow Dirilis', value: `Rp${stats.escrowReleased.toLocaleString('id-ID')}`, icon: Wallet, color: 'text-success-600 bg-success-50' },
    { title: 'Alert Panik Aktif', value: stats.activePanic, icon: AlertOctagon, color: stats.activePanic > 0 ? 'text-accent-600 bg-accent-50 animate-pulse' : 'text-slate-400 bg-slate-50' }
  ];

  return (
    <AdminLayout title="Ringkasan Statistik">
      <div className="space-y-6">
        {/* Revenue Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pendapatan Platform (10% Fee)</p>
            <h2 className="text-3xl font-black font-heading mt-1">Rp{stats.todayRevenue.toLocaleString('id-ID')}</h2>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block">Bulanan (Simulasi)</span>
              <span className="text-sm font-black">Rp{stats.monthlyRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold block">Mingguan (Simulasi)</span>
              <span className="text-sm font-black">Rp{stats.weeklyRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i} className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-2xl shrink-0 ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-xl font-black text-slate-800 font-heading mt-1">{card.value}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
