import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Search as SearchIcon, SlidersHorizontal, Star, Compass, ShieldCheck } from 'lucide-react';

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
    handleSearch();
  }, [category, searchParams]);

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

  return (
    <MobileLayout title="Cari Pekerja">
      <div className="px-5 py-4 space-y-4">
        {/* Search Bar Row */}
        <div className="flex gap-2">
          <Input
            placeholder="Cari kelistrikan, pipa, cuci baju..."
            icon={SearchIcon}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            id="search-input"
            className="flex-grow"
          />
          <Button 
            variant="outline" 
            className="p-3 shrink-0 rounded-xl"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={18} />
          </Button>
        </div>

        {/* Selected Category Pill Indicator */}
        {category && (
          <div className="flex items-center justify-between bg-primary-50 text-primary-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-primary-100">
            <span>Kategori: {category}</span>
            <button 
              onClick={() => {
                setCategory('');
                setSearchParams({});
              }} 
              className="text-xs hover:underline text-primary-600 font-extrabold"
            >
              Hapus
            </button>
          </div>
        )}

        {/* Workers List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-400">Tidak ada pekerja yang ditemukan</p>
            <p className="text-xs text-slate-400">Cobalah ubah filter pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker) => (
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
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Pencarian"
      >
        <div className="space-y-6">
          {/* Rating Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Rating Minimum</span>
              <span className="text-xs font-black text-warning-600 flex items-center gap-0.5">
                {rating > 0 ? `${rating} Bintang+` : 'Semua Rating'}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.5"
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          {/* Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Radius Jarak (Hyperlocal)</span>
              <span className="text-xs font-black text-primary-600">{radius} km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" className="flex-grow" onClick={resetFilters}>
              Reset
            </Button>
            <Button className="flex-grow" onClick={applyFilters}>
              Terapkan
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  );
};

export default Search;
