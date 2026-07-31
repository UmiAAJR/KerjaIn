import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { showAlert } from '../../utils/swal';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  Star, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'workers'

  return (
    <AdminLayout activeMenu="users">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs py-3 border-slate-100 flex-wrap gap-2 select-none">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border cursor-pointer
              ${activeTab === 'clients'
                ? 'bg-teal-50 text-teal-600 border-teal-100 shadow-xs'
                : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
              }`}
          >
            <User size={14} className="stroke-[2.5]" />
            <span>Klien (Client)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('workers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border cursor-pointer
              ${activeTab === 'workers'
                ? 'bg-teal-50 text-teal-600 border-teal-100 shadow-xs'
                : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
              }`}
          >
            <Users size={14} className="stroke-[2.5]" />
            <span>Pekerja (Worker)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'clients' ? (
            <InnerClients />
          ) : (
            <InnerWorkers />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Inner Clients Component
const InnerClients = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getClients();
      setClients(res || []);
    } catch (err) {
      console.error("Fetch clients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
            Daftar Klien (Client)
          </h3>
          <span className="bg-teal-50 text-teal-600 font-black text-xs px-2.5 py-1 rounded-full border border-teal-100">
            {filteredClients.length} KLIEN
          </span>
        </div>
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-w-0">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <AlertCircle size={36} className="stroke-1.5 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider">Tidak ada klien ditemukan</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-4 font-bold">Profil</th>
                <th className="pb-4 font-bold">Nama Lengkap</th>
                <th className="pb-4 font-bold">Kontak</th>
                <th className="pb-4 font-bold">Alamat</th>
                <th className="pb-4 font-bold text-center">Status Akun</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id || client.UserID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <td className="py-4">
                    <img
                      src={client.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                  </td>
                  <td className="py-4">
                    <div className="font-extrabold text-slate-800 text-sm leading-tight">{client.name}</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">ID: {String(client.id || client.UserID).slice(0, 8)}</div>
                  </td>
                  <td className="py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <Mail size={12} className="text-slate-400" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Phone size={12} className="text-slate-400" />
                      <span>{client.phone || client.phoneNumber || '-'}</span>
                    </div>
                  </td>
                  <td className="py-4 max-w-xs">
                    <div className="flex items-start gap-1 text-slate-600 font-medium leading-relaxed truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{client.address || 'Indonesia'}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Inner Workers Component
const InnerWorkers = () => {
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
      console.error("Fetch workers error:", err);
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
      showAlert("Berhasil", "success", "Status verifikasi worker berhasil diubah.");
      fetchWorkers();
    } catch (err) {
      showAlert("Gagal", "error", "Gagal mengubah status verifikasi: " + err.message);
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.phone && w.phone.includes(searchQuery));
    
    const matchesStatus = 
      statusFilter === 'All' || 
      w.ktpStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 select-none">
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
                  <tr key={worker.id || worker.WorkerID} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                    <td className="py-4">
                      <img
                        src={worker.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={worker.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      />
                    </td>
                    <td className="py-4">
                      <div className="font-extrabold text-slate-800 text-sm leading-tight">{worker.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">ID: {String(worker.id || worker.WorkerID).slice(0, 8)}</div>
                    </td>
                    <td className="py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span>{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{worker.phone || worker.phoneNumber || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star size={12} fill="currentColor" />
                          <span>{worker.rating ? Number(worker.rating).toFixed(1) : '5.0'}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{worker.jobsDone || 0} Job</span>
                      </div>
                      <div className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                        Exp: {worker.experienceYear || 0} Tahun
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${vColors[worker.ktpStatus] || vColors['Not_Submitted']}`}>
                        {vLabels[worker.ktpStatus] || 'Belum Diajukan'}
                      </span>
                    </td>
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
                            onClick={() => handleVerify(worker.id || worker.WorkerID, 'Verified')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all border border-emerald-100 cursor-pointer"
                            title="Setujui Verifikasi KTP"
                          >
                            <Check size={14} className="stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => handleVerify(worker.id || worker.WorkerID, 'Rejected')}
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
  );
};

export default AdminUsers;
