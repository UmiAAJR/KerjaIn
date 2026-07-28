import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { 
  Bell, 
  Send, 
  Trash, 
  Search, 
  AlertCircle, 
  Smartphone,
  Info,
  Calendar,
  Layers,
  Link as LinkIcon
} from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('system'); // 'system' | 'payment' | 'booking' | 'panic'
  const [role, setRole] = useState('all'); // 'all' | 'client' | 'worker'
  const [actionLink, setActionLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getNotifications();
      setNotifications(res || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Judul dan Deskripsi wajib diisi!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        role,
        actionLink: actionLink.trim()
      };
      
      await adminApi.createNotification(payload);
      alert("Notifikasi berhasil disiarkan (broadcast)!");
      
      // Reset form
      setTitle('');
      setDescription('');
      setActionLink('');
      setType('system');
      setRole('all');
      
      // Refresh list
      fetchNotifications();
    } catch (err) {
      alert("Gagal menyiarkan notifikasi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus notifikasi ini dari sistem?")) return;
    try {
      await adminApi.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      alert("Gagal menghapus notifikasi: " + err.message);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.role && n.role.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'All' || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getNotificationIcon = (notifType) => {
    switch (notifType) {
      case 'payment':
        return '💰';
      case 'booking':
        return '📅';
      case 'panic':
        return '🚨';
      default:
        return '📢';
    }
  };

  return (
    <AdminLayout activeMenu="notifications">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 select-none">
        
        {/* Left Side: Broadcast Form & Mobile Live Preview */}
        <div className="xl:col-span-5 space-y-6 flex flex-col min-w-0">
          
          {/* Broadcast Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Send size={15} className="text-teal-600" />
              <span>Broadcast Notifikasi Baru</span>
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              
              {/* Recipient Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran Penerima (Target Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
                >
                  <option value="all">Semua Pengguna (All Users)</option>
                  <option value="client">Klien Saja (Clients Only)</option>
                  <option value="worker">Pekerja Saja (Workers Only)</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Notifikasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Pemeliharaan Server Sistem"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Pesan</label>
                <textarea
                  placeholder="Contoh: Aplikasi akan mengalami gangguan pada pukul 23:00 WIB..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Type and Action Link Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe Notif</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
                  >
                    <option value="system">Sistem (📢)</option>
                    <option value="payment">Keuangan (💰)</option>
                    <option value="booking">Pesanan (📅)</option>
                    <option value="panic">SOS/Panic (🚨)</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Link (Opsi)</label>
                  <input
                    type="text"
                    placeholder="/worker/wallet"
                    value={actionLink}
                    onChange={(e) => setActionLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-teal-500/5 active:scale-[0.98] disabled:opacity-50"
              >
                <Send size={14} className="stroke-[2.5]" />
                <span>{submitting ? 'Mengirim...' : 'Siarkan Sekarang'}</span>
              </button>

            </form>
          </div>

          {/* Live Mobile Device Mockup Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center space-y-4 text-white relative overflow-hidden">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Smartphone size={13} />
              <span>Simulasi Live Ponsel</span>
            </h4>
            
            {/* Simulated Phone Body */}
            <div className="w-64 h-48 bg-slate-950 rounded-3xl border-4 border-slate-800 p-3 relative flex flex-col justify-start overflow-hidden shadow-inner">
              {/* Camera Notch */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-full flex items-center justify-center z-20">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 px-2 pt-2 pb-1.5 border-b border-slate-900 select-none">
                <span>12:48</span>
                <span className="flex items-center gap-1">5G 🔋 98%</span>
              </div>

              {/* App Notification Banner */}
              <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-xl flex items-start gap-2 animate-bounce">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-sm shrink-0">
                  {getNotificationIcon(type)}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-teal-400 truncate max-w-[80px]">{title || 'Judul Notifikasi'}</span>
                    <span className="text-[7px] font-bold text-slate-500">SEKARANG</span>
                  </div>
                  <p className="text-[8px] font-semibold text-slate-300 leading-normal line-clamp-2 mt-0.5">
                    {description || 'Deskripsi pesan akan ditampilkan secara detail di panel notifikasi HP pengguna.'}
                  </p>
                </div>
              </div>

              {/* Simulated wallpaper detail */}
              <div className="flex-grow flex items-end justify-center pb-2">
                <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase">KerjaIn App</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Sent History List */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col min-w-0 min-h-[500px]">
          
          {/* History Header & Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                Log Histori Siaran Notifikasi
              </h3>
              <span className="bg-teal-50 text-teal-600 font-black text-[10px] px-2.5 py-1 rounded-full border border-teal-100">
                {filteredNotifs.length} RIWAYAT
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer shrink-0"
              >
                <option value="All">Semua Tipe</option>
                <option value="system">Sistem (📢)</option>
                <option value="payment">Keuangan (💰)</option>
                <option value="booking">Pesanan (📅)</option>
                <option value="panic">SOS/Panic (🚨)</option>
              </select>

              <div className="relative w-full">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Cari judul, konten, peran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="overflow-x-auto min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <AlertCircle size={32} className="stroke-1.5 text-slate-350" />
                <p className="text-xs font-bold uppercase tracking-wider">Tidak ada riwayat notifikasi</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-4 font-bold">Notifikasi</th>
                    <th className="pb-4 font-bold">Target Peran</th>
                    <th className="pb-4 font-bold text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifs.map((n) => {
                    const id = n.NotificationID || n.notificationId;
                    const dateText = n.createdAt ? n.createdAt.replace('T', ' ').slice(0, 16) : 'Hari ini';
                    
                    return (
                      <tr key={id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                        
                        {/* Title & Desc */}
                        <td className="py-4 pr-4">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base mt-0.5 shrink-0" title={`Tipe: ${n.type}`}>
                              {getNotificationIcon(n.type)}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-800 text-xs leading-snug">{n.title}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal mt-1">{n.description}</p>
                              {n.actionLink && (
                                <div className="text-[8px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1.5">
                                  <LinkIcon size={8} />
                                  <span>{n.actionLink}</span>
                                </div>
                              )}
                              <div className="text-[8px] font-semibold text-slate-400 mt-2 flex items-center gap-1 leading-none">
                                <Calendar size={10} />
                                <span>{dateText}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Role */}
                        <td className="py-4 font-bold text-slate-600 uppercase">
                          {n.role === 'all' ? (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] border border-slate-250">SEMUA (ALL)</span>
                          ) : n.role === 'client' ? (
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] border border-indigo-100">KLIEN (CLIENT)</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px] border border-amber-100">PEKERJA (WORKER)</span>
                          )}
                        </td>

                        {/* Action Delete */}
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                            title="Hapus Notifikasi"
                          >
                            <Trash size={14} />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
