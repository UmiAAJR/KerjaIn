import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  MessageSquare,
  BadgeAlert
} from 'lucide-react';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    clientApi.getWorkerDetail(id)
      .then(res => {
        setWorker(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <MobileLayout title="Detail Pekerja">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Detail Pekerja">
        <div className="p-5 text-center space-y-4">
          <p className="text-sm font-bold text-accent-600">{error}</p>
          <Button onClick={() => navigate(-1)}>Kembali</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Detail Pekerja">
      {/* Header back button */}
      <div className="px-5 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold"
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Worker Main Profile */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={worker.photo}
              alt={worker.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-lg"
            />
            {worker.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 bg-primary-600 text-white p-1 rounded-xl shadow-md border-2 border-white">
                <CheckCircle2 size={16} fill="currentColor" className="text-white" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 font-heading">{worker.name}</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">{worker.address}</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 py-3 px-6 bg-slate-50 rounded-2xl w-full">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
              <div className="flex items-center justify-center gap-0.5 mt-0.5 text-warning-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-black text-slate-800">{worker.rating}</span>
              </div>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pengalaman</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">{worker.experienceYear} Tahun</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Selesai</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">{worker.jobsDone} Order</p>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-primary-700 font-bold uppercase">Tarif Jasa Terdekat</p>
            <p className="text-base font-black text-primary-700">Rp{worker.hourlyRate.toLocaleString('id-ID')}/jam</p>
          </div>
          <span className="text-[10px] font-bold text-primary-600 bg-white px-3 py-1 rounded-full border border-primary-100 flex items-center gap-1">
            <Clock size={12} /> {worker.distance} km darimu
          </span>
        </div>

        {/* Skill list */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Keahlian Terdaftar</h4>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill) => (
              <span
                key={skill.skillId}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} className="text-primary-600" />
                {skill.skillName} ({skill.experienceLevel})
              </span>
            ))}
          </div>
        </div>

        {/* Bio Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Deskripsi Pekerjaan</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {worker.description}
          </p>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 font-heading">Ulasan Klien ({worker.reviews.length})</h4>
          {worker.reviews.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">Belum ada ulasan untuk pekerja ini.</p>
          ) : (
            <div className="space-y-3">
              {worker.reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{rev.clientName}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-warning-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "text-warning-500" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="pt-2 pb-6">
          <Button
            className="w-full text-center flex items-center justify-center gap-2"
            size="lg"
            onClick={() => navigate(`/client/booking/${worker.id}`)}
          >
            <Briefcase size={16} /> Pesan Pekerja Ini
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default WorkerDetail;
