import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../../components/layout/MobileLayout";
import {
  Mail,
  Phone,
  Pen,
  Star,
  Shield,
  LogOut,
  Briefcase,
  User,
  CheckCircle2,
  Loader2
} from 'lucide-react';


export default function WorkerProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      const p = await workerApi.getProfile();
      setProfileData(p)
      setLoading(false)
    };

    fetchProfile();
  }, []);

  // HANDLER NAVIGASI & ACTION
  const handleEditProfile = () => {
    navigate('/worker/editprofile');
  };

  const handleVerify = () => {
    navigate('/worker/verification');
  };

  const handleLogout = () => {
    localStorage.clear(); // Bersihkan sesi login
    navigate('/login');
  };

  // TAMPILAN LOADING
  if (loading) {
    return (
      <MobileLayout topNavProps={{ variant: "location" }} bottomNavProps={{ activeTab: "profile" }}>
        <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#007088] mb-2" />
          <p className="text-xs font-medium">Memuat profil...</p>
        </div>
      </MobileLayout>
    );
  }


  const { name, email, phone, address, photo, hourlyRate } = profileData;

  return (
    <MobileLayout
      topNavProps={{
        variant: "location",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "profile",
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24">

        {/* 1. BAGIAN HEADER */}
        <div className="w-full bg-[#007088] pt-6 pb-16 px-6 text-white text-center shadow-md">
          <div className="flex justify-center mb-3">
            <img
              src={profileData.photo}
              alt={profileData.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-sm bg-white"
            />
          </div>

          <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>

          <div className="flex flex-wrap justify-center gap-2 mb-4 mt-2">
            {profileData?.skills?.length > 0 ? (
              profileData.skills.map((skillItem, index) => (
                <div
                  key={skillItem.id || skillItem.skillId || index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/30 rounded-full text-amber-200 text-xs font-medium"
                >
                  {/* Tampilkan Nama Skill (jika ada relasi ke tabel Skill) */}
                  <span>{skillItem.Skill?.name || skillItem.skillName || skillItem.name || 'Skill'}</span>

                  {/* Tampilkan Level Pengalaman */}
                  {skillItem.experienceLevel && (
                    <span className="opacity-70">({skillItem.experienceLevel})</span>
                  )}
                </div>
              ))
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/30 rounded-full text-amber-200 text-xs font-medium">
                <span>{(profileData?.hourlyRate)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs">
              <Mail className="w-3.5 h-3.5" />
              <span>{profileData.email}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs">
              <Phone className="w-3.5 h-3.5" />
              <span>{profileData.phone}</span>
            </div>

            <button
              onClick={handleEditProfile}
              className="mt-2 flex items-center gap-2 px-5 py-2 bg-[#fea619] hover:bg-[#e59516] active:scale-95 transition-all rounded-full text-white text-xs font-semibold shadow-sm"
            >
              <Pen className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>

        {/* CONTAINER KARTU UTAMA */}
        <div className="px-5 -mt-10 flex flex-col gap-4">

          {/* 2. KARTU ABOUT ME */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold text-sm">
              <User className="w-4 h-4 text-[#007088]" />
              <span>Tentang Saya</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {profileData.bio}
            </p>
          </div>

          {/* 3. KARTU STATISTIK */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl">
                <span className="text-gray-600 font-medium text-xs">Total Project</span>
                <span className="text-lg font-bold text-[#007088]">{profileData.totalProjects}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl">
                <span className="text-gray-600 font-medium text-xs">Rating Pekerja</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-gray-800">{profileData.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KARTU VERIFIKASI */}
          <div className="relative overflow-hidden bg-[#007088] rounded-2xl p-5 text-white shadow-lg flex items-end justify-between gap-3">
            <Shield className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 pointer-events-none stroke-[1.5]" />

            <div className="relative z-10 max-w-[60%]">
              <h2 className="text-lg font-bold mb-1">Verifikasi Akun</h2>
              <p className="text-xs text-cyan-100/80 leading-relaxed">
                {profileData.isVerified
                  ? "Akun Anda sudah terverifikasi resmi."
                  : "Lengkapi verifikasi KTP untuk akses fitur premium."}
              </p>
            </div>

            {profileData.isVerified ? (
              <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Terverifikasi
              </div>
            ) : (
              <button
                onClick={handleVerify}
                className="relative z-10 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#007088] transition-all hover:bg-slate-100 active:scale-95 shadow-sm"
              >
                Yuk Verifikasi
              </button>
            )}
          </div>

          {/* 5. LOGOUT */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 active:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-600">Keluar Akun</h3>
                  <p className="text-xs text-red-500/80">Keluar dari sesi saat ini</p>
                </div>
              </div>
            </button>
          </div>

        </div>

      </div>
    </MobileLayout>
  );
}