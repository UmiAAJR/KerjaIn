import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import { 
  MapPin, 
  Star, 
  Map, 
  Compass, 
  Hammer, 
  Home as HomeIcon, 
  Wrench, 
  Construction, 
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const iconMap = {
  Hammer: Hammer,
  Home: HomeIcon,
  Wrench: Wrench,
  Construction: Construction,
  Layers: Layers
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.getDashboard()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <MobileLayout title="KerjaIn Klien">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="KerjaIn Klien">
      {/* Location Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-5 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-primary-100 font-bold uppercase tracking-wider">Lokasi Anda (Hyperlocal)</p>
            <p className="text-sm font-bold mt-0.5 line-clamp-1">{data?.location?.address}</p>
            <p className="text-[10px] text-primary-200 mt-0.5 font-medium">
              Lat: {data?.location?.latitude?.toFixed(4)}, Lng: {data?.location?.longitude?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 font-heading">Kategori Jasa</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {data?.categories?.map((cat) => {
              const Icon = iconMap[cat.icon] || Layers;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/client/search?category=${cat.nama}`)}
                  className="flex flex-col items-center gap-1.5 p-2 bg-white border border-slate-100 rounded-2xl hover:bg-primary-50 hover:border-primary-200 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <span className="text-[9px] font-bold text-center text-slate-600 leading-tight line-clamp-2">
                    {cat.nama}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended Workers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 font-heading">Rekomendasi Terdekat</h3>
            <button 
              onClick={() => navigate('/client/search')}
              className="text-xs font-bold text-primary-600 flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {data?.recommendedWorkers?.map((worker) => (
              <Card
                key={worker.id}
                hoverable
                onClick={() => navigate(`/client/worker/${worker.id}`)}
                className="flex items-center gap-4 border border-slate-100 hover:border-primary-100"
              >
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{worker.name}</h4>
                    {worker.verified && (
                      <ShieldCheck size={16} className="text-primary-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">
                    {worker.skills[0]?.skillName || 'Layanan Umum'}
                  </p>
                  
                  {/* Rating, Distance, Hourly Rate */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-0.5 text-warning-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold text-slate-700">{worker.rating}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                      <Compass size={11} />
                      <span>{worker.distance} km</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-primary-600">
                      Rp{worker.hourlyRate.toLocaleString('id-ID')}/jam
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ClientDashboard;
