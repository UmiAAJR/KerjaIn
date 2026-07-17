import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi, workerApi } from '../../services/api';
import { useJobs } from '../../context/JobContext';
import MobileLayout from '../../components/layout/MobileLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Phone, 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle,
  PlayCircle
} from 'lucide-react';

const JobTracking = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { submitReview, submitReport, togglePanic } = useJobs();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('Tidak Datang');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Panic Alert State
  const [panicEnabled, setPanicEnabled] = useState(false);

  const fetchTracking = async () => {
    try {
      const res = await clientApi.getJobTracking(jobId);
      setTracking(res);
      setPanicEnabled(res.panic.enabled);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 4000); // Poll status
    return () => clearInterval(interval);
  }, [jobId]);

  const handlePanicToggle = async () => {
    const nextState = !panicEnabled;
    setPanicEnabled(nextState);
    try {
      await togglePanic(jobId, nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await submitReview(jobId, rating, comment);
      setIsReviewOpen(false);
      fetchTracking();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await submitReport(jobId, reportCategory, reportDescription);
      setIsReportOpen(false);
      alert('Laporan aduan berhasil dikirim ke Admin KerjaIn.');
    } catch (err) {
      alert(err.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Simulation controls to advance steps easily
  const simulateStatus = async (nextStatus) => {
    const jobs = JSON.parse(localStorage.getItem('ki_jobs')) || [];
    const idx = jobs.findIndex(j => j.jobId === jobId);
    if (idx !== -1) {
      jobs[idx].status = nextStatus;
      if (nextStatus === 'Finished') {
        jobs[idx].finishedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
      localStorage.setItem('ki_jobs', JSON.stringify(jobs));
      fetchTracking();
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Pelacakan Pekerjaan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !tracking) {
    return (
      <MobileLayout title="Pelacakan Pekerjaan">
        <div className="p-5 text-center space-y-4">
          <p className="text-sm font-bold text-accent-600">{error || 'Pekerjaan tidak ditemukan'}</p>
          <Button onClick={() => navigate('/client/dashboard')}>Kembali</Button>
        </div>
      </MobileLayout>
    );
  }

  const currentStatusIndex = tracking.progress.indexOf(tracking.status);

  return (
    <MobileLayout title="Pelacakan Pekerjaan">
      <div className="px-5 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/client/dashboard')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold"
        >
          <ChevronLeft size={16} /> Kembali
        </button>

        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase
          ${tracking.status === 'Finished' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700'}`}>
          {tracking.status}
        </span>
      </div>

      <div className="px-5 pb-8 space-y-6">
        
        {/* SIMULATION PANEL (Helper for Testing) */}
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold text-warning-800 uppercase tracking-wider flex items-center gap-1">
            <PlayCircle size={12} />
            Simulator Kontrol (Pengujian Mudah)
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button 
              onClick={() => simulateStatus('Worker Accepted')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700"
            >
              Terima Booking
            </button>
            <button 
              onClick={() => simulateStatus('On The Way')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700"
            >
              On The Way
            </button>
            <button 
              onClick={() => simulateStatus('In Progress')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700"
            >
              Start Kerja
            </button>
            <button 
              onClick={() => simulateStatus('Waiting Confirmation')}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700"
            >
              Selesai (Konfirm)
            </button>
          </div>
        </div>

        {/* Worker Info Card */}
        <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-slate-800 shrink-0 text-sm">
            {tracking.worker.workerName.charAt(0)}
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="text-sm font-bold text-slate-800">{tracking.worker.workerName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                <Phone size={10} /> {tracking.worker.phone}
              </span>
              <span className="text-[10px] text-warning-500 font-bold flex items-center gap-0.5">
                <Star size={10} fill="currentColor" /> {tracking.worker.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Map Location Mock & ETA */}
        {['Worker Accepted', 'On The Way', 'In Progress'].includes(tracking.status) && (
          <div className="bg-slate-200 h-32 rounded-2xl overflow-hidden relative border border-slate-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] bg-slate-950/70 text-white font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <MapPin size={12} className="text-primary-400" /> Worker sedang menuju lokasi Anda
              </span>
            </div>
            <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
              <Clock size={12} className="text-primary-600" />
              <span className="text-[10px] font-black text-slate-800">ETA: {tracking.worker.eta}</span>
            </div>
          </div>
        )}

        {/* Emergency Panic Button */}
        {['On The Way', 'In Progress'].includes(tracking.status) && (
          <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-accent-600" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 font-heading">Tombol Darurat (Panic)</h5>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Tekan jika Anda merasa terancam bahaya</p>
              </div>
            </div>
            <button
              onClick={handlePanicToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all
                ${panicEnabled 
                  ? 'bg-accent-600 text-white hover:bg-accent-700 animate-pulse' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-accent-600'}`}
            >
              {panicEnabled ? 'Aktif (112)' : 'Aktifkan'}
            </button>
          </div>
        )}

        {/* Job Tracking Timeline */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Status Pekerjaan</h4>
          
          <div className="space-y-4 pl-4 border-l border-slate-200 relative">
            {tracking.progress.map((step, idx) => {
              const isPast = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return (
                <div key={step} className="relative flex items-center gap-3">
                  {/* Circle Indicator */}
                  <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 
                    ${isCurrent ? 'bg-primary-600 border-primary-100 ring-2 ring-primary-100 animate-pulse' : ''}
                    ${isPast && !isCurrent ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-300'}`} 
                  />
                  <div className="flex-grow">
                    <p className={`text-xs font-bold ${isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step === 'Booking' && 'Pemesanan Diajukan'}
                      {step === 'Escrow Paid' && 'Escrow Dibayar (Dana Ditahan)'}
                      {step === 'Worker Accepted' && 'Pekerjaan Diterima Worker'}
                      {step === 'On The Way' && 'Pekerja OTW ke Lokasi'}
                      {step === 'In Progress' && 'Pekerjaan Mulai Dikerjakan'}
                      {step === 'Waiting Confirmation' && 'Pekerjaan Selesai (Menunggu Konfirmasi)'}
                      {step === 'Finished' && 'Selesai & Dana Dirilis'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          {tracking.status === 'Waiting Confirmation' && (
            <Button 
              className="w-full text-center flex justify-center py-3.5"
              onClick={() => setIsReviewOpen(true)}
            >
              <CheckCircle size={16} className="mr-2" /> Konfirmasi & Beri Review
            </Button>
          )}

          {tracking.status !== 'Finished' && (
            <Button 
              variant="outline" 
              className="w-full text-center flex justify-center py-3.5 text-accent-600 border-accent-100 hover:bg-accent-50"
              onClick={() => setIsReportOpen(true)}
            >
              <AlertTriangle size={16} className="mr-2" /> Laporkan Masalah
            </Button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Beri Penilaian & Rilis Dana"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Beri rating untuk layanan {tracking.worker.workerName}</p>
            <div className="flex justify-center gap-1.5 text-warning-400 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 active:scale-95 transition-all"
                >
                  <Star size={32} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "text-warning-500" : "text-slate-200"} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Ulasan Pekerjaan</label>
            <textarea
              rows={3}
              placeholder="Tulis ulasan tentang pekerja..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-center flex justify-center py-3"
            disabled={reviewSubmitting}
          >
            {reviewSubmitting ? 'Mengirim...' : 'Kirim & Rilis Escrow'}
          </Button>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Laporkan Masalah / Worker"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kategori Pelanggaran</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full text-sm font-semibold border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            >
              <option value="Tidak Datang">Pekerja Tidak Datang (No Show)</option>
              <option value="Kinerja Kasar">Perilaku Tidak Sopan / Kasar</option>
              <option value="Kerusakan Barang">Merusak Barang / Properti</option>
              <option value="Penipuan Harga">Biaya Tambahan Tidak Sesuai</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Jelaskan Masalah Anda</label>
            <textarea
              rows={4}
              placeholder="Deskripsikan kronologis kejadian..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            className="w-full text-center flex justify-center py-3"
            disabled={reportSubmitting}
          >
            {reportSubmitting ? 'Mengirim...' : 'Kirim Laporan Aduan'}
          </Button>
        </form>
      </Modal>
    </MobileLayout>
  );
};

export default JobTracking;
