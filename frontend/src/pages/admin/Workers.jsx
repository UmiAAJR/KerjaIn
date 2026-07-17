import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ShieldCheck, UserX, UserCheck, Star } from 'lucide-react';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const res = await adminApi.getWorkers();
      setWorkers(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleStatusToggle = (workerId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Suspended' : 'Available';
    const updated = workers.map(w => {
      if (w.id === workerId) {
        w.status = nextStatus;
      }
      return w;
    });
    setWorkers(updated);
    
    // Save to localStorage
    localStorage.setItem('ki_workers', JSON.stringify(updated));
    alert(`Status worker berhasil diubah menjadi ${nextStatus}`);
  };

  if (loading) {
    return (
      <AdminLayout title="Manajemen Worker">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Worker">
      <Card className="border border-slate-100 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Tarif Terdekat</th>
                <th className="px-6 py-4">Rating & Review</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img 
                      src={worker.photo} 
                      alt={worker.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        {worker.name}
                        {worker.verified && (
                          <ShieldCheck size={14} className="text-primary-600" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">ID: {worker.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">Rp{worker.hourlyRate.toLocaleString('id-ID')}/jam</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{worker.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-warning-500">
                      <Star size={14} fill="currentColor" />
                      <span className="font-bold text-slate-700">{worker.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{worker.jobsDone} Order Selesai</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase
                      ${worker.status === 'Suspended' ? 'bg-accent-100 text-accent-700' : 'bg-success-100 text-success-700'}`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant={worker.status === 'Suspended' ? 'success' : 'danger'}
                      size="sm"
                      onClick={() => handleStatusToggle(worker.id, worker.status)}
                    >
                      {worker.status === 'Suspended' ? (
                        <>
                          <UserCheck size={12} className="mr-1" /> Aktifkan
                        </>
                      ) : (
                        <>
                          <UserX size={12} className="mr-1" /> Suspend
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

export default AdminWorkers;
