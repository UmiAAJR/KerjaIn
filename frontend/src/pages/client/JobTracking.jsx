import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import { showAlert } from '../../utils/swal';
import MobileLayout from '../../components/layout/MobileLayout';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Star, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Banknote, 
  AlertCircle,
  Zap
} from 'lucide-react';
import ReviewModal from './components/ReviewModal';

export default function JobTracking() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Rating Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchTracking = async () => {
    try {
      const data = await clientApi.getJobTracking(jobId);
      setTracking(data);
    } catch (err) {
      console.error('Gagal memuat pelacakan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    // Poll status update every 5 seconds for real-time updates
    const timer = setInterval(() => {
      fetchTracking();
    }, 5000);

    return () => clearInterval(timer);
  }, [jobId]);

  const handleConfirmFinished = async () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await clientApi.submitReview(jobId, rating, comment);
      setShowReviewModal(false);
      await fetchTracking();
      showAlert('Berhasil!', 'success', 'Ulasan dan konfirmasi berhasil dikirim.');
    } catch (err) {
      showAlert('Gagal Mengirim Ulasan', 'error', err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const normalizeStatus = (status) => {
    if (status === 'ACCEPTED') return 'WORKER_ACCEPTED';
    if (status === 'WAIT_CONFIRM') return 'WAITING_CONFIRMATION';
    return status;
  };

  const getStatusIndex = (currentStatus) => {
    const s = normalizeStatus(currentStatus);
    const list = [
      'WAITING_PAYMENT',
      'ESCROW_PAID',
      'WORKER_ACCEPTED',
      'ON_THE_WAY',
      'IN_PROGRESS',
      'WAITING_CONFIRMATION',
      'COMPLETED'
    ];
    return list.indexOf(s);
  };

  const getStepLabel = (status) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'WAITING_PAYMENT': return 'Booking Dibuat (Menunggu Pembayaran)';
      case 'ESCROW_PAID': return 'Pembayaran Escrow Berhasil';
      case 'WORKER_ACCEPTED': return 'Pekerja Menerima Pesanan';
      case 'ON_THE_WAY': return 'Pekerja OTW ke Lokasi';
      case 'IN_PROGRESS': return 'Pekerjaan Sedang Dikerjakan';
      case 'WAITING_CONFIRMATION': return 'Pekerjaan Selesai (Menunggu Konfirmasi)';
      case 'COMPLETED': return 'Konfirmasi Selesai & Dana Dirilis';
      default: return status;
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pelacakan Pekerjaan" }}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!tracking) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pelacakan Pekerjaan" }}>
        <div className="text-center py-16 space-y-4 px-4">
          <p className="text-sm font-bold text-slate-500">Pekerjaan tidak ditemukan.</p>
          <button
            onClick={() => navigate('/client/history')}
            className="px-5 py-2.5 bg-[#046c7a] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Kembali ke Riwayat
          </button>
        </div>
      </MobileLayout>
    );
  }

  const currentStep = getStatusIndex(tracking.status);
  const normalizedSt = normalizeStatus(tracking.status);

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Pelacakan Pekerjaan",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-24 text-left space-y-4">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/client/history')}
          className="flex items-center gap-1 text-xs font-extrabold text-[#046c7a] hover:underline cursor-pointer"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span>Kembali ke Riwayat Pesanan</span>
        </button>

        {/* HEADER CARD - STATUS & PROGRESS BAR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs relative overflow-hidden space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Status Pekerjaan
            </span>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
              normalizedSt === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : normalizedSt === 'WAITING_CONFIRMATION'
                ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              {getStepLabel(tracking.status)}
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#046c7a] h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(15, Math.min(100, Math.round(((currentStep + 1) / 7) * 100)))}%`
                }}
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Langkah {Math.max(1, currentStep + 1)} dari 7
            </p>
          </div>
        </div>

        {/* WORKER PROFILE CARD */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={tracking.worker?.workerPhoto || tracking.workerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
              alt={tracking.worker?.workerName || tracking.workerName}
              className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
            />
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                {tracking.worker?.workerName || tracking.workerName || 'Pekerja KerjaIn'}
              </h3>
              <p className="text-xs text-[#046c7a] font-bold flex items-center gap-1 mt-0.5">
                <Zap size={12} />
                <span>{tracking.service || 'Layanan KerjaIn'}</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1">
                <Star size={11} className="fill-amber-400 text-amber-500" />
                <span className="text-slate-600">4.9 • Verified Worker</span>
              </div>
            </div>
          </div>
          
          <a
            href={`tel:${tracking.worker?.phone || tracking.workerPhone || '081299998888'}`}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-[#046c7a] transition-all cursor-pointer"
          >
            <Phone size={16} />
          </a>
        </div>

        {/* DYNAMIC ACTION CARDS */}
        {tracking.status === 'WAITING_PAYMENT' && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 shadow-xs space-y-3">
            <div className="flex items-start gap-2 text-xs font-bold text-amber-800 leading-relaxed">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>Pesanan berhasil dibuat. Segera bayar ke escrow agar pekerja dapat menerima tawaran Anda.</span>
            </div>
            <button
              onClick={() => navigate(`/client/booking/${tracking.jobId}/payment`)}
              className="w-full py-3 bg-[#046c7a] hover:bg-[#035f6b] text-white text-xs font-black rounded-xl text-center shadow-xs cursor-pointer transition-all active:scale-[0.99]"
            >
              Bayar Menggunakan QRIS (Simulasi)
            </button>
          </div>
        )}

        {(tracking.status === 'WAITING_CONFIRMATION' || tracking.status === 'WAIT_CONFIRM') && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-start gap-2 text-xs font-bold text-emerald-800 leading-relaxed">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Pekerja melaporkan pekerjaan telah selesai. Silakan periksa hasil kerja dan konfirmasi untuk melepaskan dana escrow.</span>
            </div>
            <button
              onClick={handleConfirmFinished}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl text-center shadow-xs cursor-pointer transition-all active:scale-[0.99]"
            >
              Konfirmasi Pekerjaan Selesai & Beri Ulasan
            </button>
          </div>
        )}

        {tracking.status === 'COMPLETED' && (
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-slate-800">Transaksi Selesai & Lunas</h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Seluruh dana escrow telah dilepaskan ke dompet pekerja.</p>
            </div>
          </div>
        )}

        {/* RINCIAN PESANAN CARD */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
            Rincian Pesanan
          </h3>

          <div className="flex flex-col gap-2 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> Lokasi
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[200px]">
                {tracking.address || 'Lokasi Pengerjaan'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" /> Jam / Waktu
              </span>
              <span className="font-bold text-slate-800">
                {tracking.schedule || 'Hari Ini'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 shrink-0" /> Tanggal
              </span>
              <span className="font-bold text-slate-800">
                {tracking.date || tracking.bookingDate || 'Hari Ini'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Banknote className="w-3.5 h-3.5 shrink-0" /> Total Pembayaran
              </span>
              <span className="font-extrabold text-[#046c7a] text-sm">
                Rp {(tracking.price || tracking.smartWage?.recommendedPrice || 50000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* TIMELINE STATUS PROGRES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
            Status Timeline Real-Time
          </h3>

          <div className="relative pl-6 space-y-5">
            {/* Vertical line connector */}
            <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-100" />

            {['WAITING_PAYMENT', 'ESCROW_PAID', 'WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'COMPLETED'].map((step, idx) => {
              const isActive = currentStep >= idx;
              const isCurrent = currentStep === idx;
              
              return (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  {/* Circle bullet */}
                  <div className={`absolute -left-[20px] w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    isCurrent 
                      ? 'bg-cyan-500 border-cyan-500 ring-4 ring-cyan-100 animate-pulse'
                      : isActive
                        ? 'bg-[#046c7a] border-[#046c7a]'
                        : 'bg-white border-slate-200'
                  }`} />
                  
                  <div>
                    <span className={`block font-extrabold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                      {getStepLabel(step)}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-600 font-bold block mt-0.5">Sedang Berlangsung</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANIC ALERT IF ENABLED */}
        {tracking.panic?.enabled && (
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex items-start gap-2.5">
            <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-rose-800">Tombol Panik Diaktifkan</h4>
              <p className="text-[10px] text-rose-700 font-semibold leading-relaxed mt-1">
                Pekerja mengaktifkan tombol darurat. Tim KerjaIn sedang memantau lokasi.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Review & Rating Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={handleReviewSubmit}
        reviewSubmitting={reviewSubmitting}
      />
    </MobileLayout>
  );
}
