import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import { showAlert } from '../../utils/swal';
import MobileLayout from '../../components/layout/MobileLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';


import {
    Search as SearchIcon,
    SlidersHorizontal,
    Star,
    Compass,
    Check,
    ChevronDown,
    MessageSquare
} from 'lucide-react';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || '';

    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState(initialCategory);
    const [rating, setRating] = useState(0);
    const [radius, setRadius] = useState(10); // default 10km
    const [workers, setWorkers] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Sync category param change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory(searchParams.get('category') || '');
    }, [searchParams]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await clientApi.searchWorkers(keyword, rating, radius, category);
            setWorkers(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleSearch();
    }, [keyword, category, rating, radius, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const applyFilters = () => {
        setIsFilterOpen(false);
        handleSearch();
    };

    const resetFilters = () => {
        setRating(0);
        setRadius(10);
        setCategory('');
        setSearchParams({});
        setIsFilterOpen(false);
    };

    const mapSearchWorker = (worker) => {
        return {
            ...worker,
            roleName: worker.skills[0]?.skillName || 'Pekerja Serabutan',
            distanceText: `${worker.distance} km dari lokasi`,
            priceText: `Rp ${(worker.hourlyRate * 8).toLocaleString('id-ID')}/hari`,
            ratingVal: typeof worker.rating === 'number' ? worker.rating.toFixed(1) : '5.0',
            experience: `${worker.experienceYear || 2} Tahun`,
            verified: worker.verified
        };
    };

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
            {/* Main Content Area */}
            <div className="px-5 py-5 space-y-4 relative">
                {/* Search Bar Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                        <SearchIcon size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari pekerja (Tukang Kayu, Asisten, Teknisi...)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-white border border-slate-200/80 rounded-[20px] py-4 pl-12 pr-4 text-xs font-semibold placeholder-slate-400 text-slate-800 shadow-xs focus:outline-none focus:border-[#046c7a] transition-all"
                    />
                </div>

                {/* Filter Selection Row */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        {/* Radius Dropdown Select */}
                        <div className="relative">
                            <select
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-full py-2 pl-3 pr-7 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-[#046c7a] cursor-pointer"
                            >
                                <option value="1">Radius: 1 km</option>
                                <option value="2">Radius: 2 km</option>
                                <option value="5">Radius: 5 km</option>
                                <option value="10">Radius: 10 km</option>
                                <option value="20">Radius: 20 km</option>
                                <option value="50">Radius: 50 km</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2.5]" />
                        </div>

                        {/* Rating Dropdown Select */}
                        <div className="relative">
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-full py-2 pl-3 pr-7 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-[#046c7a] cursor-pointer"
                            >
                                <option value="0">Rating Min: Semua</option>
                                <option value="3">Rating Min: ★ 3.0+</option>
                                <option value="3.5">Rating Min: ★ 3.5+</option>
                                <option value="4">Rating Min: ★ 4.0+</option>
                                <option value="4.5">Rating Min: ★ 4.5+</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2.5]" />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-1 text-xs font-black text-[#046c7a] hover:underline cursor-pointer"
                    >
                        <SlidersHorizontal size={14} className="stroke-[2.5]" />
                        <span>Filter Lainnya</span>
                    </button>
                </div>

                {/* Selected Category Indicator */}
                {category && (
                    <div className="flex items-center justify-between bg-teal-50/50 text-[#046c7a] text-xs font-bold px-4 py-2.5 rounded-2xl border border-teal-100/50">
                        <span>Kategori: {category}</span>
                        <button
                            onClick={() => {
                                setCategory('');
                                setSearchParams({});
                            }}
                            className="text-xs hover:underline text-teal-800 font-black"
                        >
                            Hapus
                        </button>
                    </div>
                )}

                {/* Workers List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
                    </div>
                ) : workers.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-sm font-bold text-slate-400">Tidak ada pekerja yang ditemukan</p>
                        <p className="text-xs text-slate-400">Cobalah ubah filter pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="space-y-4 text-left">
                        {workers.map((wItem) => {
                            const worker = mapSearchWorker(wItem);
                            return (
                                <div
                                    key={worker.id}
                                    onClick={() => navigate(`/client/worker/${worker.id}`)}
                                    className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-xs hover:shadow-md hover:border-slate-200/80 active:scale-[0.99] transition-all duration-200 cursor-pointer relative"
                                >
                                    {/* Bottom Profile Area */}
                                    <div className="flex gap-4">
                                        {/* Left avatar with green verified overlay badge */}
                                        <div className="relative shrink-0">
                                            <img
                                                src={worker.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                                                alt={worker.name}
                                                className="w-14 h-14 rounded-full object-cover border border-slate-100"
                                            />
                                            {worker.verified && (
                                                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white flex items-center justify-center shadow-xs">
                                                    <Check size={8} strokeWidth={4} />
                                                </span>
                                            )}
                                        </div>

                                        {/* Right details */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 leading-snug">
                                                    {worker.name}
                                                </h4>

                                                {/* Gold rating tag */}
                                                <div className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-0.5 shrink-0">
                                                    <Star size={11} fill="currentColor" className="stroke-amber-500 fill-amber-500" />
                                                    <span>{worker.ratingVal}</span>
                                                </div>
                                            </div>

                                            {/* Subtitle / Role name */}
                                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                                                {worker.roleName}
                                            </p>

                                            {/* Distance info */}
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mt-2">
                                                <Compass size={12} className="text-slate-400 stroke-[2.5]" />
                                                <span>{worker.distanceText}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Experience Info Card Block */}
                                    <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex justify-between mt-3.5 text-slate-700">
                                        <div>
                                            <span className="text-[8px] font-black text-slate-400 tracking-wider block">TARIF MULAI</span>
                                            <span className="text-xs font-black text-slate-800">{worker.priceText}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-slate-400 tracking-wider block">PENGALAMAN</span>
                                            <span className="text-xs font-black text-slate-800">{worker.experience}</span>
                                        </div>
                                    </div>

                                    {/* Actions buttons */}
                                    <div className="flex items-center gap-2 mt-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/client/booking/${worker.id}`);
                                            }}
                                            className="flex-grow bg-[#046c7a] hover:bg-[#035f6b] text-white py-2.5 px-4 rounded-full text-xs font-black text-center transition-all cursor-pointer"
                                        >
                                            Pesan Sekarang
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showAlert('Fitur Chat', 'info', `Fitur Chat dengan ${worker.name} akan segera hadir!`);
                                            }}
                                            className="w-9 h-9 border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shrink-0"
                                            title="Kirim Pesan"
                                        >
                                            <MessageSquare size={16} className="stroke-[2.5]" />
                                        </button>

                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Pencarian"
            >
                <div className="space-y-6">
                    {/* Category Dropdown */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">Kategori</span>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSearchParams(e.target.value ? { category: e.target.value } : {});
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#046c7a]"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="Buruh Harian">Tukang</option>
                            <option value="Instalasi Listrik">Listrik</option>
                            <option value="Asisten Rumah Tangga">Kebersihan</option>
                            <option value="Perbaikan AC">AC Service</option>
                        </select>
                    </div>

                    {/* Rating Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Rating Minimum</span>
                            <span className="text-xs font-black text-amber-600 flex items-center gap-0.5">
                                {rating > 0 ? `★ ${rating}+` : 'Semua Rating'}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#046c7a]"
                        />
                    </div>

                    {/* Radius Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Radius Jarak (Hyperlocal)</span>
                            <span className="text-xs font-black text-[#046c7a]">{radius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#046c7a]"
                        />
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button variant="outline" className="flex-grow rounded-full py-3 text-xs font-extrabold" onClick={resetFilters}>
                            Reset
                        </Button>
                        <Button className="flex-grow bg-[#046c7a] hover:bg-[#035f6b] text-white rounded-full py-3 text-xs font-extrabold" onClick={applyFilters}>
                            Terapkan
                        </Button>
                    </div>
                </div>
            </Modal>

        </MobileLayout>
    )
}

export default Search