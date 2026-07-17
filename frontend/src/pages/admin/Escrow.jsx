import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Wallet, Check, Landmark } from 'lucide-react';

const AdminEscrow = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEscrow = async () => {
    try {
      const res = await adminApi.getEscrowList();
      setList(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow();
  }, []);

  const handleRelease = async (jobId) => {
    try {
      await adminApi.releaseEscrow(jobId);
      alert('Dana Escrow berhasil dirilis secara manual ke saldo wallet Pekerja.');
      fetchEscrow();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Manajemen Dana Escrow">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Dana Escrow">
      <Card className="border border-slate-100 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Transaksi ID</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Pihak Terkait</th>
                <th className="px-6 py-4">Jumlah Nominal</th>
                <th className="px-6 py-4">Status Escrow</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {list.map((item) => (
                <tr key={item.escrowId} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{item.escrowId}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{item.service}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tanggal: {item.createdAt}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-slate-600">Klien: {item.client}</p>
                    <p className="text-xs font-semibold text-slate-600">Pekerja: {item.worker}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800">
                    Rp{item.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase
                      ${item.status === 'Released' ? 'bg-success-100 text-success-700' : ''}
                      ${item.status === 'Holding' ? 'bg-warning-100 text-warning-700 animate-pulse' : ''}
                      ${item.status === 'Refunded' ? 'bg-slate-100 text-slate-600' : ''}
                      ${item.status === 'Released_Withdrawn' ? 'bg-indigo-100 text-indigo-700' : ''}
                    `}>
                      {item.status === 'Holding' && 'Ditahan (Holding)'}
                      {item.status === 'Released' && 'Dirilis (Released)'}
                      {item.status === 'Refunded' && 'Refunded'}
                      {item.status === 'Released_Withdrawn' && 'Telah Ditarik (Withdrawn)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'Holding' && (
                      <Button
                        size="sm"
                        className="py-1.5 font-bold text-xs"
                        onClick={() => handleRelease(item.jobId)}
                      >
                        <Check size={12} className="mr-1" /> Rilis Dana
                      </Button>
                    )}
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

export default AdminEscrow;
