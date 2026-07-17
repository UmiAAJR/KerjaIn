import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ShieldCheck, UserX, UserCheck } from 'lucide-react';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await adminApi.getClients();
      setClients(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleStatusToggle = (userId, currentStatus) => {
    // Simulate toggling suspension status
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const updated = clients.map(c => {
      if (c.userId === userId) {
        c.status = nextStatus;
      }
      return c;
    });
    setClients(updated);
    alert(`Status client berhasil diubah menjadi ${nextStatus}`);
  };

  if (loading) {
    return (
      <AdminLayout title="Manajemen Client">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Client">
      <Card className="border border-slate-100 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Nomor Telepon</th>
                <th className="px-6 py-4">Tanggal Bergabung</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {clients.map((client) => (
                <tr key={client.userId} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img 
                      src={client.photo} 
                      alt={client.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        {client.name}
                        {client.verified && (
                          <ShieldCheck size={14} className="text-primary-600" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{client.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{client.phone}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold">{client.joinedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase
                      ${client.status === 'Active' ? 'bg-success-100 text-success-700' : 'bg-accent-100 text-accent-700'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant={client.status === 'Active' ? 'danger' : 'success'}
                      size="sm"
                      onClick={() => handleStatusToggle(client.userId, client.status)}
                    >
                      {client.status === 'Active' ? (
                        <>
                          <UserX size={12} className="mr-1" /> Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} className="mr-1" /> Aktifkan
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminClients;
