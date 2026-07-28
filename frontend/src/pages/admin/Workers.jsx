import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { Mail, Phone, Search, AlertCircle, Check, X, Star, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getWorkers();
      setWorkers(res || []);
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleVerify = async (workerId, status) => {
    try {
      await adminApi.verifyWorker(workerId, status);
      // Refresh list
      fetchWorkers();
    } catch (err) {
      alert("Gagal mengubah status verifikasi: " + err.message);
    }
  };

  // Filter logic
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.phone && w.phone.includes(searchQuery));
    
    const matchesStatus = 
      statusFilter === 'All' || 
      w.ktpStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout activeMenu="users">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeMenu="users">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 select-none">
        
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
              Daftar Pekerja (Worker)
            </h3>
            <span className="bg-teal-50 text-teal-600 font-black text-xs px-2.5 py-1 rounded-full border border-teal-100">
              {filteredWorkers.length} PEKERJA
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer w-full sm:w-44"
            >
              <option value="All">Semua Verifikasi</option>
              <option value="Verified">Terverifikasi</option>
              <option value="Pending">Pending Ulasan</option>
              <option value="Rejected">Ditolak</option>
              <option value="Not_Submitted">Belum Mengajukan</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari nama, email, telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Workers Table */}
        <div className="overflow-x-auto min-w-0">
          {filteredWorkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
              <AlertCircle size={36} className="stroke-1.5 text-slate-300" />
              <p className="text-xs font-bold uppercase tracking-wider">Tidak ada pekerja ditemukan</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-4 font-bold">Profil</th>
                  <th className="pb-4 font-bold">Nama / ID</th>
                  <th className="pb-4 font-bold">Kontak</th>
                  <th className="pb-4 font-bold text-center">Statistik</th>
                  <th className="pb-4 font-bold text-center">Status KTP</th>
                  <th className="pb-4 font-bold text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => {
                  
                  // Verification status colors
                  const vColors = {
                    'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'Pending': 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse',
                    'Rejected': 'bg-rose-50 text-rose-700 border-rose-100',
                    'Not_Submitted': 'bg-slate-50 text-slate-500 border-slate-100'
                  };

                  const vLabels = {
                    'Verified': 'Terverifikasi',
                    'Pending': 'Pending Ulasan',
                    'Rejected': 'Ditolak',
                    'Not_Submitted': 'Belum Diajukan'
                  };

                  return (
                    <tr key={worker.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                      
                      {/* Photo */}
                      <td className="py-4">
                        <img
                          src={worker.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                          alt={worker.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                      </td>

                      {/* Name & ID */}
                      <td className="py-4">
                        <div className="font-extrabold text-slate-800 text-sm leading-tight">
                          {worker.name}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                          ID: {worker.id}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{worker.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{worker.phone || '-'}</span>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star size={12} fill="currentColor" />
                            <span>{worker.rating?.toFixed(1) || '5.0'}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">{worker.jobsDone || 0} Job</span>
                        </div>
                        <div className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                          Exp: {worker.experienceYear || 0} Tahun
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 text-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${vColors[worker.ktpStatus] || vColors['Not_Submitted']}`}>
                          {vLabels[worker.ktpStatus] || 'Belum Diajukan'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 text-right">
                        {worker.ktpStatus === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {worker.ktpPhoto && (
                              <a
                                href={worker.ktpPhoto}
                                target="_blank"
                                rel="noreferrer"
                                className="mr-2 text-[10px] font-black text-teal-600 hover:underline bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 uppercase"
                              >
                                Lihat KTP
                              </a>
                            )}
                            <button
                              onClick={() => handleVerify(worker.id, 'Verified')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all border border-emerald-100 cursor-pointer"
                              title="Setujui Verifikasi KTP"
                            >
                              <Check size={14} className="stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleVerify(worker.id, 'Rejected')}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all border border-rose-100 cursor-pointer"
                              title="Tolak Verifikasi KTP"
                            >
                              <X size={14} className="stroke-[2.5]" />
                            </button>
                          </div>
                        ) : worker.ktpStatus === 'Verified' ? (
                          <span className="text-emerald-600 flex items-center justify-end gap-1 font-bold text-[11px]">
                            <ShieldCheck size={14} />
                            <span>Terlindungi</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center justify-end gap-1 font-semibold text-[11px] italic">
                            <ShieldAlert size={14} />
                            <span>Tidak Ada Pengajuan</span>
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminWorkers;
