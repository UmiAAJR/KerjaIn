import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import { useJobs } from '../../context/JobContext';
import MobileLayout from '../../components/layout/MobileLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ChevronLeft, Calendar, Clock, MapPin, AlignLeft, ShieldCheck, HelpCircle } from 'lucide-react';

const Booking = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useJobs();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [alamat, setAlamat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [durasiJam, setDurasiJam] = useState(2); // default 2 jam
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clientApi.getWorkerDetail(workerId)
      .then(res => {
        setWorker(res);
        // Pre-fill client address
        return clientApi.getProfile();
      })
      .then(profile => {
        setAlamat(profile.address);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [workerId]);

  const handleSubmitting = async (e) => {
    e.preventDefault();
    if (!tanggal || !jam || !alamat || !deskripsi) {
      setError('Harap lengkapi semua formulir pengisian');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const estimasiHarga = worker.hourlyRate * durasiJam;
      const job = await createBooking(workerId, tanggal, jam, alamat, deskripsi, estimasiHarga);
      
      // Direct user to Escrow payment screen for this job
      navigate(`/client/booking/${job.jobId}/payment`, { state: { job } });
    } catch (err) {
      setError(err.message || 'Pemesanan gagal dilakukan.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Buat Pemesanan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  const totalEstimasi = worker ? worker.hourlyRate * durasiJam : 0;

  return (
    <MobileLayout title="Buat Pemesanan">
      <div className="px-5 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold"
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* Worker Summary Card */}
        {worker && (
          <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl">
            <img 
              src={worker.photo} 
              alt={worker.name} 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-800">{worker.name}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">{worker.skills[0]?.skillName || 'Layanan Umum'}</p>
              <p className="text-[10px] text-primary-600 font-bold mt-1">Tarif: Rp{worker.hourlyRate.toLocaleString('id-ID')}/jam</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitting} className="space-y-4">
          {error && (
            <div className="bg-accent-50 text-accent-600 text-xs font-semibold p-3 rounded-xl border border-accent-100">
              {error}
            </div>
          )}

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Pekerjaan"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              id="booking-date"
            />
            <Input
              label="Jam Mulai"
              type="time"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              id="booking-time"
            />
          </div>

          {/* Duration Selector for Smart Wage calculation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 font-heading">
              Estimasi Durasi Kerja (Jam)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 8].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setDurasiJam(h)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all
                    ${durasiJam === h 
                      ? 'border-primary-600 bg-primary-50 text-primary-600' 
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'}`}
                >
                  {h} Jam
                </button>
              ))}
            </div>
          </div>

          {/* Address Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 font-heading">Alamat Lengkap Lokasi</label>
            <textarea
              rows={2}
              placeholder="Masukkan alamat pengerjaan..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          {/* Job Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 font-heading">Deskripsi Pekerjaan</label>
            <textarea
              rows={3}
              placeholder="Jelaskan secara detail masalah/kebutuhan Anda..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          {/* Smart Wage Wage Box */}
          <div className="p-4 bg-success-50/50 rounded-2xl border border-success-100 space-y-2">
            <div className="flex items-center gap-1 text-success-600">
              <ShieldCheck size={16} />
              <span className="text-xs font-extrabold font-heading">Transparansi Upah (Smart Wage)</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Biaya disesuaikan dengan tarif standar lokal worker. Tidak ada tawar-menawar yang tidak adil.
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-success-100">
              <span className="text-xs font-bold text-slate-600">Estimasi Total Upah:</span>
              <span className="text-sm font-black text-success-600">Rp{totalEstimasi.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full text-center flex justify-center py-3"
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default Booking;
