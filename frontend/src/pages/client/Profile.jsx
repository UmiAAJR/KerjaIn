import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { Mail, Phone, MapPin, Pen, LogOut, Check } from 'lucide-react';
import Input from '../../components/ui/Input';
import MapPickerModal from '../../components/ui/MapPickerModal';

export default function ClientProfile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: -6.2088, lng: 106.8456 });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await clientApi.getProfile();
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phoneNumber || '');
        setAddress(data.address || '');
        if (data.latitude && data.longitude) {
          setCoords({ lat: Number(data.latitude), lng: Number(data.longitude) });
        }
      } catch (err) {
        console.error('Gagal memuat profil client:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('Semua kolom wajib diisi');
      return;
    }
    setError('');
    try {
      await clientApi.updateProfile({ 
        name, 
        phone, 
        address,
        latitude: coords.lat,
        longitude: coords.lng
      });
      setProfile(prev => ({
        ...prev,
        name,
        phoneNumber: phone,
        address,
        latitude: coords.lat,
        longitude: coords.lng
      }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui profil. Coba lagi.');
    }
  };

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        brandName: "Profil Saya",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "profile",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-20 text-left">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
          </div>
        ) : !profile ? (
          <div className="text-center py-16 text-slate-500">Profil tidak ditemukan.</div>
        ) : (
          <div className="flex flex-col">
            {/* Header Profil Banner */}
            <div className="w-full bg-[#046c7a] pt-8 pb-16 px-6 text-white text-center shadow-md relative">
              <div className="flex justify-center mb-3">
                <img
                  src={profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-md"
                />
              </div>

              <h1 className="text-2xl font-black font-heading tracking-tight leading-tight">{profile.name}</h1>
              <p className="text-cyan-100/90 text-xs font-semibold mt-1">Client Platinum</p>
            </div>

            {/* Profile Detail Cards */}
            <div className="px-5 -mt-10 flex flex-col gap-4 z-10">
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Edit Data Diri</h3>
                    {error && <div className="text-xs text-rose-500 font-bold">{error}</div>}

                    <Input
                      label="Nama Lengkap"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                    <Input
                      label="Nomor Telepon"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Alamat Utama (Lokasi Peta)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={address}
                          onClick={() => setIsMapOpen(true)}
                          placeholder="Pilih lokasi di peta..."
                          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-[#046c7a]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsMapOpen(true)}
                          className="bg-[#046c7a] hover:bg-[#035f6b] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer shadow-xs"
                        >
                          <MapPin size={15} />
                          <span>Peta</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-grow py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-grow py-2.5 bg-[#046c7a] hover:bg-[#035f6b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Check size={14} />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-slate-800 tracking-tight">Informasi Kontak</h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 text-xs font-black text-[#046c7a] hover:underline"
                      >
                        <Pen size={12} />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#046c7a] shrink-0">
                          <Mail size={16} />
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                          <span className="text-xs font-extrabold text-slate-700">{profile.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#046c7a] shrink-0">
                          <Phone size={16} />
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Telepon</span>
                          <span className="text-xs font-extrabold text-slate-700">{profile.phoneNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#046c7a] shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Alamat Utama</span>
                          <span className="text-xs font-extrabold text-slate-700 line-clamp-1">{profile.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keluar Akun Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100/60 border border-rose-100 text-rose-600 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition-all active:scale-[0.99]"
              >
                <LogOut size={16} />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Picker Modal for Location Editing */}
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={(loc) => {
          setAddress(loc.address);
          setCoords({ lat: loc.lat, lng: loc.lng });
        }}
      />
    </MobileLayout>
  );
}
