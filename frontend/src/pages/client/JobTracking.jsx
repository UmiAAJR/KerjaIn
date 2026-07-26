import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { 
  Phone, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import TrackingMap from './components/TrackingMap';
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

  const fetchTracking = useCallback(async () => {
    try {
      const data = await clientApi.getJobTracking(jobId);
      setTracking(data);
    } catch (err) {
      console.error('Gagal memuat pelacakan:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTracking();

    // Poll status update every 5 seconds for simulated real-time updates
    const timer = setInterval(() => {
      fetchTracking();
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchTracking]);

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
    } catch (err) {
      alert('Gagal mengirim review: ' + err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusIndex = (currentStatus) => {
    const list = [
      'WAITING_PAYMENT',
      'ESCROW_PAID',
      'WORKER_ACCEPTED',
      'ON_THE_WAY',
      'IN_PROGRESS',
      'WAITING_CONFIRMATION',
      'COMPLETED'
    ];
    return list.indexOf(currentStatus);
  };

  const getStepLabel = (status) => {
    switch (status) {
      case 'WAITING_PAYMENT': return 'Booking Dibuat';
      case 'ESCROW_PAID': return 'Escrow Terbayar';
      case 'WORKER_ACCEPTED': return 'Pekerja Diterima';
      case 'ON_THE_WAY': return 'Dalam Perjalanan';
      case 'IN_PROGRESS': return 'Pengerjaan Jasa';
      case 'WAITING_CONFIRMATION': return 'Menunggu Konfirmasi';
      case 'COMPLETED': return 'Selesai & Lunas';
      default: return status;
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pelacakan Jasa" }}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!tracking) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Pelacakan Jasa" }}>
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

  const clientCoords = [-6.2088, 106.8456];
  const workerCoords = tracking.worker?.currentLatitude && tracking.worker?.currentLongtitude 
    ? [tracking.worker.currentLatitude, tracking.worker.currentLongtitude]
    : [-6.2120, 106.8400];

  const currentStep = getStatusIndex(tracking.status);

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Pelacakan Jasa",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24 text-left">
        
        {/* Map Container */}
        <TrackingMap
          clientCoords={clientCoords}
          workerCoords={workerCoords}
          workerName={tracking.worker.workerName}
          status={tracking.status}
        />

        {/* Details Content */}
        <div className="px-5 mt-4 space-y-4 relative z-10">
          
          {/* Worker Info Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#046c7a] font-bold text-sm">
                {tracking.worker.workerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{tracking.worker.workerName}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                  <Star size={11} className="fill-amber-400 text-amber-500" />
                  <span>{tracking.worker.rating} • ETA {tracking.worker.eta}</span>
                </p>
              </div>
            </div>
            
            <a
              href={`tel:${tracking.worker.phone}`}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-slate-600 transition-all"
            >
              <Phone size={14} />
            </a>
          </div>

          {/* Dynamic Actions Footer */}
          {tracking.status === 'WAITING_PAYMENT' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start gap-2 text-xs font-semibold text-slate-500 leading-relaxed">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Pemesanan telah dibuat. Segera selesaikan pembayaran escrow agar pekerja dapat menerima tawaran Anda.</span>
              </div>
              <button
                onClick={() => navigate(`/client/booking/${tracking.jobId}/payment`)}
                className="w-full py-3 bg-[#046c7a] hover:bg-[#035f6b] text-white text-xs font-black rounded-2xl text-center shadow-sm cursor-pointer transition-all"
              >
                Selesaikan Pembayaran Sekarang
              </button>
            </div>
          )}

          {tracking.status === 'WAITING_CONFIRMATION' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start gap-2 text-xs font-semibold text-slate-500 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Pekerja melaporkan pekerjaan telah selesai. Silakan konfirmasi untuk melepaskan dana escrow.</span>
              </div>
              <button
                onClick={handleConfirmFinished}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl text-center shadow-sm cursor-pointer transition-all"
              >
                Konfirmasi Pekerjaan Selesai
              </button>
            </div>
          )}

          {tracking.status === 'COMPLETED' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 tracking-tight">Transaksi Selesai</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Seluruh dana escrow telah dilepas ke pekerja.</p>
              </div>
            </div>
          )}

          {tracking.status === 'CANCELLED' && (
            <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-rose-800 tracking-tight">Pekerjaan Dibatalkan</h4>
                <p className="text-[10px] text-rose-400/90 font-semibold mt-0.5">Dana escrow akan diproses untuk pengembalian dana.</p>
              </div>
            </div>
          )}

          {/* Timeline Status */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
              Status Timeline Jasa
            </h3>

            <div className="relative pl-6 space-y-6">
              {/* Vertical line connector */}
              <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-100" />

              {['WAITING_PAYMENT', 'ESCROW_PAID', 'WORKER_ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'COMPLETED'].map((step, idx) => {
                const isActive = currentStep >= idx;
                const isCurrent = currentStep === idx;
                
                return (
                  <div key={idx} className="relative flex items-start gap-3 text-xs">
                    {/* Circle bullet */}
                    <div className={`absolute -left-[20px] w-3 h-3 rounded-full border-2 transition-all ${
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

          {/* Panic Status */}
          {tracking.panic.enabled && (
            <div className="bg-rose-50 rounded-3xl p-4 border border-rose-100 flex items-start gap-2.5">
              <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-rose-800 tracking-tight">Pekerja Mengaktifkan Tombol Panik!</h4>
                <p className="text-[10px] text-rose-700/90 font-semibold leading-relaxed mt-1">
                  Tombol panik darurat diaktifkan oleh pekerja. Tim admin kami sedang memantau dan menghubungi pihak darurat ({tracking.panic.emergencyPhone}) jika diperlukan.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Review & Rating Modal */}
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
