import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Mail, Phone, MapPin, CheckCircle, Save } from 'lucide-react';

const ClientProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);
    try {
      await clientApi.updateProfile({ name, email, phone, address });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Gagal memperbarui profil');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <MobileLayout title="Profil Klien">
      <div className="px-5 py-6 space-y-6">
        {/* Photo header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={user?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
          <p className="text-[10px] text-slate-400 font-semibold">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="bg-success-50 text-success-600 text-xs font-bold p-3.5 rounded-xl border border-success-100 flex items-center gap-2">
              <CheckCircle size={16} /> Profil berhasil diperbarui!
            </div>
          )}

          <Input
            label="Nama Lengkap"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="profile-name"
          />

          <Input
            label="Alamat Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="profile-email"
          />

          <Input
            label="Nomor Telepon"
            type="tel"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            id="profile-phone"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 font-heading">Alamat Default</label>
            <div className="relative">
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-sm font-medium border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100"
              />
            </div>
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

export default ClientProfile;
