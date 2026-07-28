import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  DollarSign, 
  Check, 
  X, 
  Clock, 
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, verRes, jobsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getWorkerVerificationList(),
        adminApi.getJobs()
      ]);
      setStats(statsRes);
      // Only show pending verifications
      setVerifications(verRes.filter(v => v.ktpStatus === 'Pending'));
      // Sort and show latest 5 jobs
      const sortedJobs = [...jobsRes]
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
        .slice(0, 5);
      setRecentJobs(sortedJobs);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (workerId, status) => {
    try {
      await adminApi.verifyWorker(workerId, status);
      // Refresh data
      fetchData();
    } catch (err) {
      alert("Gagal memproses verifikasi: " + err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeMenu="dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Formatting currency
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const statCards = [
    { label: 'Total Client', val: stats?.totalClient || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Total Worker', val: stats?.totalWorker || 0, sub: `${stats?.verifiedWorker || 0} Terverifikasi`, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Pekerjaan Aktif', val: stats?.activeJob || 0, sub: `${stats?.completedJob || 0} Selesai`, icon: Briefcase, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Dana Escrow (Hold)', val: formatIDR(stats?.escrowHolding || 0), sub: `Dirilis: ${formatIDR(stats?.escrowReleased || 0)}`, icon: DollarSign, color: 'text-teal-600 bg-teal-50 border-teal-100' },
  ];

  return (
    <AdminLayout activeMenu="dashboard">
      <div className="space-y-8 select-none">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <h3 className="text-2xl font-black text-slate-800 leading-none">{card.val}</h3>
                  {card.sub && (
                    <span className="text-[11px] font-bold text-slate-500 block leading-none pt-0.5">{card.sub}</span>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color} shrink-0`}>
                  <Icon size={22} className="stroke-2" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic section: Pending Verification & Recent Jobs */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Pending Verifications */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-2">
                <Clock size={16} className="text-amber-500 stroke-[2.5]" />
                <span>Pengajuan Verifikasi KTP</span>
              </h3>
              <span className="bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-100/60">
                {verifications.length} TUNDA
              </span>
            </div>

            <div className="flex-grow overflow-x-auto min-w-0">
              {verifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <AlertCircle size={32} className="stroke-1.5 text-slate-300" />
                  <p className="text-xs font-bold uppercase tracking-wider">Tidak ada pengajuan verifikasi baru</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 font-bold">Worker</th>
                      <th className="pb-3 font-bold">Email</th>
                      <th className="pb-3 font-bold text-center">Foto KTP</th>
                      <th className="pb-3 font-bold text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 font-bold text-slate-700">{item.name}</td>
                        <td className="py-4 font-semibold text-slate-500">{item.email}</td>
                        <td className="py-4 text-center">
                          {item.ktpPhoto ? (
                            <a
                              href={item.ktpPhoto}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block text-[10px] font-black text-teal-600 hover:underline bg-teal-50 px-2 py-0.5 rounded border border-teal-100"
                            >
                              LIHAT DOKUMEN
                            </a>
                          ) : (
                            <span className="text-slate-400 font-semibold italic text-[10px]">Tanpa Foto</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleVerify(item.id, 'Verified')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all border border-emerald-100 cursor-pointer"
                              title="Setujui Verifikasi"
                            >
                              <Check size={14} className="stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleVerify(item.id, 'Rejected')}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border border-rose-100 cursor-pointer"
                              title="Tolak Verifikasi"
                            >
                              <X size={14} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
                Pekerjaan Terbaru
              </h3>
            </div>

            <div className="flex-grow space-y-4">
              {recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <AlertCircle size={32} className="stroke-1.5 text-slate-300" />
                  <p className="text-xs font-bold uppercase tracking-wider">Belum ada pekerjaan di sistem</p>
                </div>
              ) : (
                recentJobs.map((job) => {
                  const statusColors = {
                    'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'PENDING': 'bg-blue-50 text-blue-700 border-blue-100',
                    'ACCEPTED': 'bg-cyan-50 text-cyan-700 border-cyan-100',
                    'ARRIVED': 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    'WORKING': 'bg-amber-50 text-amber-700 border-amber-100',
                    'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-100'
                  };

                  return (
                    <div key={job.jobId} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                            {job.title || job.service || 'Pekerjaan Jasa'}
                          </h4>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColors[job.status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-none">
                          Client: {job.clientName || 'Budi Santoso'} • Pekerja: {job.workerName || '-'}
                        </p>
                        <p className="text-xs font-extrabold text-teal-600 mt-2.5 leading-none">
                          {formatIDR(job.price)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
