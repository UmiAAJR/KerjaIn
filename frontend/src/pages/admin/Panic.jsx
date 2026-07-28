import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { 
  AlertOctagon, 
  Phone, 
  MapPin, 
  User, 
  Clock, 
  Check, 
  ShieldAlert, 
  ExternalLink,
  Search,
  Briefcase
} from 'lucide-react';

const AdminPanic = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Resolved'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPanicAlerts();
      setAlerts(res || []);
      
      // If we already have a selected alert, refresh its details too
      if (selectedAlert) {
        const jobId = selectedAlert.JobID || selectedAlert.jobId;
        const details = await adminApi.getPanicDetail(jobId);
        setSelectedDetails(details);
      }
    } catch (err) {
      console.error("Error fetching panic alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSelectAlert = async (alert) => {
    try {
      setSelectedAlert(alert);
      setSelectedDetails(null);
      const jobId = alert.JobID || alert.jobId;
      const details = await adminApi.getPanicDetail(jobId);
      setSelectedDetails(details);
    } catch (err) {
      alert("Gagal memuat detail emergency: " + err.message);
    }
  };

  const handleResolveAlert = async (jobId) => {
    if (!window.confirm("Apakah Anda yakin situasi darurat ini telah teratasi? Peringatan panic akan dinonaktifkan.")) return;
    try {
      setActionLoading(true);
      await adminApi.resolvePanic(jobId);
      alert("Situasi darurat berhasil ditandai selesai.");
      setSelectedAlert(null);
      setSelectedDetails(null);
      fetchAlerts();
    } catch (err) {
      alert("Gagal meresolusi peringatan: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const worker = a.workerName || '';
    const matchesSearch = worker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.PanicID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.JobID || a.jobId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && a.status === 'Active') ||
                          (statusFilter === 'Resolved' && a.status !== 'Active');

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout activeMenu="panic">
      <div className="space-y-6 select-none">
        
        {/* Panic Alerts Dashboard Banner */}
        <div className="bg-rose-900 border border-rose-800 rounded-3xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6">
            <ShieldAlert size={280} className="text-white" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-widest bg-rose-800 text-rose-300 px-3 py-1 rounded-full border border-rose-700/60 uppercase">
                Pusat Kontrol Keamanan (SOS)
              </span>
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight">SOS & Peringatan Darurat Pekerja</h2>
            <p className="text-rose-200/90 text-xs font-semibold max-w-xl leading-relaxed">
              Memantau sinyal panic dari pekerja di lapangan secara real-time. Hubungi pekerja bersangkutan dan koordinasikan bantuan segera demi keselamatan.
            </p>
          </div>

          <div className="bg-rose-950/45 border border-rose-800/50 rounded-2xl px-6 py-4 relative z-10 shrink-0 text-center">
            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Peringatan Aktif</div>
            <div className="text-4xl font-black text-rose-200 mt-1">
              {alerts.filter(a => a.status === 'Active').length}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Alerts List Pane */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col min-w-0">
            
            {/* List Header & Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                  Daftar Peringatan SOS
                </h3>
                <span className="bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-rose-100">
                  {filteredAlerts.length} ALERTS
                </span>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-rose-500 transition-all cursor-pointer shrink-0"
                >
                  <option value="All">Semua Status</option>
                  <option value="Active">Aktif (SOS)</option>
                  <option value="Resolved">Selesai</option>
                </select>

                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari pekerja, ID Panic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* List Container */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                  <AlertOctagon size={36} className="stroke-1.5 text-slate-300 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">Aman. Tidak ada darurat aktif.</p>
                </div>
              ) : (
                filteredAlerts.map((item) => {
                  const alertId = item.PanicID || item.panicId;
                  const isSelected = selectedAlert && (selectedAlert.PanicID === item.PanicID || selectedAlert.panicId === item.panicId);
                  
                  return (
                    <div
                      key={alertId}
                      onClick={() => handleSelectAlert(item)}
                      className={`p-4 rounded-2xl border transition-all duration-250 cursor-pointer flex items-center gap-4 relative overflow-hidden group
                        ${isSelected 
                          ? 'border-rose-300 bg-rose-50/50 shadow-sm' 
                          : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50/60'}`}
                    >
                      {/* Pulse ring for active alerts */}
                      {item.status === 'Active' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600 animate-pulse"></div>
                      )}

                      {/* Photo / SOS Icon */}
                      <div className="relative shrink-0">
                        <img
                          src={item.workerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                          alt={item.workerName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div className={`absolute -right-1.5 -bottom-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs
                          ${item.status === 'Active' ? 'bg-rose-600 text-white animate-bounce' : 'bg-slate-400 text-white'}`}>
                          <AlertOctagon size={12} className="stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Alert Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-black text-slate-800 truncate leading-snug group-hover:text-rose-600 transition-colors">
                            {item.workerName || 'Pekerja Lapangan'}
                          </h4>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">
                            {item.createdAt ? item.createdAt.split(' ')[1] : ''}
                          </span>
                        </div>
                        
                        <p className="text-[10px] font-semibold text-slate-400 leading-none mt-1 truncate">
                          ID Panic: {alertId}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border
                            ${item.status === 'Active' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {item.status === 'Active' ? 'SOS DARURAT' : 'SELESAI'}
                          </span>
                          
                          <span className="text-[9px] font-semibold text-slate-500 leading-none">
                            Lat: {Number(item.latitude).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Alert Details Center */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col min-h-[400px]">
            {!selectedAlert ? (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-3 py-20 select-none">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <ShieldAlert size={26} />
                </div>
                <p className="text-xs font-black uppercase tracking-wider">Pilih salah satu peringatan SOS untuk memantau detail</p>
              </div>
            ) : !selectedDetails ? (
              <div className="flex-grow flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Detail Header */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border
                        ${selectedDetails.status === 'Active' 
                          ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {selectedDetails.status === 'Active' ? 'PULSE DARURAT AKTIF' : 'TERATASI'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {selectedDetails.createdAt}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 font-heading">
                      SOS ID: {selectedDetails.PanicID || selectedAlert.PanicID || selectedAlert.panicId}
                    </h3>
                  </div>

                  {selectedDetails.status === 'Active' && (
                    <button
                      onClick={() => handleResolveAlert(selectedDetails.JobID || selectedDetails.job?.jobId)}
                      disabled={actionLoading}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl border border-emerald-400/20 shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <Check size={14} className="stroke-[2.5]" />
                      <span>Selesaikan Darurat</span>
                    </button>
                  )}
                </div>

                {/* Split Contacts: Worker & Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Worker Card */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedDetails.worker?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={selectedDetails.worker?.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Worker (Pekerja)</div>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{selectedDetails.worker?.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">ID: {selectedDetails.worker?.id}</span>
                      </div>
                    </div>
                    
                    <a
                      href={`tel:${selectedDetails.phone}`}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-100/60 rounded-xl text-rose-700 text-xs font-black transition-all"
                    >
                      <Phone size={13} className="stroke-[2.5]" />
                      <span>TELEPON WORKER ({selectedDetails.phone || 'N/A'})</span>
                    </a>
                  </div>

                  {/* Client Card */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                        <User size={18} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Klien (Pemesan)</div>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{selectedDetails.job?.clientName || 'Budi Santoso'}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">Hubungan Kontak Kerja</span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 leading-none py-2 border border-dashed border-slate-200 rounded-xl bg-white">
                      <span>Perantara Sistem Aktif</span>
                    </div>
                  </div>

                </div>

                {/* Job Context & Details */}
                <div className="p-5 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <Briefcase size={14} className="text-slate-400" />
                    <span>Informasi Pekerjaan Bersangkutan</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Jasa Layanan</div>
                      <div className="font-extrabold text-slate-700 mt-0.5">{selectedDetails.job?.service || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Job ID</div>
                      <div className="font-semibold text-slate-500 mt-0.5 uppercase">{selectedDetails.job?.jobId || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin size={10} />
                      <span>Alamat Kejadian</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                      {selectedDetails.job?.address || 'Lokasi tidak spesifik.'}
                    </p>
                  </div>
                </div>

                {/* Geolocation Map Panel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <MapPin size={14} className="text-rose-500" />
                      <span>Lokasi GPS Live</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      L: {selectedDetails.latitude}, T: {selectedDetails.longitude}
                    </span>
                  </div>

                  {/* Stylized Mock Map Visualizer */}
                  <div className="h-64 bg-slate-900 border border-slate-850 rounded-2xl relative overflow-hidden flex flex-col justify-end p-4">
                    {/* Pulsing GPS circles */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    
                    {/* Simulated map graphic elements */}
                    <div className="absolute top-1/3 left-1/4 w-32 h-2.5 bg-slate-800 rounded-full transform -rotate-12"></div>
                    <div className="absolute top-1/2 left-1/3 w-40 h-2 bg-slate-800 rounded-full transform rotate-45"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-28 h-3 bg-slate-800 rounded-full transform -rotate-45"></div>
                    
                    {/* The Worker Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <span className="flex h-12 w-12 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-12 w-12 bg-rose-600/35 border border-rose-500 flex items-center justify-center text-white">
                          <AlertOctagon size={16} className="stroke-[2.5]" />
                        </span>
                      </span>
                      <div className="mt-2 bg-rose-900 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-lg border border-rose-700/80 leading-none">
                        SOS WORKER
                      </div>
                    </div>

                    {/* Controls overlay */}
                    <div className="relative z-10 bg-slate-950/85 backdrop-blur-xs border border-slate-800 rounded-xl p-3 flex justify-between items-center text-slate-300">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Sinyal GPS Terkunci</p>
                        <p className="text-[9px] font-semibold text-slate-400 leading-none">Akurasi ~15 meter dari satelit telekomunikasi</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedDetails.latitude},${selectedDetails.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                        title="Buka Google Maps"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminPanic;
