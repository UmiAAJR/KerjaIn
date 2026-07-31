import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi, workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin, Calculator, FileText } from 'lucide-react';

export default function Booking() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [skill, setSkill] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(2); // default 2 jam
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const data = await workerApi.getProfile(workerId); // client can fetch worker profile too
        setWorker(data);
        const skillsList = data?.skills || data?.Worker_skill || [];
        if (skillsList.length > 0) {
          const firstSkill = skillsList[0]?.skillName || skillsList[0]?.skill?.categoryName || skillsList[0]?.name || 'Layanan Umum';
          setSkill(firstSkill);
        } else {
          setSkill('Layanan Umum');
        }
        // Pre-fill client profile address
        const clientProfile = await clientApi.getProfile();
        if (clientProfile && clientProfile.address) {
          setAddress(clientProfile.address);
        }
      } catch (err) {
        console.error('Gagal mengambil data pekerja:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [workerId]);

  const calculateEstimate = () => {
    if (!worker) return 0;
    const rate = Number(worker.hourlyRate || worker.hourly_rate || 35000);
    return rate * Number(hours);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!date || !time || !address || !description) {
      setError('Harap isi semua kolom wajib.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const estimate = calculateEstimate();
      const job = await clientApi.createBooking(
        workerId,
        date,
        time,
        address,
        description,
        estimate
      );
      const createdId = job?.jobId || job?.JobID || job?.id || 'job-latest';
      // Navigate to payment page
      navigate(`/client/booking/${createdId}/payment`);
    } catch (err) {
      setError(err.message || 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Form Pemesanan" }}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!worker) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Form Pemesanan" }}>
        <div className="text-center py-16 space-y-4">
          <p className="text-sm font-bold text-slate-500">Pekerja tidak ditemukan.</p>
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

  const skillsList = worker.skills || worker.Worker_skill || [];

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Pesan Jasa",
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#046c7a] hover:underline cursor-pointer"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span>Kembali ke Detail Pekerja</span>
          </button>

          {/* Mini Worker Profile Header */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3">
            <img
              src={worker.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
              alt={worker.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
            />
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{worker.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Tarif Jasa: Rp {(worker.hourlyRate || worker.hourly_rate || 35000).toLocaleString('id-ID')}/jam
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleBooking} className="space-y-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-2">Detail Pekerjaan</h2>

            {error && <div className="text-xs text-rose-500 font-bold">{error}</div>}

            {/* Keahlian Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Layanan / Skill Jasa</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all"
              >
                {skillsList.length === 0 ? (
                  <option value="Layanan Umum">Layanan Umum</option>
                ) : (
                  skillsList.map((s, i) => {
                    const skillName = s.skillName || s.skill?.categoryName || s.name || (typeof s === 'string' ? s : 'Layanan Umum');
                    return <option key={i} value={skillName}>{skillName}</option>;
                  })
                )}
              </select>
            </div>

            {/* Tanggal & Jam */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pilih Tanggal</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all"
                  />
                  <CalendarIcon size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Jam Mulai</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all"
                  />
                  <Clock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Durasi Jam Kerja */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estimasi Durasi Kerja</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>{h} Jam Kerja</option>
                ))}
              </select>
            </div>

            {/* Alamat Pekerjaan */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alamat Lengkap</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Detail lokasi pengerjaan jasa..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all"
                />
                <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deskripsi Masalah / Tugas</label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Ceritakan detail keluhan atau tugas yang perlu dikerjakan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all resize-none"
                />
                <FileText size={14} className="absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            {/* Estimasi Biaya */}
            <div className="bg-[#f0f9fa] border border-[#d2f3f5] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-900">
                <Calculator size={16} className="text-[#046c7a]" />
                <span>Estimasi Biaya</span>
              </div>
              <span className="font-black text-sm text-[#046c7a]">
                Rp {calculateEstimate().toLocaleString('id-ID')}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#046c7a] hover:bg-[#035f6b] disabled:bg-slate-300 text-white text-xs font-black rounded-2xl text-center shadow-md shadow-cyan-50 active:scale-[0.99] transition-all cursor-pointer"
            >
              {submitting ? 'Membuat Booking...' : 'Buat Pesanan Sekarang'}
            </button>
          </form>

        </div>
      </div>
    </MobileLayout>
  );
}
