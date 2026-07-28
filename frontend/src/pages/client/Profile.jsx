import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import { Mail, Phone, MapPin, Pen, LogOut, Check, Camera, Loader2, Lock } from 'lucide-react';
import Input from '../../components/ui/Input';
import MapPickerModal from '../../components/ui/MapPickerModal';

export default function ClientProfile() {
  const { logout } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: -6.2088, lng: 106.8456 });
  const [error, setError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

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

  const compressImage = (file, maxWidth = 500, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Harap pilih berkas gambar yang valid (JPG/PNG).');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    setSuccessMsg('');

    try {
      const compressedBase64 = await compressImage(file);
      await clientApi.updateProfile({ photo: compressedBase64 });
      const updatedData = await clientApi.getProfile();
      if (updatedData) {
        setProfile(updatedData);
        console.log("[DEBUG Frontend Success]: Foto profil berhasil diunggah!", {
          photoUrl: updatedData.photo,
          timestamp: new Date().toLocaleTimeString()
        });
        setSuccessMsg('Foto profil berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 4000);

        const cachedUser = localStorage.getItem('ki_user');
        if (cachedUser) {
          try {
            const userObj = JSON.parse(cachedUser);
            userObj.photo = updatedData.photo || compressedBase64;
            localStorage.setItem('ki_user', JSON.stringify(userObj));
          } catch (jsonErr) {
            console.error("Error parsing ki_user cache:", jsonErr);
          }
        }
      }
    } catch (err) {
      console.error("[DEBUG Frontend Error] Gagal mengunggah foto profil:", err);
      setError("Gagal mengunggah foto profil. Coba lagi.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!address) {
      setError('Alamat wajib diisi');
      return;
    }
    setError('');
    try {
      await clientApi.updateProfile({ 
        address,
        latitude: coords.lat,
        longitude: coords.lng
      });
      setProfile(prev => ({
        ...prev,
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
                <div className="relative group">
                  <img
                    src={profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={profile.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 bg-[#046c7a] hover:bg-[#035f6b] text-white rounded-full border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    title="Ubah Foto Profil"
                  >
                    {uploadingPhoto ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-black font-heading tracking-tight leading-tight">{profile.name}</h1>
              <p className="text-cyan-100/90 text-xs font-semibold mt-1">Client Platinum</p>
            </div>

            {/* Profile Detail Cards */}
            <div className="px-5 -mt-10 flex flex-col gap-4 z-10">
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-2xl shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Edit Alamat Utama</h3>
                    {error && <div className="text-xs text-rose-500 font-bold">{error}</div>}

                    {/* Disabled Name & Phone Fields */}
                    <div className="space-y-3 opacity-75">
                      <div className="relative">
                        <Input
                          label="Nama Lengkap (Tidak dapat diubah)"
                          type="text"
                          value={name}
                          disabled
                          className="bg-slate-100/80 cursor-not-allowed text-slate-500 font-medium"
                        />
                        <Lock size={13} className="absolute right-3 top-9 text-slate-400" />
                      </div>

                      <div className="relative">
                        <Input
                          label="Nomor Telepon (Tidak dapat diubah)"
                          type="text"
                          value={phone}
                          disabled
                          className="bg-slate-100/80 cursor-not-allowed text-slate-500 font-medium"
                        />
                        <Lock size={13} className="absolute right-3 top-9 text-slate-400" />
                      </div>
                    </div>

                    {/* Editable Address Field via MapPicker */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Utama (Lokasi Peta Leaflet)</label>
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
