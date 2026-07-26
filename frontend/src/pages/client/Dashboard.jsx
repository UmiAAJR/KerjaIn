import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import {
    Star,
    Compass,
    Wrench,
    ChevronRight,
    ShieldCheck,
    Zap,
    Brush,
    SlidersHorizontal,
    Wallet,
    Check,
    Car,
    SearchIcon
} from 'lucide-react';

const popularCategories = [
    { nama: 'Pertukangan', icon: Wrench, query: 'Buruh Harian' },
    { nama: 'Kelistrikan', icon: Zap, query: 'Instalasi Listrik' },
    { nama: 'Pembersihan', icon: Brush, query: 'Asisten Rumah Tangga' },
    { nama: 'Otomotif', icon: Car, query: 'Montir Panggilan' }
];

const ClientDashboard = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const mapWorkerDetails = (worker) => {
        return {
            ...worker,
            name: worker.name,
            roleName: worker.skills[0]?.skillName || 'Layanan Umum',
            distanceText: `${worker.distance} km`,
            priceText: `Rp ${(worker.hourlyRate / 1000)}rb/jam`,
            ratingVal: typeof worker.rating === 'number' ? worker.rating.toFixed(1) : '5.0',
            tags: worker.skills.map(s => s.skillName.toUpperCase()).slice(0, 2)
        };
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/client/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/client/search');
        }
    };

    if (loading) {
        return (
            <MobileLayout
                topNavProps={{
                    variant: "location",
                    hasNotification: true,
                }}
                bottomNavProps={{
                    activeTab: "home",
                }}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
                </div>
            </MobileLayout>
        )
    }
    return (
        <MobileLayout
            topNavProps={{
                variant: "location",
                hasNotification: true,
            }}
            bottomNavProps={{
                activeTab: "home",
            }}
        >
            <div className="px-5 pt-5 pb-8 space-y-6 relative">
                {/* Main Headline */}
                <div>
                    <h2 className="text-2xl font-black text-primary-600 font-heading tracking-tight leading-tight">
                        Butuh jasa apa hari ini?
                    </h2>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                        <SearchIcon size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Service AC, Tukang Kebun, atau Laundry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-[20px] py-4 pl-12 pr-4 text-xs font-semibold placeholder-slate-400 text-slate-800 shadow-xs focus:outline-none focus:border-[#046c7a] transition-all"
                    />
                </form>

                {/* Kategori Populer */}
                <div>
                    <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xl font-extrabold text-primary-600 font-heading">Kategori Populer</h3>
                        <button
                            onClick={() => navigate('/client/search')}
                            className="text-xs font-black text-primary-400 hover:underline"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {popularCategories.map((cat, idx) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => navigate(`/client/search?category=${encodeURIComponent(cat.query)}`)}
                                    className="flex flex-col items-center gap-2 cursor-pointer group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 group-hover:bg-[#d4f2f6] group-active:scale-95 flex items-center justify-center transition-all">
                                        <Icon size={22} className="stroke-[2.5]" />
                                    </div>
                                    <span className="text-[11px] font-medium text-primary-600 group-hover:text-slate-700 transition-colors">
                                        {cat.nama}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xl font-extrabold text-primary-600 font-heading">Pekerja Terdekat</h3>
                        <button
                            onClick={() => navigate('/client/search')}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <SlidersHorizontal size={16} className="stroke-[2.5]" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {data?.recommendedWorkers?.map((wItem) => {
                            const worker = mapWorkerDetails(wItem);
                            return (
                                <div
                                    key={worker.id}
                                    onClick={() => navigate(`/client/worker/${worker.id}`)}
                                    className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-xs hover:shadow-md hover:border-slate-200/80 active:scale-[0.99] transition-all duration-200 cursor-pointer relative"
                                >
                                    <div className="flex gap-4">
                                        <div className="relative shrink-0">
                                            <img
                                                src={worker.photo}
                                                alt={worker.name}
                                                className="w-16 h-16 rounded-[20px] object-cover border border-slate-100"
                                            />
                                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white flex items-center justify-center shadow-xs">
                                                <Check size={8} strokeWidth={4} />
                                            </span>
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-extrabold text-primary-600 line-clamp-1 leading-snug">
                                                    {worker.name}
                                                </h4>

                                                <div className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-0.5 shrink-0">
                                                    <Star size={11} fill="currentColor" className="stroke-amber-500 fill-amber-500" />
                                                    <span>{worker.ratingVal}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs font-bold text-primary-500 mt-0.5">
                                                {worker.roleName}
                                            </p>

                                            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold mt-2.5">
                                                <div className="flex items-center gap-1">
                                                    <Compass size={12} className="text-slate-400 stroke-[2.5]" />
                                                    <span>{worker.distanceText}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Wallet size={12} className="text-slate-400 stroke-[2.5]" />
                                                    <span>{worker.priceText}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100/80 my-3"></div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                            {worker.tags.map((tag, tagIdx) => (
                                                <span
                                                    key={tagIdx}
                                                    className="bg-slate-50 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/client/worker/${worker.id}`);
                                            }}
                                            className="text-xs font-black text-[#046c7a] hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <span>Profil</span>
                                            <ChevronRight size={14} className="stroke-[2.5] mt-0.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#046c7a] to-[#03525d] text-white rounded-[24px] p-5 flex gap-4 items-center shadow-xs border border-emerald-200/50">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-800 shadow-sm shrink-0">
                        <ShieldCheck size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black font-heading tracking-tight leading-tight">
                            Pekerja Terverifikasi
                        </h4>
                        <p className="text-xs text-teal-100/90 font-semibold mt-2 leading-relaxed">
                            Semua pekerja <span className="font-extrabold text-amber-300">KerjaIn</span> telah melalui proses verifikasi identitas dan sertifikasi keahlian.
                        </p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
};

export default ClientDashboard;