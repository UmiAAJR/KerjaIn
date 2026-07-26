import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { ChevronLeft, QrCode, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EscrowPayment() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const tracking = await clientApi.getJobTracking(jobId);
        // Find in history to get full pricing details
        const historyList = await clientApi.getHistory();
        const found = historyList.find(j => j.jobId === jobId);
        if (found) {
          setJob(found);
        } else {
          // Fallback if not found in history yet
          setJob({
            jobId: tracking.jobId,
            service: tracking.worker.workerName,
            price: tracking.smartWage.recommendedPrice,
            status: tracking.status
          });
        }
      } catch (err) {
        console.error('Gagal mengambil detail pembayaran:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      await clientApi.createEscrowPayment(job.jobId, job.price, 'QRIS');
      setPaid(true);
      setTimeout(() => {
        navigate(`/client/tracking/${job.jobId}`);
      }, 2000);
    } catch (err) {
      alert('Pembayaran gagal: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pembayaran Escrow" }}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!job) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pembayaran Escrow" }}>
        <div className="text-center py-16 space-y-4">
          <p className="text-sm font-bold text-slate-500">Pekerjaan tidak ditemukan.</p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="px-5 py-2.5 bg-[#046c7a] text-white text-xs font-bold rounded-xl"
          >
            Kembali
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Pembayaran QRIS",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24 text-left">
        <div className="px-5 pt-4 pb-8 space-y-4">
          
          {/* Back button */}
          <button
            onClick={() => navigate(`/client/dashboard`)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#046c7a] hover:underline cursor-pointer"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span>Kembali ke Dasbor</span>
          </button>

          {paid ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-md text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-lg font-black text-slate-800 font-heading">Pembayaran Berhasil!</h2>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Dana escrow sebesar <strong>Rp {job.price.toLocaleString('id-ID')}</strong> telah berhasil diamankan di platform KerjaIn. Anda akan dialihkan ke halaman pelacakan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Payment Details Box */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Layanan Jasa</span>
                    <span className="text-xs font-black text-slate-700 mt-0.5 block">{job.service}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Bayar</span>
                    <span className="text-sm font-black text-[#046c7a] mt-0.5 block">
                      Rp {job.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="border-b border-slate-100 my-1" />

                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                  <ShieldCheck size={16} className="text-[#046c7a] shrink-0" />
                  <span>Escrow Aman: Uang Anda hanya akan dilepaskan ke pekerja setelah pekerjaan terkonfirmasi selesai.</span>
                </div>
              </div>

              {/* QRIS Code Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-lg font-black text-slate-800 tracking-tight font-heading">QRIS</span>
                  <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">DYNAMIC</span>
                </div>

                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Pindai kode QR di bawah ini untuk membayar</p>
                
                {/* Simulated QR Image */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=kerjain-escrow-payment-${job.jobId}`}
                    alt="QRIS Code"
                    className="w-48 h-48 rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 opacity-0 hover:opacity-100 transition-opacity">
                    <QrCode size={36} className="text-[#046c7a]" />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2">
                  <div className="flex gap-2 text-slate-500 text-xs font-semibold leading-relaxed">
                    <span className="text-[#046c7a] font-bold">1.</span>
                    <span>Buka aplikasi dompet digital (GoPay, OVO, Dana) atau Mobile Banking.</span>
                  </div>
                  <div className="flex gap-2 text-slate-500 text-xs font-semibold leading-relaxed">
                    <span className="text-[#046c7a] font-bold">2.</span>
                    <span>Pindai QR code di atas, periksa nama merchant **KerjaIn Escrow**.</span>
                  </div>
                  <div className="flex gap-2 text-slate-500 text-xs font-semibold leading-relaxed">
                    <span className="text-[#046c7a] font-bold">3.</span>
                    <span>Masukkan PIN pembayaran Anda. Transaksi Anda akan otomatis terdeteksi.</span>
                  </div>
                </div>
              </div>

              {/* Simulation Trigger (For Offline Test Mode) */}
              <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100/70 space-y-3">
                <div className="flex gap-2.5 items-start">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800 tracking-tight">Simulasi Pengujian Offline</h4>
                    <p className="text-[10px] text-amber-700 font-semibold leading-relaxed mt-1">
                      Gunakan tombol di bawah untuk menyimulasikan notifikasi sukses pembayaran dari webhook Midtrans ke backend KerjaIn.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSimulatePayment}
                  disabled={paying}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-xs font-black rounded-2xl text-center shadow-md shadow-amber-100 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {paying ? 'Memproses Simulasi...' : 'Bayar Menggunakan QRIS (Simulasi)'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </MobileLayout>
  );
}
