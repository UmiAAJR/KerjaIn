import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Landmark, CheckCircle, AlertCircle } from 'lucide-react';

const WorkerWallet = () => {
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Withdraw modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchWalletData = async () => {
    if (user?.id) {
      try {
        const res = await workerApi.getWallet(user.id);
        setWallet(res);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    
    if (Number(amount) > wallet.summary.withDrawable) {
      alert('Saldo tidak mencukupi untuk jumlah penarikan ini.');
      return;
    }

    setWithdrawing(true);
    try {
      await workerApi.withdraw(user.id, Number(amount));
      
      // Simulate deduction in local database
      const currentJobs = JSON.parse(localStorage.getItem('ki_jobs')) || [];
      const updatedJobs = currentJobs.map(j => {
        if (j.workerId === user.id) {
          // Adjust price status
          j.escrowStatus = 'Released_Withdrawn';
        }
        return j;
      });
      localStorage.setItem('ki_jobs', JSON.stringify(updatedJobs));

      setIsWithdrawOpen(false);
      setSuccess(true);
      setAmount('');
      await fetchWalletData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Gagal memproses penarikan dana');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Dompet Saya">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dompet Saya">
      <div className="px-5 py-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6" />
          
          <div className="space-y-1">
            <span className="text-[10px] text-primary-100 font-bold uppercase tracking-wider">Total Saldo Aktif</span>
            <h2 className="text-2xl font-black font-heading">Rp{wallet?.summary?.balance?.toLocaleString('id-ID')}</h2>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div>
              <p className="text-[9px] text-primary-100 font-semibold uppercase">Bisa Ditarik</p>
              <p className="text-xs font-bold">Rp{wallet?.summary?.withDrawable?.toLocaleString('id-ID')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-slate-50 text-primary-700 border-none px-4 py-2"
              onClick={() => setIsWithdrawOpen(true)}
              disabled={wallet?.summary?.withDrawable <= 0}
            >
              <ArrowUpRight size={14} className="mr-1" /> Tarik Uang
            </Button>
          </div>
        </div>

        {success && (
          <div className="bg-success-50 text-success-600 text-xs font-bold p-3.5 rounded-xl border border-success-100 flex items-center gap-2">
            <CheckCircle size={16} /> Penarikan berhasil diproses! Silakan cek notifikasi.
          </div>
        )}

        {/* Transaction History */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Riwayat Transaksi</h4>
          
          {wallet?.transactions?.length === 0 ? (
            <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl">
              <p className="text-xs font-bold text-slate-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallet.transactions.map((tx) => (
                <div key={tx.transactionId} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success-50 text-success-600 rounded-xl">
                      <ArrowDownLeft size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{tx.type}</h5>
                      <span className="text-[9px] text-slate-400 font-medium">{tx.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-success-600">+Rp{tx.amount.toLocaleString('id-ID')}</span>
                    <p className="text-[9px] text-slate-400 font-semibold">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Tarik Saldo"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-slate-500">
            <Landmark size={18} className="text-primary-600" />
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rekening Tujuan</p>
              <p className="text-xs font-bold text-slate-700">{user?.bankAccount || 'Belum diatur (Silakan update profil)'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">Maks. Penarikan:</span>
            <span className="font-black text-slate-800">Rp{wallet?.summary?.withDrawable?.toLocaleString('id-ID')}</span>
          </div>

          <Input
            label="Jumlah Penarikan (Rp)"
            type="number"
            placeholder="Min. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            id="withdraw-amount"
            min="50000"
            max={wallet?.summary?.withDrawable}
          />

          <Button
            type="submit"
            className="w-full text-center flex justify-center py-3"
            disabled={withdrawing || !user?.bankAccount}
          >
            {withdrawing ? 'Memproses...' : 'Tarik Uang Sekarang'}
          </Button>
        </form>
      </Modal>
    </MobileLayout>
  );
};

export default WorkerWallet;
