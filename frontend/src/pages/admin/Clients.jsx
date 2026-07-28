import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { Mail, Phone, MapPin, Search, AlertCircle } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getClients();
      setClients(res || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

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
        
        {/* Header & Search */}
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

        {/* Clients Table */}
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
                  <tr key={client.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                    
                    {/* Photo */}
                    <td className="py-4">
                      <img
                        src={client.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={client.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      />
                    </td>

                    {/* Name */}
                    <td className="py-4">
                      <div className="font-extrabold text-slate-800 text-sm leading-tight">
                        {client.name}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                        ID: {client.id}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Mail size={12} className="text-slate-400" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Phone size={12} className="text-slate-400" />
                        <span>{client.phone || '-'}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4 max-w-xs">
                      <div className="flex items-start gap-1 text-slate-600 font-medium leading-relaxed truncate">
                        <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{client.address || 'Jakarta, Indonesia'}</span>
                      </div>
                    </td>

                    {/* Status */}
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
    </AdminLayout>
  );
};

export default AdminClients;
