import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  User, 
  Phone, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Save,
  CreditCard
} from 'lucide-react';

const WorkerProfile = () => {
  const { user, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYear, setExperienceYear] = useState(0);
  const [bankAccount, setBankAccount] = useState('');
  const [ktpStatus, setKtpStatus] = useState('Not_Submitted');
  
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setBio(user.bio || '');
      setExperienceYear(user.experienceYear || 0);
      setBankAccount(user.bankAccount || '');
      setKtpStatus(user.ktpStatus || 'Not_Submitted');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);
    try {
      await workerApi.updateProfile(user.id, {
        name,
        phone,
        address,
        bio,
        experienceYear: Number(experienceYear),
        bankAccount
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan profil');
    } finally {
      setUpdating(false);
    }
  };

  const handleKtpSubmission = async () => {
    try {
      // Simulate uploading photos by submitting sample links and setting status to Pending
      await workerApi.updateProfile(user.id, {
        ktpStatus: 'Pending',
        ktpPhoto: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300',
        selfiePhoto: user.photo
      });
      await refreshProfile();
      alert('Dokumen verifikasi identitas (KTP) berhasil dikirim. Menunggu persetujuan Admin.');
    } catch (err) {
      alert('Gagal mengajukan verifikasi');
    }
  };

  return (
    <MobileLayout title="Profil Worker">
      <div className="px-5 py-6 space-y-6">
        {/* Photo Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={user?.photo}
            alt={name}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
          />
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1">
            {user?.name}
            {user?.verified && (
              <CheckCircle2 size={16} className="text-primary-600" />
            )}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold">{user?.email}</p>
        </div>

        {/* Verification Status Card */}
        <Card className="border p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Status Verifikasi KTP</span>
            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase
              ${ktpStatus === 'Verified' ? 'bg-success-100 text-success-700' : ''}
              ${ktpStatus === 'Pending' ? 'bg-warning-100 text-warning-700' : ''}
              ${ktpStatus === 'Not_Submitted' ? 'bg-slate-200 text-slate-600' : ''}
              ${ktpStatus === 'Rejected' ? 'bg-accent-100 text-accent-700' : ''}
            `}>
              {ktpStatus === 'Verified' && 'Terverifikasi'}
              {ktpStatus === 'Pending' && 'Menunggu Admin'}
              {ktpStatus === 'Not_Submitted' && 'Belum Diajukan'}
              {ktpStatus === 'Rejected' && 'Ditolak'}
            </span>
          </div>

          {ktpStatus === 'Not_Submitted' && (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Ajukan verifikasi identitas (KTP & Foto Selfie) untuk mendapatkan badge terverifikasi dan menarik lebih banyak pelanggan hyperlocal.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-center flex justify-center py-2"
                onClick={handleKtpSubmission}
              >
                <Camera size={14} className="mr-1.5" /> Upload KTP & Selfie
              </Button>
            </div>
          )}

          {ktpStatus === 'Pending' && (
            <p className="text-[10px] text-warning-600 font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} /> Dokumen sedang ditinjau oleh tim administrator.
            </p>
          )}

          {ktpStatus === 'Verified' && (
            <p className="text-[10px] text-success-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Selamat! Anda terverifikasi sebagai mitra tepercaya.
            </p>
          )}
        </Card>

        {/* Profile Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="bg-success-50 text-success-600 text-xs font-bold p-3.5 rounded-xl border border-success-100 flex items-center gap-2">
              <CheckCircle2 size={16} /> Profil berhasil disimpan!
            </div>
          )}

          <Input
            label="Nama Lengkap"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="worker-profile-name"
          />

          <Input
            label="Nomor Telepon"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            id="worker-profile-phone"
          />

          <Input
            label="Tahun Pengalaman Kerja"
            type="number"
            icon={Award}
            value={experienceYear}
            onChange={(e) => setExperienceYear(e.target.value)}
            id="worker-profile-exp"
          />

          <Input
            label="Nomor Rekening Bank (Withdraw)"
            icon={CreditCard}
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            id="worker-profile-bank"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 font-heading">Bio Singkat Jasa</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 font-heading">Alamat Opreasional</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-center flex justify-center py-3"
            disabled={updating}
          >
            <Save size={16} className="mr-2" />
            {updating ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default WorkerProfile;
