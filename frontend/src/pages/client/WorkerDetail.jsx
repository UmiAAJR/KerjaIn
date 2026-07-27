import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { ChevronLeft, Star, ShieldCheck, MapPin, Award, Phone } from 'lucide-react';

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await clientApi.getWorkerDetail(id);
        setWorker(data);
      } catch (err) {
        console.error('Gagal memuat detail worker:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Detail Pekerja" }}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!worker) {
    return (
      <MobileLayout topNavProps={{ variant: "brand", brandName: "Detail Pekerja" }}>
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

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Profil Pekerja",
        hasNotification: false,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24 text-left">
        
        {/* Banner Profil & Foto */}
        <div className="relative bg-[#046c7a] pt-6 pb-20 px-5 text-white flex flex-col items-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <img
            src={worker.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
            alt={worker.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-white/25 shadow-lg mb-3"
          />

          <div className="flex items-center gap-1">
            <h1 className="text-xl font-black font-heading tracking-tight">{worker.name}</h1>
            {worker.verified && <ShieldCheck size={18} className="text-cyan-300" />}
          </div>
          
          <p className="text-cyan-100/90 text-xs font-bold mt-0.5">
            {worker.skills[0]?.skillName || 'Pekerja Serabutan'}
          </p>
        </div>

        {/* Info Ringkas (Floating Card) */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Rating</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-slate-800 font-extrabold text-sm">
                <Star size={14} className="fill-amber-400 text-amber-500" />
                <span>{worker.rating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Pengalaman</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-slate-800 font-extrabold text-sm">
                <Award size={14} className="text-[#046c7a]" />
                <span>{worker.experienceYear || 0} Thn</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Selesai</p>
              <span className="block mt-1 text-slate-800 font-extrabold text-sm">
                {worker.jobsDone || 0} Order
              </span>
            </div>
          </div>
        </div>

        {/* Detail Konten */}
        <div className="px-5 mt-6 space-y-5">
          
          {/* Deskripsi */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-1.5">
              Tentang Pekerja
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              {worker.description || 'Pekerja terpercaya yang siap membantu kebutuhan Anda secara cepat dan profesional.'}
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500">
              <MapPin size={14} className="text-slate-400" />
              <span>{worker.address} ({worker.distance} km)</span>
            </div>
          </div>

          {/* Keahlian (Skills) & Tarif */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <div className="flex justify-between items-center mb-2 border-b border-slate-50 pb-1.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Keahlian & Tarif Jasa
              </h3>
              <span className="text-xs font-black text-[#046c7a]">
                Rp {worker.hourlyRate.toLocaleString('id-ID')}/jam
              </span>
            </div>
            {worker.skills.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold">Layanan Umum</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {worker.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 tracking-wide uppercase"
                  >
                    {skill.skillName} • {skill.experienceLevel}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ulasan Client (Reviews) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-1.5">
              Ulasan Terbaru
            </h3>
            {(!worker.reviews || worker.reviews.length === 0) ? (
              <p className="text-xs text-slate-400 font-bold py-2">Belum ada ulasan untuk pekerja ini.</p>
            ) : (
              <div className="space-y-4">
                {worker.reviews.map((rev) => (
                  <div key={rev.id} className="space-y-1.5 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-800 text-xs">{rev.clientName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-500 text-[10px] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer Button */}
          <div className="pt-2 flex gap-3">
            <a
              href={`tel:${worker.phone}`}
              className="px-4 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <Phone size={16} />
            </a>
            <button
              onClick={() => navigate(`/client/booking/${worker.id}`)}
              className="flex-grow py-3.5 bg-[#046c7a] hover:bg-[#035f6b] text-white text-xs font-black rounded-2xl text-center shadow-md active:scale-[0.99] transition-all cursor-pointer"
            >
              Pesan Pekerja Sekarang
            </button>
          </div>

        </div>
      </div>
    </MobileLayout>
  );
}
