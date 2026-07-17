import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import MobileLayout from '../../components/layout/MobileLayout';
import Button from '../../components/ui/Button';
import { ChevronLeft, ShieldCheck, Wallet, CreditCard, Landmark, CheckCircle } from 'lucide-react';

const EscrowPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { payEscrow } = useJobs();
  const job = location.state?.job || null;

  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!job) return;
    setPaying(true);
    setError('');
    try {
      await payEscrow(job.jobId, job.price, paymentMethod);
      navigate(`/client/tracking/${job.jobId}`);
    } catch (err) {
      setError(err.message || 'Pembayaran gagal.');
      setPaying(false);
    }
  };

  if (!job) {
    return (
      <MobileLayout title="Pembayaran Escrow">
        <div className="p-5 text-center space-y-4">
          <p className="text-sm font-bold text-accent-600">Pemesanan tidak ditemukan.</p>
          <Button onClick={() => navigate('/client/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </MobileLayout>
    );
  }

  const methods = [
    { id: 'qris', name: 'QRIS (Gopay, OVO, Dana)', icon: CreditCard },
    { id: 'va', name: 'Virtual Account (BCA, Mandiri, BNI)', icon: Landmark },
    { id: 'wallet', name: 'Saldo KerjaIn Wallet', icon: Wallet }
  ];

  return (
    <MobileLayout title="Pembayaran Escrow">
      <div className="px-5 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold"
        >
          <ChevronLeft size={16} /> Batal
        </button>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* Total Price Summary */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pembayaran</p>
          <h2 className="text-2xl font-black font-heading">Rp{job.price.toLocaleString('id-ID')}</h2>
          <div className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700/50 mt-2">
            <CheckCircle size={10} className="text-success-500" />
            Booking ID: {job.jobId}
          </div>
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 space-y-2">
          <div className="flex items-center gap-1.5 text-primary-600">
            <ShieldCheck size={18} />
            <h4 className="text-xs font-extrabold font-heading">Sistem Escrow Garansi KerjaIn</h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
            Dana Anda ditampung dengan aman dan hanya akan dikirimkan kepada Pekerja setelah pekerjaan terselesaikan dengan baik dan Anda memberikan konfirmasi penyelesaian.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Pilih Metode Pembayaran</h4>
          <div className="space-y-2.5">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center justify-between p-4 bg-white border rounded-2xl transition-all duration-200
                    ${paymentMethod === method.id 
                      ? 'border-primary-600 ring-2 ring-primary-100' 
                      : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentMethod === method.id ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{method.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                    ${paymentMethod === method.id ? 'border-primary-600 bg-primary-600' : 'border-slate-300 bg-white'}`}>
                    {paymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-accent-50 text-accent-600 text-xs font-semibold p-3 rounded-xl border border-accent-100">
            {error}
          </div>
        )}

        <Button
          onClick={handlePay}
          className="w-full text-center flex justify-center py-3.5"
          disabled={paying}
        >
          {paying ? 'Memproses Transaksi...' : `Bayar Rp${job.price.toLocaleString('id-ID')}`}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default EscrowPayment;
