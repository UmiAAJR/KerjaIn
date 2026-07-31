import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import { showAlert } from '../../utils/swal';
import MobileLayout from '../../components/layout/MobileLayout';
import { 
  ChevronLeft, 
  QrCode, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  ExternalLink, 
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';

export default function EscrowPayment() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [snapLoading, setSnapLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const tracking = await clientApi.getJobTracking(jobId);
        // Find in history to get full pricing details
        const historyList = await clientApi.getHistory();
        const found = historyList.find(j => j.jobId === jobId || j.JobID === jobId);
        if (found) {
          setJob(found);
        } else {
          setJob({
            jobId: tracking.jobId || jobId,
            service: tracking.service || tracking.worker?.workerName || 'Layanan KerjaIn',
            price: tracking.price || tracking.smartWage?.recommendedPrice || 50000,
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

  // Dynamically load Midtrans Snap JS SDK (Sandbox Mode)
  useEffect(() => {
    const snapUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "SB-Mid-client-dummy";
    
    let script = document.querySelector(`script[src="${snapUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      document.body.appendChild(script);
    }
  }, []);

  // MIDTRANS SNAP PAYMENT (DISABLED FOR NOW)
  const handleMidtransSnapPayment = () => {
    showAlert('Masih Dalam Pengembangan', 'info', 'Fitur pembayaran otomatis via Midtrans sedang disiapkan.');
  };

  // SIMULATED INSTANT PAYMENT (BYPASS)
  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      await clientApi.createEscrowPayment(job.jobId, job.price, 'QRIS_SIMULATED');
      setPaid(true);
      setTimeout(() => {
        navigate(`/client/tracking/${job.jobId}`);
      }, 2000);
    } catch (err) {
      showAlert('Pembayaran Gagal', 'error', err.message);
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
            className="px-5 py-2.5 bg-[#046c7a] text-white text-xs font-bold rounded-xl cursor-pointer"
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
        brandName: "Pembayaran Escrow",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24 text-left">
        <div className="px-5 pt-4 pb-8 space-y-4">
          
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/client/dashboard`)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#046c7a] hover:underline cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              <span>Kembali ke Dasbor</span>
            </button>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              SANDBOX TEST MODE
            </span>
          </div>

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
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
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
                  <span>Escrow Aman: Dana hanya akan dilepaskan ke pekerja setelah pekerjaan selesai & terkonfirmasi.</span>
                </div>
              </div>

              {/* MIDTRANS PAYMENT (DISABLED / IN DEVELOPMENT) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>Midtrans Gateway</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-md font-bold">DALAM PENGEMBANGAN</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">QRIS, Virtual Account, E-Wallet</p>
                  </div>
                </div>

                <button
                  onClick={handleMidtransSnapPayment}
                  className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-2xl text-center shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Sparkles size={16} />
                  <span>Bayar via Midtrans Snap</span>
                </button>
              </div>

              {/* BYPASS PAYMENT (FAST FORWARD / SIMULATOR) */}
              <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck size={20} className="text-[#046c7a] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 tracking-tight">Bypass Pembayaran Escrow</h4>
                    <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed mt-1">
                      Klik tombol di bawah untuk menyetujui pembayaran escrow secara langsung (Bypass) dan melanjutkan ke pelacakan pekerjaan.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSimulatePayment}
                  disabled={paying}
                  className="w-full py-3.5 bg-[#046c7a] hover:bg-[#035f6b] disabled:bg-slate-300 text-white text-xs font-black rounded-2xl text-center shadow-md active:scale-[0.99] transition-all cursor-pointer"
                >
                  {paying ? 'Memproses Pembayaran...' : 'Bypass & Bayar Instan'}
                </button>
              </div>


            </div>
          )}

        </div>
      </div>
    </MobileLayout>
  );
}
